import fs from 'node:fs';
import path from 'node:path';

// Works on the unpacked and approved Knockout Deli demo only. The original
// interactive digital menu and its scripts remain intact on /menu.html.
const destination = path.resolve(process.argv[2] || '.output/public/demos/knockout-deli');
const source = path.resolve('demo-source/knockout-deli/landing');
const original = path.join(destination, 'index.html');
if (!fs.existsSync(original)) throw new Error('Knockout demo bundle is not unpacked');
const legacy = fs.readFileSync(original, 'utf8');
if (!legacy.includes('id="menu-grid"') || !legacy.includes('window-order.js')) {
  throw new Error('Existing digital menu is missing; refusing to replace');
}
// Keep the existing live-interaction demo and avoid disturbing its listeners.
let menu = legacy.replace('</head>', '  <link rel="stylesheet" href="./menu-only.css" />\n</head>');
menu = menu.replace('<main id="top">', `<div class="menu-route-bar"><a href="./index.html">BACK TO WEBSITE</a><span>EXPLORE THE DIGITAL MENU</span></div>\n  <main id="top">`);
menu = menu.replace(/<title>[^<]*<\/title>/, '<title>Knockout Deli — Digital Menu | Concept Preview</title>');
menu = menu.replace('href="#top" aria-label="Knockout Deli — home"','href="./index.html" aria-label="Knockout Deli — website home"');
fs.writeFileSync(path.join(destination, 'menu.html'), menu);
const textFiles = [['home.html','index.html'],['landing.css','landing.css'],['landing.js','landing.js'],['menu-only.css','menu-only.css']];
for (const [sourceName,destinationName] of textFiles) {
  const bytes = fs.readFileSync(path.join(source,sourceName));
  fs.writeFileSync(path.join(destination,destinationName),bytes);
}
for (const name of ['knockout-truck-event.webp','knockout-community.webp','knockout-live-music.webp']) {
  fs.copyFileSync(path.join(source,'assets',name),path.join(destination,'assets',name));
}
console.log('Knockout Deli: independent public landing and retained interactive digital menu');
