#!/usr/bin/env node
/**
 * AI Developer private build packet, NOT a deployable booking site.
 * Reads a verified, tenant-scoped job from disk. Writes only local private files.
 * Never sends customer data, touches live accounts, publishes, or invokes booking APIs.
 */
import {readFile,mkdir,writeFile,chmod,stat} from "node:fs/promises";
import {resolve,join,relative,isAbsolute} from "node:path";
import {createHash} from "node:crypto";
import {planBookingBuild} from "../lib/booking-studio-developer-plan.mjs";
import {renderBookingStudioPreview} from "../lib/booking-studio-preview.mjs";
const [input,outRoot,tenantId]=process.argv.slice(2);
if(!input||!outRoot||!tenantId){console.error("Usage: node scripts/build-booking-studio-private-packet.mjs <verified-job.json> <private-output-root> <verified-tenant-id>");process.exit(2)}
const fail=message=>{console.error("Private build packet not created:",message);process.exitCode=1};
try{
 const job=JSON.parse(await readFile(resolve(input),"utf8"));
 const plan=planBookingBuild(job,tenantId);
 if(!plan.ok)throw Error(plan.reason);
 const root=resolve(outRoot);
 // Hash tenant/order identifiers; do not put raw names or IDs in directory names.
 const slug=createHash("sha256").update(tenantId+"\0"+job.order_id).digest("hex").slice(0,24);
 const directory=join(root,"tenant-"+slug);
 if(relative(root,directory).startsWith("..")||isAbsolute(relative(root,directory)))throw Error("invalid output path");
 await mkdir(root,{recursive:true,mode:0o700});
 await mkdir(directory,{recursive:false,mode:0o700});
 await chmod(directory,0o700);
 const preview=renderBookingStudioPreview(job);
 const manifest={
  format:"tle-booking-studio-private-packet-v1",tenant_id:tenantId,order_id:job.order_id,
  published:false,customer_notified:false,release_approved:false,
  visual_preview_only:true,verified_functional_integrations:0,
  files:["private-preview.html","developer-plan.json","manifest.json"],
  sha256_preview:createHash("sha256").update(preview).digest("hex")
 };
 const files=[["private-preview.html",preview],["developer-plan.json",JSON.stringify(plan,null,2)],["manifest.json",JSON.stringify(manifest,null,2)]];
 for(const [name,content] of files){const path=join(directory,name);await writeFile(path,content,{flag:"wx",mode:0o600});await chmod(path,0o600)}
 const mode=(await stat(directory)).mode&0o777;
 if(mode!==0o700)throw Error("private directory permission mismatch");
 console.log("Private AI Developer build packet created (NOT DEPLOYED): "+directory);
}catch(e){fail(e.message)}
