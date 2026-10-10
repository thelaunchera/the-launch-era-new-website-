import { ArrowRight, MessageCircleMore } from 'lucide-react';

export function AIAgentAddon({ lang = 'en' }: { lang?: 'en' | 'es' }) {
 const es = lang === 'es';
 return <section className="container service-story" aria-label={es?'Asistentes de IA':'AI Assistants'}>
  <div style={{display:'flex',flexWrap:'wrap',gap:20,alignItems:'center',justifyContent:'space-between',padding:'clamp(22px,3vw,32px)',border:'1px solid #cddfeb',borderRadius:22,background:'#eaf4fc'}}>
   <div style={{flex:'1 1 290px',maxWidth:600}}>
    <span className="eyebrow" style={{display:'flex',alignItems:'center',gap:8,color:'#416c88'}}><MessageCircleMore size={17}/>{es?'TAMBIÉN DISPONIBLE':'ALSO AVAILABLE'}</span>
    <h2 className="editorial" style={{fontSize:'clamp(23px,3vw,32px)',margin:'10px 0'}}>{es?'Integra un asistente de IA.':'Connect an AI Assistant.'}</h2>
    <p style={{margin:'0',fontSize:14,lineHeight:1.55,color:'#3c5568'}}>{es?'Responde preguntas de reservas y ayuda con seguimientos. Puedes instalarlo en tu Booking Page o website.':'Answer booking questions and manage follow-ups. Install it on your Booking Page or website.'}</p>
   </div>
   <a className="cta-button service-cta" href={es?'/es/ai-booking-assistant/':'/ai-booking-assistant/'} style={{display:'inline-flex',alignItems:'center',gap:8,flex:'0 0 auto',maxWidth:'100%'}}>{es?'Ver asistentes de IA':'Explore AI Assistants'} <ArrowRight size={18}/></a>
  </div>
 </section>;
}
