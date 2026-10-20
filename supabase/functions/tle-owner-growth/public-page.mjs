import { request } from 'node:https';
import { Buffer } from 'node:buffer';
import { publicURL, publicIPv4, robotsAllowed, analyzeHTML } from './core.mjs';

// Pin the actual connection to the checked public IPv4 address. Redirects are not followed.
async function resolve(hostname) {
  const r=await fetch('https://dns.google/resolve?name='+encodeURIComponent(hostname)+'&type=A',{signal:AbortSignal.timeout(4000)});
  if(!r.ok)throw Error('Public DNS check unavailable.');
  const data=await r.json(),ips=(data.Answer||[]).filter(a=>a.type===1).map(a=>String(a.data));
  if(data.Status!==0||!ips.length||ips.some(ip=>!publicIPv4(ip)))throw Error('Public address could not be verified.');
  return ips[0];
}
function get(url,ip,max=180000) {
  return new Promise((accept,reject)=>{
    const req=request(url,{method:'GET',servername:url.hostname,lookup:(_h,_o,cb)=>cb(null,ip,4),
      headers:{'User-Agent':'TLEPublicResearch/1.0','Accept':'text/html,text/plain;q=0.8','Accept-Encoding':'identity'}},res=>{
      let size=0,parts=[];
      res.on('data',chunk=>{
        size+=chunk.length;
        if(size>max){req.destroy();reject(Error('Page exceeds the safe scan size.'));return}
        parts.push(chunk);
      });
      res.on('end',()=>accept({status:res.statusCode,headers:res.headers,body:Buffer.concat(parts).toString('utf8')}));
      res.on('error',reject);
    });
    req.setTimeout(7000,()=>req.destroy(Error('Public page request timed out.')));
    const timer=setTimeout(()=>req.destroy(Error('Public page deadline exceeded.')),9000);
    req.on('close',()=>clearTimeout(timer));req.on('error',reject);req.end();
  });
}
export async function inspectPage(value) {
  const url=publicURL(value),ip=await resolve(url.hostname);
  const robots=await get(new URL('/robots.txt',url),ip,60000);
  if(robots.status!==404&&robots.status!==410){
    if(robots.status!==200)throw Error('robots.txt could not be checked; scan skipped.');
    if(!robotsAllowed(robots.body,url.pathname))throw Error('This site disallows this automated scan.');
  }
  const result=await get(url,ip);
  if(result.status>=300&&result.status<400)throw Error('Page redirects. Use its final public HTTPS URL.');
  if(result.status!==200)throw Error('Public page returned HTTP '+result.status+'.');
  if(!String(result.headers['content-type']).toLowerCase().includes('text/html'))throw Error('Only public HTML pages can be scanned.');
  return analyzeHTML(result.body,url.href);
}
