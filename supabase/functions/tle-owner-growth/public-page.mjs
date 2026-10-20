import { Buffer } from 'node:buffer';
import { publicURL, publicIPv4, robotsAllowed, analyzeHTML } from './core.mjs';

async function resolve(hostname) {
  const r=await fetch('https://dns.google/resolve?name='+encodeURIComponent(hostname)+'&type=A',{signal:AbortSignal.timeout(4000)});
  if(!r.ok)throw Error('Public DNS check unavailable.');
  const data=await r.json(),ips=(data.Answer||[]).filter(a=>a.type===1).map(a=>String(a.data));
  if(data.Status!==0||!ips.length||ips.some(ip=>!publicIPv4(ip)))throw Error('Public address could not be verified.');
  return ips[0];
}
export function decodeResponse(raw,max=180000) {
  const end=raw.indexOf('\r\n\r\n');
  if(end<0||end>16000)throw Error('Invalid or oversized public response headers.');
  const lines=raw.subarray(0,end).toString('ascii').split('\r\n'),match=lines.shift().match(/^HTTP\/1\.[01] (\d{3})\b/);
  if(!match)throw Error('Unsupported public response.');
  const headers={};for(const line of lines){const i=line.indexOf(':');if(i<1)throw Error('Invalid public response header.');const key=line.slice(0,i).trim().toLowerCase();if(headers[key]&&['content-length','transfer-encoding'].includes(key))throw Error('Ambiguous public response framing.');headers[key]=line.slice(i+1).trim()}
  if(headers['content-encoding']&&!/^identity$/i.test(headers['content-encoding']))throw Error('Compressed public responses are not scanned.');
  let body=raw.subarray(end+4);
  if(headers['transfer-encoding']){
    if(headers['transfer-encoding'].toLowerCase()!=='chunked')throw Error('Unsupported public response encoding.');
    const chunks=[];let pos=0,total=0,complete=false;
    while(pos<body.length){
      const e=body.indexOf('\r\n',pos);if(e<0||e-pos>128)throw Error('Invalid public chunk framing.');
      const token=body.subarray(pos,e).toString('ascii').split(';')[0];if(!/^[0-9a-f]+$/i.test(token))throw Error('Invalid public chunk size.');
      const n=parseInt(token,16);pos=e+2;if(n===0){complete=true;break}
      if(pos+n+2>body.length||body.subarray(pos+n,pos+n+2).toString()!=='\r\n')throw Error('Incomplete public response.');
      total+=n;if(total>max)throw Error('Page exceeds the safe scan size.');chunks.push(body.subarray(pos,pos+n));pos+=n+2;
    }
    if(!complete)throw Error('Incomplete public response.');body=Buffer.concat(chunks);
  }else if(headers['content-length']){
    if(!/^\d+$/.test(headers['content-length']))throw Error('Invalid public response size.');
    const n=Number(headers['content-length']);if(n>max||body.length<n)throw Error('Incomplete or oversized public response.');body=body.subarray(0,n);
  }
  if(body.length>max)throw Error('Page exceeds the safe scan size.');
  return {status:Number(match[1]),headers,body:body.toString('utf8')};
}
async function get(url,ip,max=180000) {
  // Supabase's Node compatibility layer does not implement ClientRequest.lookup.
  // Connect to the validated IP directly, then verify TLS against the ORIGINAL
  // hostname. No second DNS lookup, disabled certificate validation or redirects.
  let connection=null,expired=false,timer;
  const task=(async()=>{
    connection=await Deno.connect({hostname:ip,port:443});if(expired){connection.close();throw Error('Public page deadline exceeded.')}
    connection=await Deno.startTls(connection,{hostname:url.hostname,alpnProtocols:['http/1.1']});if(expired){connection.close();throw Error('Public page deadline exceeded.')}
    const wire=new TextEncoder().encode('GET '+url.pathname+' HTTP/1.1\r\nHost: '+url.hostname+'\r\nUser-Agent: TLEPublicResearch/1.0\r\nAccept: text/html,text/plain;q=0.8\r\nAccept-Encoding: identity\r\nConnection: close\r\n\r\n');
    for(let offset=0;offset<wire.length;){const n=await connection.write(wire.subarray(offset));if(!n)throw Error('Public request interrupted.');offset+=n}
    const parts=[];let total=0;const chunk=new Uint8Array(16384);
    while(true){const n=await connection.read(chunk);if(n===null)break;total+=n;if(total>max+24000)throw Error('Page exceeds the safe scan size.');parts.push(Buffer.from(chunk.subarray(0,n)))}
    return decodeResponse(Buffer.concat(parts),max);
  })();
  try{return await Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;try{connection?.close()}catch{}reject(Error('Public page deadline exceeded.'))},9000)})])}
  finally{clearTimeout(timer);try{connection?.close()}catch{}}
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
