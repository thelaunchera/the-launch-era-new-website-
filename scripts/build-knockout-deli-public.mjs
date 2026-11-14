import fs from 'node:fs';
import path from 'node:path';
import {refreshMenu} from './refresh-knockout-menu.mjs';
import {upgradeKnockoutPickup} from './upgrade-knockout-pickup.mjs';

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

// The public site opens this menu via a button; do not promote QR scanning.
// Preserve legacy deep links and the existing cart/pickup demo behavior.
const withoutQrCopy = text => {
  const labels = [
    [/PICKUP AT THE TRUCK\s*\/\s*QR MENU/gi, 'PICKUP AT THE TRUCK / DIGITAL MENU'],
    [/AT THE SERVICE WINDOW\s*\/\s*QR MENU/gi, 'PICKUP AT THE TRUCK / DIGITAL MENU'],
    [/EN LA VENTANILLA\s*\/\s*MENÚ QR/gi, 'EN LA VENTANILLA / MENÚ DIGITAL'],
    [/QR MENU/gi, 'DIGITAL MENU'],
    [/MENÚ QR/gi, 'MENÚ DIGITAL'],
    [/SCAN THE QR/gi, 'OPEN THE MENU'],
    [/ESCANEA EL QR/gi, 'ABRE EL MENÚ'],
    [/SCAN THE CODE/gi, 'OPEN THE MENU'],
    [/ESCANEA EL CÓDIGO/gi, 'ABRE EL MENÚ'],
    [/OPEN THE QR/gi, 'OPEN THE MENU'],
    [/ABRE EL QR/gi, 'ABRE EL MENÚ'],
    [/QR CODE/gi, 'DIGITAL MENU'],
    [/CÓDIGO QR/gi, 'MENÚ DIGITAL'],
    [/\bSCAN\./g, 'OPEN.'],
    [/\bESCANEA\./g, 'ABRE.']
  ];
  return labels.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
};
menu = withoutQrCopy(menu);
const windowOrderFile = path.join(destination, 'window-order.js');
fs.writeFileSync(windowOrderFile, withoutQrCopy(fs.readFileSync(windowOrderFile, 'utf8')));

fs.writeFileSync(path.join(destination, 'menu.html'), menu);
const textFiles = [['home.html','index.html'],['landing.css','landing.css'],['landing.js','landing.js'],['menu-only.css','menu-only.css']];
for (const [sourceName,destinationName] of textFiles) {
  const bytes = fs.readFileSync(path.join(source,sourceName));
  fs.writeFileSync(path.join(destination,destinationName),bytes);
}
for (const name of ['knockout-truck-event.webp','knockout-community.webp','knockout-live-music.webp']) {
  fs.copyFileSync(path.join(source,'assets',name),path.join(destination,'assets',name));
}
refreshMenu(destination,source);
upgradeKnockoutPickup(destination);
// Both the public menu and the browser-only Admin Panel read this approved
// catalog. Copy source files for standalone QA and for published Pages.
const adminPreviewDir = path.join(destination,'admin-panel');
const adminPreviewSource = path.join(source,'admin-panel');
fs.mkdirSync(adminPreviewDir,{recursive:true});
for (const name of ['index.html','app.js']) {
  const from=path.join(adminPreviewSource,name);
  if (!fs.existsSync(from)) throw new Error('Knockout Admin Panel source missing: '+name);
  fs.copyFileSync(from,path.join(adminPreviewDir,name));
}
fs.copyFileSync(path.join(source,'menu-catalog.json'),path.join(adminPreviewDir,'menu-catalog.json'));
console.log('Knockout Deli: independent public landing and retained interactive digital menu');
