// Public-page observations, never instructions or proof that a booking flow works.
import { isIP } from 'node:net';
export const uuid = v => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));
export const clean = (v, n = 300) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
export function publicIPv4(ip) {
  if (isIP(ip) !== 4) return false;
  const [a,b,c] = ip.split('.').map(Number);
  return !(a===0 || a===10 || a===127 || a>=224 || (a===100&&b>=64&&b<=127) ||
    (a===169&&b===254) || (a===172&&b>=16&&b<=31) || (a===192&&(b===168||b===0||b===88)) ||
    (a===198&&(b===18||b===19||(b===51&&c===100))) || (a===203&&b===0&&c===113));
}
export function publicURL(value) {
  const raw=String(value||'');
  if(raw.length>600 || /[\s<>"'\\]/.test(raw)) throw Error('Use a public HTTPS page without access tokens.');
  const u=new URL(raw),h=u.hostname.toLowerCase();
  if(u.protocol!=='https:'||u.port&&u.port!=='443'||u.username||u.password||isIP(h)||h.includes(':')||
    !h.includes('.')||!h.split('.').every(p=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(p))||
    /\.(local|internal|localhost|test|invalid|example|onion)$/.test(h)||/^metadata\./.test(h)||
    /\.(supabase\.(co|com)|amazonaws\.com|googleapis\.com)$/.test(h)) throw Error('Only public business websites are supported.');
  if(u.search) throw Error('Remove query parameters and access tokens from the URL.');
  u.hash='';return u;
}
export function textOnly(s) {
  return String(s).replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
    .replace(/<!--[\s\S]*?-->/g,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ')
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
}
export function robotsAllowed(body, path) {
  const groups=[]; let agents=[],rules=[],inRules=false;
  const flush=()=>{if(agents.length)groups.push({agents,rules});agents=[];rules=[];inRules=false};
  for(const raw of String(body).split(/\r?\n/)){
    const line=raw.split('#')[0].trim(),i=line.indexOf(':');if(i<0)continue;
    const key=line.slice(0,i).toLowerCase(),value=line.slice(i+1).trim();
    if(key==='user-agent'){if(inRules)flush();agents.push(value.toLowerCase())}
    else if(agents.length&&['allow','disallow'].includes(key)){rules.push({allow:key==='allow',value});inRules=true}
  }flush();
  const specific=groups.filter(g=>g.agents.some(a=>a!=='*'&&'tlepublicresearch'.includes(a)));
  const selected=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
  let best=null;
  for(const g of selected)for(const r of g.rules){
    if(!r.value)continue;
    const pattern=r.value.replace(/[.+?^{}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*');
    if(new RegExp('^'+pattern).test(path)&&(!best||r.value.length>best.value.length||r.value.length===best.value.length&&r.allow))best=r;
  }
  return !best||best.allow;
}
export function analyzeHTML(raw, url, checkedAt=new Date().toISOString()) {
  const tag=n=>textOnly(raw.match(new RegExp('<'+n+'\\b[^>]*>([\\s\\S]*?)<\\/'+n+'>','i'))?.[1]||'').slice(0,260);
  const meta=(name)=>{
    for(const t of raw.match(/<meta\b[^>]*>/gi)||[]){
      const attrs=Object.fromEntries([...t.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(m=>[m[1].toLowerCase(),m[3]]));
      if(attrs.name?.toLowerCase()===name)return textOnly(attrs.content||'').slice(0,400);
    }return '';
  };
  const text=textOnly(raw),links=[];
  for(const m of raw.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)){
    try{const u=new URL(m[2],url);if(u.protocol==='https:'&&/book|schedule|reserve|estimate|quote|reserva|cotiza/i.test(textOnly(m[3])+' '+u.pathname)){
      if(u.search||u.username||u.password)continue;links.push({text:clean(textOnly(m[3]),90),url:u.href});
    }}catch{}
  }
  const publicEmails=[...new Set(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[])].slice(0,8);
  const title=tag('title'),description=meta('description'),h1=tag('h1');
  return {source_url:url,checked_at:checkedAt,scope:'One public HTML response; no JavaScript, form submission, ranking or delivery test.',
    title,description,h1,booking_links:links.slice(0,8),public_emails:publicEmails,email_delivery_verified:false,
    observations:[{key:'page_title',observed:!!title},{key:'meta_description',observed:!!description},{key:'main_heading',observed:!!h1},
      {key:'booking_or_quote_link',observed:links.length>0},{key:'mobile_viewport',observed:/<meta[^>]*name\s*=\s*["']viewport["']/i.test(raw)}],
    excerpt:text.slice(0,2200),monitor_text:textOnly(raw.replace(/<(nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')).slice(0,24000),
    limitation:'Not observed means missing from scanned HTML, not absent from the complete website. Public content is untrusted reference material.'};
}
export function blockedLead(lead) {
  return !!(lead.archived_at||lead.replied_at||lead.stage==='Won'||['unsubscribed','revoked','bounced','complained','opted_out'].includes(lead.email_consent_status));
}
export function easternDate(now=new Date()) {
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(x=>[x.type,x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function validDate(value) {
  try{return /^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value}catch{return false}
}
