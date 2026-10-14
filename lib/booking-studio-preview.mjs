/**
 * Booking Studio · PRIVATE HTML design preview renderer.
 * Produces a self-contained static visual review from a verified studio job.
 * It deliberately cannot submit bookings, fetch customer records, send email or publish.
 * Caller must keep generated HTML private and enforce owner authentication on delivery.
 */
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cssColor=x=>/^#[0-9a-f]{6}$/i.test(x||"")?x:"#191919";
const safeUrl=x=>{try{const u=new URL(x);return u.protocol==="https:"&&!u.username&&!u.password?u.href:""}catch{return ""}};
const allowedLayouts=new Set(["editorial","immersive","split","minimal"]);
const allowedCards=new Set(["photographic","editorial","compact","tiles"]);
const fonts={elegant:'Georgia, "Times New Roman", serif',modern:'"Avenir Next", Arial, sans-serif',friendly:'"Trebuchet MS", Arial, sans-serif'};
const sectionLabels={services:"Services",benefits:"Why choose us",process:"How it works",booking:"Request a booking",reviews:"Reviews"};
function photo(photos,usage){return photos.find(p=>p.usage===usage)||photos.find(p=>p.usage==="hero")||photos[0]}
function sections(job,design){
 const business=esc(job.client.business_name);
 const services=job.client.services.map(s=>`<article class="service-card"><span class="mini">SERVICE</span><h3>${esc(s.name)}</h3><p>${s.mode==="flat"&&Number.isFinite(s.price)?`From $${esc(s.price.toFixed(2))} · Preview only`:"Personalized estimate · Preview only"}</p></article>`).join("");
 const serviceBlock=`<section class="section" id="services"><div class="section-intro"><span class="mini">WHAT WE DO</span><h2>Cleaning that fits your day.</h2><p>Explore the services available from ${business}.</p></div><div class="service-grid ${esc(design.cards)}">${services}</div></section>`;
 const benefits=`<section class="section benefits"><span class="mini">OUR APPROACH</span><h2>Care for the spaces that matter.</h2><p>Clear service options and a straightforward way to request your next cleaning.</p></section>`;
 const process=`<section class="section" id="process"><span class="mini">THE PROCESS</span><h2>Simple from the start.</h2><div class="steps"><article><b>01</b><h3>Choose a service</h3><p>Pick the cleaning that fits your space.</p></article><article><b>02</b><h3>Share your details</h3><p>Tell us what you need and where.</p></article><article><b>03</b><h3>Confirm together</h3><p>Receive the next steps from the team.</p></article></div></section>`;
 const booking=`<section class="section booking" id="booking"><div><span class="mini">NEXT STEP</span><h2>Ready for a cleaner space?</h2><p>Bookings and quotes are disabled in this private design preview. They will be connected to the verified client booking system after approval and testing.</p></div><span class="fake-button" aria-label="Booking unavailable in design preview">Booking disabled in preview</span></section>`;
 // Reviews are never fabricated. Their section is omitted until sourced, owner-approved reviews exist.
 const blocks={services:serviceBlock,benefits,process,booking};
 const order=[...new Set([...(design.section_order||[]),"services","booking"])].filter(x=>blocks[x]);
 return order.map(x=>blocks[x]).join("");
}
export function renderBookingStudioPreview(job,{watermark="PRIVATE DESIGN PREVIEW"}={}){
 if(!job||!job.client||!job.design||!job.research||!job.tenant_id||!job.order_id)throw Error("Verified research, tenant and creative design required");
 if(!["development","qa","owner_review","approved"].includes(job.stage))throw Error("Job not ready for design preview");
 const d=job.design,c=job.client;
 if(!allowedLayouts.has(d.layout)||!allowedCards.has(d.cards)||!fonts[d.typography])throw Error("Unsupported design profile");
 const p=photo(d.photos||[],"hero"),hero=safeUrl(p?.url);
 if(!hero||!p?.license)throw Error("Licensed hero image required");
 const business=esc(c.business_name),headline=esc(d.hero_title),body=esc(d.hero_body);
 const ink=cssColor(d.primary_color),accent=cssColor(d.accent_color);
 const mode=esc(d.layout),card=esc(d.cards),font=fonts[d.typography];
 const style=`
 :root{--ink:${ink};--accent:${accent};--ivory:#faf8f3;--muted:#5d6d77;--line:#dbe6ec}
 *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--ivory);color:#191919;font-family:"Avenir Next",Arial,sans-serif;-webkit-font-smoothing:antialiased}
 .banner{position:sticky;top:0;z-index:10;background:#191919;color:#fff;text-align:center;padding:10px 18px;font-size:11px;font-weight:700;letter-spacing:.16em}
 .container{max-width:1220px;margin:auto;padding:0 clamp(16px,3vw,40px)}
 .nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:23px 0;flex-wrap:wrap}
 .brand{font-size:clamp(14px,1.6vw,19px);font-weight:800;letter-spacing:.04em;overflow-wrap:anywhere}
 .navlinks{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
 a{color:inherit;text-decoration:none}a:hover{text-decoration:underline}
 .pill{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:var(--ink);color:#fff;padding:14px 22px;font-weight:700;font-size:13px;min-height:48px}
 .hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);min-height:570px;border-radius:30px;overflow:hidden;background:#eaf3f8}
 .hero-copy{position:relative;z-index:1;padding:clamp(30px,5vw,74px);display:flex;flex-direction:column;justify-content:center;gap:20px}
 .eyebrow,.mini{font-size:11px;letter-spacing:.17em;font-weight:800;text-transform:uppercase}
 .hero h1,h2{font-family:${font};font-weight:500;letter-spacing:-.045em;line-height:1.08;text-wrap:balance}
 .hero h1{font-size:clamp(40px,5vw,76px);margin:0;overflow-wrap:anywhere}
 .hero p{font-size:clamp(15px,1.4vw,18px);line-height:1.75;color:#3f5260;max-width:540px;margin:0}
 .hero-photo{min-height:500px;background-image:url("${hero.replace(/["\\]/g,"")}");background-size:cover;background-position:center}
 .hero.immersive{display:flex;align-items:flex-end;color:#fff;min-height:620px;background-image:linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.15)),url("${hero.replace(/["\\]/g,"")}");background-size:cover;background-position:center}
 .hero.immersive .hero-copy{max-width:850px;min-height:620px}
 .hero.immersive .hero-photo{display:none}.hero.immersive p{color:#f0f0f0}
 .hero.editorial{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)}
 .hero.minimal{grid-template-columns:1fr;background:#f0f6fa}.hero.minimal .hero-photo{display:none}
 .hero.split .hero-photo{clip-path:ellipse(95% 95% at 95% 50%)}
 .section{padding:clamp(55px,7vw,95px) 0}
 .section-intro{max-width:670px;margin-bottom:30px}.section h2{font-size:clamp(34px,4vw,55px);margin:14px 0}.section p{line-height:1.7;color:#526471}
 .service-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
 .service-card,.steps article{border:1px solid var(--line);background:#fff;border-radius:22px;padding:clamp(22px,3vw,34px);box-shadow:0 14px 36px #1b41520a;min-width:0}
 .service-card h3{font-size:clamp(19px,2vw,25px);margin:20px 0 8px;overflow-wrap:anywhere}
 .service-card p{margin:0;font-size:13px}
 .service-grid.compact{grid-template-columns:repeat(2,minmax(0,1fr))}
 .service-grid.editorial .service-card:nth-child(2n){background:#f0f7fb}
 .service-grid.tiles .service-card:first-child{background:var(--accent)}
 .benefits{padding:clamp(34px,6vw,80px);border-radius:26px;background:#e9f4fa}
 .steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
 .steps b{color:#6d8ca0;font-size:14px}.steps h3{margin:18px 0 6px}.steps p{margin:0}
 .booking{background:#e9f4fa;border-radius:26px;padding:clamp(30px,5vw,65px);display:flex;justify-content:space-between;align-items:center;gap:30px}
 .booking>div{max-width:680px}.fake-button{background:#191919;color:#fff;border-radius:999px;padding:15px 23px;font-weight:700;font-size:13px;text-align:center}
 footer{padding:40px 0 65px;font-size:12px;color:#526471}
 @media(max-width:850px){.hero{grid-template-columns:1fr}.hero-photo{min-height:360px}.hero.split .hero-photo{clip-path:none}.hero.immersive .hero-copy{min-height:550px}.service-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:600px){.nav{padding:17px 0}.navlinks{gap:10px;font-size:12px}.hero{border-radius:22px}.hero-copy{padding:28px 24px;gap:17px}.hero h1{font-size:clamp(36px,9vw,49px)}.hero-photo{min-height:280px}.hero.immersive,.hero.immersive .hero-copy{min-height:520px}.service-grid,.service-grid.compact,.steps{grid-template-columns:1fr}.booking{display:block}.fake-button{display:block;margin-top:20px}.section{padding:50px 0}.benefits{padding:30px 23px}}
 @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
 `;
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><title>${business} · Private Booking Page Design Review</title><style>${style}</style></head><body>
 <div class="banner">${esc(watermark)} · NOT LIVE · NO BOOKINGS ACCEPTED</div>
 <div class="container"><nav class="nav"><strong class="brand">${business}</strong><div class="navlinks"><a href="#services">Services</a><a href="#process">How it works</a><a class="pill" href="#booking">Request cleaning</a></div></nav>
 <main><section class="hero ${mode}"><div class="hero-copy"><span class="eyebrow">PERSONALIZED CLEANING EXPERIENCE</span><h1>${headline}</h1><p>${body}</p><div><a class="pill" href="#services">Explore services</a></div></div><div class="hero-photo" role="img" aria-label="Licensed cleaning business hero image"></div></section>
 ${sections(job,d)}</main><footer>Design review for ${business}. This page is not a booking service. &copy; ${new Date().getUTCFullYear()}.</footer></div></body></html>`;
}
