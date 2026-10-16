import { FAQTopicTabs } from './faq-topic-tabs';

type Language = 'en' | 'es';
type Topic = 'general' | 'website' | 'va';

const faqs: Record<Topic, Record<Language, [string, string][]>> = {
  general: {
    en: [
      ['How soon will everything be ready?', 'We first review your payment, completed setup form and required access. The estimated 48-hour production period starts only once your project is approved and you receive a separate kickoff email. Missing details, closures or third-party delays can affect the estimate.'],
      ['Where can I find my purchase email?', 'We’ll email your purchase confirmation and next steps. If you don’t see them, check Promotions or Spam too.'],
      ['Which service is right for my cleaning business?', 'If new requests keep getting lost between messages, Booking Automation + Command Center is a good place to start. AI Assistants can answer common booking questions, support permission-based follow-ups, or do both. The Cleaning App organizes clients, jobs, quotes and invoices; Website Automation connects your existing website; and Virtual Assistant supports everyday admin.'],
      ['Is the AI Assistant included with Booking Automation + Command Center?', 'No. The AI Assistant is a separate, optional system with its own setup and plan price. We can integrate it into your Booking Page or existing website, but it is not included in the Booking Automation + Command Center purchase.'],
      ['Can I start with just one service?', 'Yes. Each service has its own page and checkout. Start with the part of your business that needs the most help.'],
      ['Can I see how it works before I buy?', 'Yes. Request a personalized Booking Page demo by email or try the live AI Booking Assistant demo. You can also explore the Cleaning App demo and Website Automation preview. The other AI agents do not have separate demos.'],
      ['What happens after I pay?', 'For personalized setup services, follow the instructions after checkout and share your business details. Your service page explains the setup process. Cleaning App users can create an account to start their trial.'],
      ['Can I get help in Spanish?', 'Yes. Explore our website in English or Spanish and use the service page for details in your preferred language.']
    ],
    es: [
      ['¿Cuándo estará listo mi servicio?', 'Primero revisamos tu pago, formulario y accesos necesarios. Las 48 horas estimadas de producción comienzan solo cuando aprobamos el proyecto y recibes el correo de inicio. Los datos faltantes, los cierres o las demoras de terceros pueden afectar el plazo estimado.'],
      ['¿Dónde encuentro el correo de compra?', 'Te enviaremos la confirmación y los próximos pasos por correo. Si no aparecen, revisa también Promociones y Spam.'],
      ['¿Qué servicio necesita mi negocio de limpieza?', 'Si las nuevas solicitudes se te pierden entre mensajes, empieza por Booking Automation + Command Center. Los asistentes de IA pueden responder preguntas sobre reservas, ayudar con seguimientos autorizados o hacer ambas cosas. La Cleaning App organiza clientes y trabajos; Website Automation conecta tu website actual; y Virtual Assistant te ayuda con tareas administrativas.'],
      ['¿El AI Assistant viene incluido en Booking Automation + Command Center?', 'No. Es un sistema independiente y opcional, con su propio precio de instalación y plan. Podemos integrarlo a tu Booking Page o website, pero no está incluido en la compra de Booking Automation + Command Center.'],
      ['¿Puedo comenzar con un solo servicio?', 'Sí. Cada servicio tiene su propia página y proceso de compra. Empieza por lo que más necesita tu negocio.'],
      ['¿Puedo ver cómo funciona antes de comprar?', 'Sí. Solicita la demo personalizada de Booking Page o prueba el asistente de reservas con IA. También puedes explorar la demo de Cleaning App y la vista de Website Automation. Los otros agentes de IA no tienen demos independientes.'],
      ['¿Qué pasa después de pagar?', 'Si compraste un servicio personalizado, sigue los pasos después del pago y comparte los datos de tu negocio. Cada página explica su proceso. Para Cleaning App, crea una cuenta y comienza tu prueba.'],
      ['¿Puedo recibir atención en español?', 'Sí. Puedes explorar el website y la información de los servicios en inglés o español.']
    ]
  },
  website: {
    en: [
      ['Do I need to replace my existing website?', 'No. Website Automation is designed to connect inquiries from the contact or quote form on your current website to an organized next-step workflow.'],
      ['Does this include a new website?', 'No. This service focuses on the inquiry and follow-up flow for a website you already have.'],
      ['Does the interactive preview submit a real inquiry?', 'No. The example runs only on this page so you can explore the steps. It does not send a real lead.'],
      ['When does production begin?', 'Your estimated 48-hour production period starts only after we review and approve your complete setup and email you the kickoff confirmation. Your submitted intake does not start the production window.'],
      ['What will you need to get started?', 'After checkout, share your website link, the form you use, and a few details about your business. We’ll take it from there.']
    ],
    es: [
      ['¿Necesito cambiar mi website actual?', 'No. Website Automation conecta las consultas de tu formulario de contacto o cotización actual con un flujo más organizado.'],
      ['¿Este servicio incluye un website nuevo?', 'No. Se enfoca en organizar consultas y seguimientos para el website que ya tienes.'],
      ['¿La demo interactiva envía consultas reales?', 'No. Es un ejemplo dentro de esta página para que explores los pasos; no envía leads reales.'],
      ['¿Cuándo comienza la producción?', 'El plazo estimado de 48 horas comienza después de que revisemos y aprobemos tus datos y te enviemos el correo de inicio. Enviar el intake no inicia automáticamente la producción.'],
      ['¿Qué necesitan para comenzar?', 'Después de comprar, compártenos el enlace de tu website, el formulario que usas y algunos datos de tu negocio. Con eso preparamos tu servicio.']
    ]
  },
  va: {
    en: [
      ['What does Virtual Assistant support include?', 'Practical administrative help based on your business priorities, for up to 8 hours per month under this plan.'],
      ['Is the support desk shown here live?', 'No. Those are example tasks to show the kind of help you can request. Your work starts after we complete your setup.'],
      ['Is this a full-time employee?', 'No. This is monthly administrative support with the hours shown on this page, not a full-time employee.'],
      ['How soon does VA onboarding begin?', 'The initial setup has an estimated 48-hour production window, starting once we review your paid intake and required access and email you the approved kickoff. Ongoing monthly support follows your plan.'],
      ['How do we decide what to work on?', 'After purchase, share your business details and the administrative tasks you want help with. We use your priorities to plan the support within your plan.']
    ],
    es: [
      ['¿Qué incluye el servicio de Virtual Assistant?', 'Apoyo práctico con tareas administrativas según las prioridades de tu negocio, hasta 8 horas al mes dentro de este plan.'],
      ['¿El panel que aparece aquí está trabajando en vivo?', 'No. Son ejemplos de las tareas en las que podemos ayudarte. Empezamos con las tuyas después de preparar el servicio.'],
      ['¿Es una empleada a tiempo completo?', 'No. Es apoyo administrativo mensual dentro de las horas indicadas en esta página, no una empleada a tiempo completo.'],
      ['¿Cuándo comienza la configuración de VA?', 'La configuración inicial tiene un plazo estimado de 48 horas desde que revisamos el pago, el formulario y los accesos necesarios, aprobamos el inicio y te lo confirmamos por correo. El apoyo mensual continúa según el plan contratado.'],
      ['¿Cómo elegimos las tareas?', 'Después de comprar, comparte los datos de tu negocio y las tareas administrativas que necesitas resolver. Usamos tus prioridades para organizar el apoyo dentro del plan.']
    ]
  }
};

