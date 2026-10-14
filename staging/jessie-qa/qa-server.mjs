import http from "node:http";
import {readFile,stat} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
const BASE=resolve("/app/public"),MIME={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"application/javascript; charset=utf-8",".mjs":"application/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".txt":"text/plain; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 res.setHeader("X-Robots-Tag","noindex,nofollow,noarchive");res.setHeader("X-Content-Type-Options","nosniff");
 res.setHeader("Cache-Control","no-store");res.setHeader("Referrer-Policy","no-referrer");
 res.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://afyiltvdfqnuyzcqsnoh.supabase.co https://api.groq.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
 let uri;try{uri=new URL(req.url,"http://localhost")}catch{res.writeHead(400).end();return}
 if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405).end();return}
 let file=resolve(BASE,"."+decodeURIComponent(uri.pathname));
 if(file!==BASE&&!file.startsWith(BASE+sep)){res.writeHead(403).end();return}
 try{let st=await stat(file);if(st.isDirectory()){file=resolve(file,"index.html");st=await stat(file)}
   if(!st.isFile())throw Error("not a file");
   const data=await readFile(file);res.setHeader("Content-Type",MIME[extname(file)]||"application/octet-stream");
   res.writeHead(200).end(req.method==="HEAD"?undefined:data);
 }catch{res.writeHead(404).end("Not found")}
});
server.listen(Number(process.env.PORT||3000),"0.0.0.0",()=>console.log("Isolated Jessie QA preview listening"));
