// One-time import of the seven user-supplied full-resolution TLE website visuals.
// GitHub stores the verified originals; no dependency on a remote image host at runtime.
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const items=[
  [
    "website-la-vie-in-pink",
    "https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/0f2edcbe-1015-48d1-b4c6-ee683b7839f5.jpg",
    "47b049c88f5961f3bb10dc6b4204fb3449f389f684767c5d942f9b01d5c1f924"
  ],
  [
    "automated-crm",
    "https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/10177cf4-f488-4414-8aef-67ba4e59bd14.jpg",
    "0466e4028097ed4ef6214143bda1e77c6692b0485ce3f2bc7891c71056280e46"
  ],
  [
    "optional-app",
    "https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/716b109c-654d-4928-9b5b-dffef92e130b.jpg",
    "6df3337ea84d07ec1ad2405370fa0df695dc198d89300cf83ba4ce6b208a6bb3"
  ],
  [
    "process-choose",
    "https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/5598126e-df77-4b62-8bee-ee67f23b2b13.jpg",
    "6b83a530dedee563ebbc6e515ae168dd2534096efed20c1819f4762c048ec45d"
  ],
  [
    "process-brand",
    "https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/2829ecca-594a-4630-8b4d-29c4ccb920e2.jpg",
    "9c14c5651d674ad1273fefeed0644169322f65859a1bca9a24bf7758d319b6e4"
  ],
  [
    "process-build",
    "https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/49053d16-3116-4df5-bc21-95e7ab826580.jpg",
    "3373756fdb99d3c3f3bf6318bcc9a89b31c07e0352e6a3df77bc76b7f7e2a556"
  ],
  [
    "process-launch",
    "https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/ab6cdcc9-8411-4b4d-b9d9-6a65e00e5186.jpg",
    "0f4a518951e2cad990f41870897d0e87f19d0cfec26248ffd2fdf0843fc6cc4e"
  ]
];
const dir='public/assets/website-packages-20261105';
await mkdir(dir,{recursive:true});
for(const [name,url,expected] of items){
 const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw new Error(name+': image download HTTP '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length<200000||bytes.length>3000000||bytes[0]!==0xff||bytes[1]!==0xd8)
  throw new Error(name+': unexpected image payload');
 const actual=createHash('sha256').update(bytes).digest('hex');
 if(actual!==expected)throw new Error(name+': image checksum mismatch; refusing incorrect picture');
 const target=join(dir,name+'-original.jpg');
 await writeFile(target,bytes);
 console.log('Verified high-resolution image:',target,bytes.length,'bytes');
}