export function ServiceFAQ({ topic, lang = 'en' }: { topic: Topic; lang?: Language }) {
  const es = lang === 'es';
  const heading = topic === 'general'
    ? (es ? 'Preguntas frecuentes' : 'Frequently asked questions')
    : (es ? 'Preguntas sobre este servicio' : 'Questions about this service');
  const label = topic === 'general'
    ? (es ? 'TODOS NUESTROS SERVICIOS' : 'ALL OUR SERVICES')
    : (es ? 'ANTES DE COMENZAR' : 'BEFORE YOU GET STARTED');
  const questions = faqs[topic][lang];
  const billingIndices = topic === 'general' ? [0, 1, 3, 4, 6] : topic === 'website' ? [1, 3] : [2, 3];
  const billing = questions.filter((_, index) => billingIndices.includes(index));
  const account = questions.filter((_, index) => !billingIndices.includes(index));
  return (
    <section id={topic === 'general' ? 'faq' : undefined} className={'service-faq-section ' + (topic === 'general' ? 'general-faq' : '')} aria-label={heading}>
      <div className="container service-faq-container">
        <div className="service-faq-intro">
          <span className="eyebrow">{label}</span>
          <h2 className="editorial">{heading}</h2>
          <p>{topic === 'general'
            ? (es ? 'Respuestas rápidas para que elijas con tranquilidad.' : 'A few clear answers to help you choose.')
            : (es ? 'Todo más claro antes de comprar.' : 'A little clarity before you buy.')}</p>
        </div>
        <div className="service-faq-list">
          <FAQTopicTabs lang={lang} billing={billing} account={account} />
        </div>
      </div>
    </section>
  );
}
