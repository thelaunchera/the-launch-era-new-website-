import { FAQTopicTabs } from './faq-topic-tabs';

type Language = 'en' | 'es';
type Topic = 'general' | 'website' | 'va';

const faqs: Record<Topic, Record<Language, [string, string][]>> = {
  general: {
    en: [
      ['How soon will everything be ready?', 'Production is estimated at 48 hours after payment, setup details and access are reviewed, and kickoff is confirmed by email. Missing details or external delays may extend this.'],
      ['Where can I find my purchase email?', 'We’ll email your purchase confirmation and next steps. If you don’t see them, check Promotions or Spam too.'],
      ['Which service is right for my cleaning business?', 'Booking Automation organizes requests and follow-ups; Cleaning App manages daily work. AI Assistants help with booking questions or authorized follow-ups. Website Automation connects your site, while Virtual Assistant helps with admin.'],
      ['Is the AI Assistant included with Booking Automation + Command Center?', 'No. AI Assistants are optional, with separate setup and monthly pricing. They can connect to your Booking Page or website.'],
      ['Can I start with just one service?', 'Yes. Each service has its own page and checkout. Start with the part of your business that needs the most help.'],
      ['Can I see how it works before I buy?', 'Yes. Request a personalized Booking Page demo by email or try the live AI Booking Assistant demo. You can also explore the Cleaning App demo and Website Automation preview. The other AI agents do not have separate demos.'],
      ['What happens after I pay?', 'For personalized setup services, follow the instructions after checkout and share your business details. Your service page explains the setup process. Cleaning App users can create an account to start their trial.'],
      ['Can I get help in Spanish?', 'Yes. Explore our website in English or Spanish and use the service page for details in your preferred language.']
    ],
    es: [
      ['¿Cuándo estará listo mi servicio?', 'La producción estimada es de 48 horas desde que revisamos pago, datos y accesos, y confirmamos el inicio por correo. Faltantes o retrasos externos pueden ampliar el plazo.'],
      ['¿Dónde encuentro el correo de compra?', 'Te enviaremos la confirmación y los próximos pasos por correo. Si no aparecen, revisa también Promociones y Spam.'],
      ['¿Qué servicio necesita mi negocio de limpieza?', 'Booking Automation organiza solicitudes y seguimientos; Cleaning App, el trabajo diario. Los asistentes de IA atienden consultas y seguimientos autorizados. Website Automation conecta tu sitio y Virtual Assistant te ayuda con tareas administrativas.'],
      ['¿El AI Assistant viene incluido en Booking Automation + Command Center?', 'No. Los asistentes de IA son opcionales y tienen instalación y mensualidad aparte. Pueden conectarse a tu Booking Page o website.'],
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
      ['When does production begin?', 'The estimated 48 hours start after we approve your setup and confirm kickoff by email—not when you submit the form.'],
      ['What will you need to get started?', 'After checkout, share your website link, the form you use, and a few details about your business. We’ll take it from there.']
    ],
    es: [
      ['¿Necesito cambiar mi website actual?', 'No. Website Automation conecta las consultas de tu formulario de contacto o cotización actual con un flujo más organizado.'],
      ['¿Este servicio incluye un website nuevo?', 'No. Se enfoca en organizar consultas y seguimientos para el website que ya tienes.'],
      ['¿La demo interactiva envía consultas reales?', 'No. Es un ejemplo dentro de esta página para que explores los pasos; no envía leads reales.'],
      ['¿Cuándo comienza la producción?', 'Las 48 horas estimadas empiezan cuando aprobamos tus datos y confirmamos el inicio por correo, no al enviar el formulario.'],
      ['¿Qué necesitan para comenzar?', 'Después de comprar, compártenos el enlace de tu website, el formulario que usas y algunos datos de tu negocio. Con eso preparamos tu servicio.']
    ]
  },
  va: {
    en: [
      ['What does Virtual Assistant support include?', 'Practical administrative help based on your business priorities, for up to 8 hours per month under this plan.'],
      ['Is the support desk shown here live?', 'No. Those are example tasks to show the kind of help you can request. Your work starts after we complete your setup.'],
      ['Is this a full-time employee?', 'No. This is monthly administrative support with the hours shown on this page, not a full-time employee.'],
      ['How soon does VA onboarding begin?', 'Estimated setup: 48 hours after reviewing payment, details and access, and confirming kickoff by email. Monthly support follows your plan.'],
      ['How do we decide what to work on?', 'After purchase, share your business details and the administrative tasks you want help with. We use your priorities to plan the support within your plan.']
    ],
    es: [
      ['¿Qué incluye el servicio de Virtual Assistant?', 'Apoyo práctico con tareas administrativas según las prioridades de tu negocio, hasta 8 horas al mes dentro de este plan.'],
      ['¿El panel que aparece aquí está trabajando en vivo?', 'No. Son ejemplos de las tareas en las que podemos ayudarte. Empezamos con las tuyas después de preparar el servicio.'],
      ['¿Es una empleada a tiempo completo?', 'No. Es apoyo administrativo mensual dentro de las horas indicadas en esta página, no una empleada a tiempo completo.'],
      ['¿Cuándo comienza la configuración de VA?', 'Configuración estimada: 48 horas después de revisar pago, datos y accesos y confirmar el inicio por correo. El apoyo mensual sigue tu plan.'],
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
