import { Plus } from 'lucide-react';

type Language = 'en' | 'es';
type Topic = 'general' | 'website' | 'va';

const faqs: Record<Topic, Record<Language, [string, string][]>> = {
  general: {
    en: [
      ['Which service is right for my cleaning business?', 'For new booking requests, explore Booking Automation + Command Center. AI Assistants can answer common booking questions, support permission-based follow-ups, or do both. The Cleaning App organizes clients, jobs, quotes and invoices; Website Automation connects your existing website; and Virtual Assistant supports everyday admin.'],
      ['Can I start with just one service?', 'Yes. Each service has its own page and checkout. Start with the part of your business that needs the most help.'],
      ['Can I see how it works before I buy?', 'Yes. Request a personalized Booking Page demo by email or try the live AI Booking Assistant demo. You can also explore the Cleaning App demo and Website Automation preview. The other AI agents do not have separate demos.'],
      ['What happens after I purchase?', 'For personalized setup services, follow the instructions after checkout and share your business details. Your service page explains the setup process. Cleaning App users can create an account to start their trial.'],
      ['Do you support English and Spanish?', 'Yes. Explore our website in English or Spanish and use the service page for details in your preferred language.']
    ],
    es: [
      ['¿Qué servicio necesita mi negocio de limpieza?', 'Para recibir y organizar reservas, explora Booking Automation + Command Center. AI Assistants puede responder preguntas sobre reservas, ayudar con seguimientos autorizados o hacer ambas cosas. La Cleaning App organiza clientes y trabajos; Website Automation conecta tu website actual; y Virtual Assistant te ayuda con tareas administrativas.'],
      ['¿Puedo comenzar con un solo servicio?', 'Sí. Cada servicio tiene su propia página y proceso de compra. Empieza por lo que más necesita tu negocio.'],
      ['¿Puedo ver cómo funciona antes de comprar?', 'Sí. Solicita la demo personalizada de Booking Page o prueba el asistente de reservas con IA. También puedes explorar la demo de Cleaning App y la vista de Website Automation. Los otros agentes de IA no tienen demos independientes.'],
      ['¿Qué pasa después de comprar?', 'Si compraste un servicio personalizado, sigue los pasos después del pago y comparte los datos de tu negocio. Cada página explica su proceso. Para Cleaning App, crea una cuenta y comienza tu prueba.'],
      ['¿Ofrecen atención en inglés y español?', 'Sí. Puedes explorar el website y la información de los servicios en inglés o español.']
    ]
  },
  website: {
    en: [
      ['Do I need to replace my existing website?', 'No. Website Automation is designed to connect inquiries from the contact or quote form on your current website to an organized next-step workflow.'],
      ['Does this include a new website?', 'No. This service focuses on the inquiry and follow-up flow for a website you already have.'],
      ['Does the interactive preview submit a real inquiry?', 'No. The example runs only on this page so you can explore the steps. It does not send a real lead.'],
      ['What will you need to get started?', 'After purchase, share your website address, the form you currently use, and the business details requested in your intake. We use that information to plan your setup.']
    ],
    es: [
      ['¿Necesito cambiar mi website actual?', 'No. Website Automation conecta las consultas de tu formulario de contacto o cotización actual con un flujo más organizado.'],
      ['¿Este servicio incluye un website nuevo?', 'No. Se enfoca en organizar consultas y seguimientos para el website que ya tienes.'],
      ['¿La demo interactiva envía consultas reales?', 'No. Es un ejemplo dentro de esta página para que explores los pasos; no envía leads reales.'],
      ['¿Qué necesitan para comenzar?', 'Después de comprar, comparte el enlace de tu website, el formulario que usas y los datos del negocio solicitados en tu intake. Con esa información preparamos tu configuración.']
    ]
  },
  va: {
    en: [
      ['What does Virtual Assistant support include?', 'Practical administrative help based on your business priorities, for up to 8 hours per month under this plan.'],
      ['Is the support desk shown here live?', 'No. The desk is an illustrative preview with sample tasks so you can picture the kind of administrative support available.'],
      ['Is this a full-time employee?', 'No. This is monthly administrative support with the hours shown on this page, not a full-time employee.'],
      ['How do we decide what to work on?', 'After purchase, share your business details and the administrative tasks you want help with. We use your priorities to plan the support within your plan.']
    ],
    es: [
      ['¿Qué incluye el servicio de Virtual Assistant?', 'Apoyo práctico con tareas administrativas según las prioridades de tu negocio, hasta 8 horas al mes dentro de este plan.'],
      ['¿El panel que aparece aquí está trabajando en vivo?', 'No. Es una vista ilustrativa con tareas de ejemplo para que conozcas el tipo de apoyo administrativo disponible.'],
      ['¿Es una empleada a tiempo completo?', 'No. Es apoyo administrativo mensual dentro de las horas indicadas en esta página, no una empleada a tiempo completo.'],
      ['¿Cómo elegimos las tareas?', 'Después de comprar, comparte los datos de tu negocio y las tareas administrativas que necesitas resolver. Usamos tus prioridades para organizar el apoyo dentro del plan.']
    ]
  }
};

export function ServiceFAQ({topic, lang='en'}:{topic:Topic; lang?:Language}) {
  const es=lang==='es';
  const heading=topic==='general'?(es?'Preguntas frecuentes':'Frequently asked questions'):(es?'Preguntas sobre este servicio':'Questions about this service');
  const label=topic==='general'?(es?'TODOS NUESTROS SERVICIOS':'ALL OUR SERVICES'):(es?'ANTES DE COMENZAR':'BEFORE YOU GET STARTED');
  return <section id={topic==='general'?'faq':undefined} className={`service-faq-section ${topic==='general'?'general-faq':''}`} aria-label={heading}>
    <div className="container service-faq-container">
      <div className="service-faq-intro"><span className="eyebrow">{label}</span><h2 className="editorial">{heading}</h2><p>{topic==='general'?(es?'Respuestas rápidas para que elijas con tranquilidad.':'A few clear answers to help you choose.'):(es?'Todo más claro antes de comprar.':'A little clarity before you buy.')}</p></div>
      <div className="service-faq-list">{faqs[topic][lang].map(([question,answer])=><details key={question}><summary><span>{question}</span><Plus size={19} aria-hidden="true"/></summary><p>{answer}</p></details>)}</div>
    </div>
  </section>;
}
