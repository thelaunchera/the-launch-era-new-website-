#!/usr/bin/env node
/**
 * Build an owner-review HTML artifact from a LOCAL verified Booking Studio job JSON.
 * No network, deployment, emails or customer writes. Output directory must be private.
 */
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,dirname} from "node:path";
import {renderBookingStudioPreview} from "../lib/booking-studio-preview.mjs";
const [input,output]=process.argv.slice(2);
if(!input||!output){console.error("Usage: node scripts/build-booking-studio-preview.mjs <verified-job.json> <private-output.html>");process.exit(2)}
try{
 const job=JSON.parse(await readFile(resolve(input),"utf8"));
 const html=renderBookingStudioPreview(job);
 const out=resolve(output);
 await mkdir(dirname(out),{recursive:true});
 await writeFile(out,html,{encoding:"utf8",mode:0o600,flag:"wx"});
 console.log("Private Booking Studio design preview created. NOT PUBLISHED.");
}catch(e){console.error("Preview not created:",e.message);process.exitCode=1}
