import { ArrowRight, MessageCircleMore, Sparkles } from 'lucide-react';

type Props = { lang?: 'en' | 'es' };

export function AIAgentAddon({ lang = 'en' }: Props) {
  const es = lang === 'es';
  return (
    <section className="container service-story" aria-label={es ? 'Integrar un asistente de IA' : 'AI assistant integration'}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        alignItems: 'center',
        gap: 'clamp(20px, 4vw, 42px)',
        padding: 'clamp(24px, 4vw, 44px)',
        border: '1px solid #cddfeb',
        borderRadius: 28,
        background: 'linear-gradient(120deg, #faf8f3, #e8f4fd)',
      }}>
        <div>
          <div className="eyebrow" style={{ display:'flex', alignItems:'center', gap: 8, color:'#416c88' }}>
            <Sparkles size={17} aria-hidden="true" />
            {es ? 'INTEGRACIÓN OPCIONAL' : 'OPTIONAL ADD-ON'}
          </div>
          <h2 className="editorial" style={{ marginTop: 12 }}>
            {es ? '¿Y si tu Booking Page también pudiera responder preguntas?' : 'What if your Booking Page could answer questions, too?'}
          </h2>
          <p style={{ maxWidth: 525 }}>
            {es
              ? 'Podemos integrar un asistente de IA que explique tus servicios y ayude a las personas a comenzar su solicitud de reserva. También podemos instalarlo en un website compatible que ya tengas.'
              : 'We can add an AI assistant that explains your services and helps visitors get started with a booking request. It can also be installed on a compatible website you already have.'}
          </p>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            {es
              ? 'El asistente es un servicio adicional. Tu Booking Automation + Command Center funciona por separado.'
              : 'The assistant is a separate service. Your Booking Automation + Command Center works independently.'}
          </p>
          <a
            className="cta-button service-cta"
            href={es ? '/es/ai-booking-assistant/' : '/ai-booking-assistant/'}
            style={{ display: 'inline-flex', marginTop: 14, alignItems:'center', gap:10, maxWidth:'100%' }}
          >
            {es ? 'Conocer los asistentes de IA' : 'Explore AI Assistants'}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div style={{
          background:'#ffffff',
          border:'1px solid #d8e5ee',
          borderRadius:22,
          padding:'clamp(20px, 3vw, 29px)',
          boxShadow:'0 12px 28px rgba(25,25,25,.06)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 22 }}>
            <span style={{ display:'inline-grid', placeItems:'center', width:42, height:42, borderRadius:15, background:'#e9f4fc' }}>
              <MessageCircleMore size={22} color="#356a8b" aria-hidden="true" />
            </span>
            <div>
              <strong style={{ display:'block', fontSize: 15 }}>{es ? 'Asistente de Reservas con IA' : 'AI Booking Assistant'}</strong>
              <small style={{ display:'block', color:'#5a6974', fontSize:11 }}>{es ? 'Un ejemplo de conversación' : 'An example conversation'}</small>
            </div>
          </div>
          <div style={{ padding:'13px 15px', borderRadius:'17px 17px 17px 5px', background:'#edf6fd', marginBottom:12, fontSize:13 }}>
            {es ? '¡Hola! ¿Qué tipo de limpieza necesitas?' : 'Hi! What type of cleaning do you need?'}
          </div>
          <div style={{ padding:'13px 15px', borderRadius:'17px 17px 5px 17px', background:'#faf8f3', border:'1px solid #ebebea', marginLeft:24, marginBottom:12, fontSize:13 }}>
            {es ? 'Una limpieza profunda para mi casa.' : 'A deep cleaning for my home.'}
          </div>
          <div style={{ padding:'13px 15px', borderRadius:'17px 17px 17px 5px', background:'#edf6fd', fontSize:13 }}>
            {es ? '¡Claro! ¿En qué código postal está?' : 'Of course! What ZIP code is it in?'}
          </div>
          <small style={{ display:'block', marginTop:14, fontSize:11, color:'#63717c' }}>
            {es ? 'Ejemplo ilustrativo. Explora la demo real en la página de asistentes.' : 'Illustration only. Try the live demo on the AI Assistants page.'}
          </small>
        </div>
      </div>
    </section>
  );
}
