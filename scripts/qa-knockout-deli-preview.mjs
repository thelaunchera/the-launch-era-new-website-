import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.argv[2] || '.output/public/demos/knockout-deli');
const needed = ['index.html','styles.css','app.js', ...[
  '01-hero-pastrami','02-menu-spread','03-pastrami-prep',
  '04-customer-experience','05-breakfast-sandwich',
  '06-cheesesteak-grill','07-order-online','08-real-truck-location',
  'logo-knockout-deli-transparent'
].map(name => 'assets/'+name+'.webp')];
const fail = (message) => { console.error('Knockout preview QA:', message); process.exitCode=1; };
for(const rel of needed){const filepath=path.join(root,rel); if(!fs.existsSync(filepath) || !fs.statSync(filepath).size) fail('Missing or empty '+rel);}
if(process.exitCode) process.exit();
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const js = fs.readFileSync(path.join(root,'app.js'),'utf8');
const css = fs.readFileSync(path.join(root,'styles.css'),'utf8');
if(/<script[^>]+supabase|href=["'][^"']*admin|command-center|id=["']admin-/i.test(html)) fail('Unexpected live admin/login access');
if(!js.includes('events: []')) fail('Unconfirmed event dates must remain absent');
if(/\bfetch\s*\(|XMLHttpRequest|localStorage\s*\./.test(js)) fail('Client concept unexpectedly performs network writes or persistence');
for(const section of ['menu','events','find-us','catering','order','follow']) if(!html.includes('id="'+section+'"')) fail('Missing public section: '+section);
if(!html.includes('https://www.doordash.com/store/42538456')) fail('DoorDash option is missing');
if(!html.includes('NOT AN OFFICIAL BUSINESS WEBSITE')) fail('Missing concept disclosure');
if(needed.filter(x=>x.endsWith('.webp')).some(x=>fs.statSync(path.join(root,x)).size>400000))fail('Image not optimized');
if(css.length<10000 || js.length<5000) fail('Truncated styles or interactivity');
if(!process.exitCode) console.log('Knockout Deli standalone preview QA passed,',needed.length,'files');
