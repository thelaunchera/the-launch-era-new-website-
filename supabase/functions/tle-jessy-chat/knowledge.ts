/**
 * Jessy internal FAQ and approved service knowledge.
 * This file is deployed with the Supabase Edge Function (NOT the public website).
 * Never store customer details, API keys or internal account credentials here.
 * Prices are NOT duplicated: read current amounts from jessy-offers.json.
 * Every answer is a verified capability or a careful limit, never a promise.
 */
export type Fact = {
  service: string;
  topic: string;
  keywords: string[];
  en: string;
  es: string;
};
export const FAQ: Fact[] = [
 {service:"booking",topic:"customer-emails",
  keywords:["what emails","confirmation email","customer email","email after booking","que correos","correo de confirmacion","email al cliente","recibe el cliente"],
  en:"After a request is submitted, the customer receives an acknowledgment and the business receives the request details with access to its private Command Center. The acknowledgment does not confirm an appointment. A separate confirmation depends on approval or eligible configured automatic confirmation. Messages use the customer's business identity.",
  es:"Después de enviar la solicitud, el cliente recibe un acuse de recibo y el negocio recibe los detalles con acceso a su Command Center privado. Ese primer correo no confirma una cita. La confirmación depende de aprobación o de una confirmación automática elegible y configurada. Los mensajes llevan la identidad del negocio del cliente."},
 {service:"booking",topic:"managed-followups",
  keywords:["how do follow-ups work","how do follow ups work","how many followups","follow-up emails","follow up emails","stop reminders","como funcionan los seguimientos","correos de seguimiento","cuantos seguimientos","cuando paran"],
  en:"For eligible quote requests, the configured workflow can send up to two follow-up emails after the customer agrees to reminders. Timing is configured for each business. Follow-ups stop when the customer replies, opts out or the request closes; the owner can also pause them. AI Follow-Up is a separate plan for assistance with those conversations.",
  es:"Para solicitudes de cotización elegibles, el flujo configurado puede enviar hasta dos correos de seguimiento si el cliente acepta recordatorios. Los tiempos se configuran para cada negocio. Se detienen al responder, cancelar recordatorios o cerrar la solicitud; el dueño también puede pausarlos. AI Follow-Up es un plan aparte para ayudar con esas conversaciones."},

 {service:"general",topic:"business",
  keywords:["what do you do","what services","what do you sell","your business","how can you help","what can you help with","what can you do","que hacen","que ofrecen","que venden","servicios tienen","en que me puedes ayudar","que puedes ayudarme","que puedes hacer","como puedes ayudarme","who are you"],
  en:"The Launch Era helps cleaning business owners organize inquiries, bookings, follow-ups and day-to-day work. We offer Booking Automation + Command Center, the Cleaning Web App, AI Assistants, Website Automation and VA support.",
  es:"The Launch Era ayuda a negocios de limpieza a organizar consultas, reservas, seguimientos y operaciones. Ofrecemos Booking Automation + Command Center, Cleaning Web App, asistentes IA, Website Automation y apoyo VA."},
 {service:"general",topic:"audience",
  keywords:["who is this for","commercial cleaning","residential cleaning","who can use","business type","para quien","limpieza comercial","limpieza residencial","que tipo de negocio"],
  en:"Our tools are designed primarily for cleaning business owners. We support residential workflows and review commercial requirements before promising a specific setup.",
  es:"Nuestras herramientas están pensadas principalmente para negocios de limpieza. Apoyamos operaciones residenciales y revisamos las necesidades comerciales antes de confirmar funciones."},
 {service:"general",topic:"starting",
  keywords:["how to start","how do i start","get started","next steps","onboarding","first step","como empiezo","primer paso","siguiente paso","empezar","proceso de compra"],
  en:"First choose a service, review its checkout and complete the intake after purchase. The team checks your details before confirming that production has started.",
  es:"Primero eliges el servicio, revisas el checkout y completas el formulario después de comprar. El equipo comprueba los datos antes de confirmar el inicio de producción."},
 {service:"general",topic:"production",
  keywords:["how long to set up","delivery time","turnaround","48 hours","ready in","how many days","cuanto demora","cuanto tarda","cuanto tardan","48 horas","cuando lo entregan","tiempo de entrega"],
  en:"Booking setup is normally estimated at 48 hours after purchase is verified, the intake is complete and the team confirms production has started. Your actual delivery date is confirmed during onboarding.",
  es:"La configuración de Booking se estima en unas 48 horas después de verificar la compra, completar el formulario y confirmar el inicio de producción. La fecha exacta se confirma en onboarding."},
 {service:"general",topic:"post-purchase-call",
  keywords:["1:1 call","1 on 1 call","one-on-one call","20 minute call","20-minute consultation","call after purchase","do you offer calls","do you offer consultations","phone consultation","llamada 1:1","llamada de 20 minutos","consulta 1:1","llamada despues de comprar","ofrecen llamadas","reunion de 20 minutos"],
  en:"A 20-minute 1:1 call is included only after purchasing a service from The Launch Era. It is part of post-purchase onboarding, not an available pre-sales consultation. The team coordinates a time after verifying the order; no call is booked automatically.",
  es:"La llamada 1:1 de 20 minutos se incluye solo después de comprar un servicio de The Launch Era. Es parte del acompañamiento posterior a la compra, no una consulta disponible antes de pagar. El equipo coordina el horario tras verificar el pedido; no se reserva automáticamente."},
 {service:"general",topic:"contact",
  keywords:["human","real person","speak to the team","contact support","need help from a person","hablar con alguien","persona real","contactar al equipo","soporte humano"],
  en:"Absolutely. Leave your question and business contact details in the form here, and the team can review your specific situation. I won't ask for card information.",
  es:"Claro. Deja tu pregunta y los datos de contacto de tu negocio en el formulario de aquí para que el equipo revise tu caso. No necesito datos de tarjeta."},
 {service:"general",topic:"payments",
  keywords:["payment methods","do you take cards","cash or zelle","pay with","stripe","payment link","metodos de pago","como puedo pagar","pagar con tarjeta","aceptan tarjetas"],
  en:"Service checkout shows the available payment options and final total before you pay. The Cleaning App is separate: it can record Cash, Zelle and Check payments for your own business, but does not charge your customers.",
  es:"El checkout de servicios muestra las opciones de pago y el total final antes de pagar. La Cleaning App es diferente: registra pagos Cash, Zelle y Check de tu negocio, pero no cobra a tus clientes."},
 {service:"general",topic:"refunds",
  keywords:["refund","money back","cancel my order","cancellation policy","refund policy","devolucion","reembolso","cancelar compra","politica de cancelacion"],
  en:"Refund and cancellation terms depend on the service and your order. I don't want to guess—please review the checkout terms or share your question with the team.",
  es:"Los reembolsos y cancelaciones dependen del servicio y de tu pedido. Prefiero no adivinar: revisa los términos del checkout o consulta tu caso con el equipo."},
 {service:"general",topic:"privacy",
  keywords:["privacy","private data","who sees","security","my customer data","data protection","privacidad","seguridad","datos de clientes","quien ve mis datos"],
  en:"Your business information should only be entered through the appropriate private intake or account, not this public chat. Ask the team about a specific security or data-retention requirement before you purchase.",
  es:"Los datos de tu negocio deben ingresarse en el formulario o cuenta privada, no en este chat público. Si tienes dudas específicas de seguridad o conservación de datos, consúltalas antes de comprar."},
 {service:"booking",topic:"flow",
  keywords:["how booking works","how does booking work","booking process","customer books","customer request","how is a booking made","booking request","how does booking automation work","funciona booking","como llegan las reservas","solicitud de reserva","flujo de reservas"],
  en:"A visitor sends a request through your Booking Page. You see the inquiry in your Command Center, check the estimate and schedule, then confirm the details. You can also track leads who need a follow-up.",
  es:"El visitante envía una solicitud desde tu Booking Page. Ves la consulta en tu Command Center, revisas el estimado y la agenda y confirmas los datos. También puedes dar seguimiento a interesados."},
 {service:"booking",topic:"estimates",
  keywords:["estimate","quotes on booking","fixed price","price calculator","distance","zip code","frequency discount","estimated cleaning cost","cotizacion","estimado","precio fijo","distancia","codigo postal","descuento por frecuencia"],
  en:"Booking requests can show an approximate estimate based on your configured services, frequency and other details. You review and confirm the final price; the preview is not a guaranteed quote.",
  es:"Las reservas pueden mostrar un estimado aproximado según tus servicios, frecuencia y otros datos configurados. Tú revisas y confirmas el precio final; no es una cotización garantizada."},
 {service:"booking",topic:"followup",
  keywords:["booking followup","follow up on leads","lost inquiry","not replying","forgot to reply","missed bookings","leads go cold","seguimiento de reservas","lead no responde","perder reservas","seguimiento automatico"],
  en:"Incoming booking inquiries stay organized in your lead tracker, with follow-up status and owner alerts. Exact messaging behavior depends on the approved setup; the team verifies what can be automated.",
  es:"Las solicitudes quedan organizadas en tu Lead Tracker con estados de seguimiento y avisos. Los mensajes automáticos dependen de la configuración aprobada; el equipo confirma qué se automatiza."},
 {service:"booking",topic:"availability",
  keywords:["real time availability","available slots","calendar sync","schedule availability","availability of cleaners","live availability","horarios disponibles","disponibilidad","sincronizar calendario","calendario en tiempo real"],
  en:"Your Booking Page can show the time slots you configure. Availability and scheduling rules are reviewed in your setup so visitors don't receive a confirmation you haven't approved.",
  es:"Tu Booking Page puede mostrar los horarios que configures. La disponibilidad y reglas de agenda se revisan en la configuración para que nadie reciba confirmaciones que no hayas aprobado."},
 {service:"booking",topic:"manage",
  keywords:["change service price","edit services","edit my cleaning rates","edit cleaning rates","change my rates","add extras","change business hours","manage booking","edit prices","agregar extras","cambiar precios","editar servicios","horario de trabajo","modificar reservas"],
  en:"You manage your business services, prices, availability and incoming requests in your private Command Center. You stay in control of final confirmations.",
  es:"Gestionas servicios, precios, disponibilidad y solicitudes desde tu Command Center privado. Tú mantienes el control de las confirmaciones finales."},
 {service:"booking",topic:"demo",
  keywords:["booking demo","test booking","try the booking page","sample booking","booking preview","demo de reservas","probar reservas","ejemplo de booking"],
  en:"There's a sample booking experience you can explore before buying. The demo is for learning how it feels; it doesn't make a real appointment.",
  es:"Hay una demo de reservas que puedes explorar antes de comprar. Sirve para conocer el proceso; no crea una cita real."},
 {service:"booking",topic:"command",
  keywords:["what is command center","how does the command center work","command center","control panel","command center login","dashboard booking","que es command center","panel de control","entrar command center"],
  en:"The Command Center is your private place to review inquiries, leads, booking settings and next steps. Customer workspaces are kept separate from The Launch Era's own website.",
  es:"El Command Center es tu espacio privado para revisar consultas, prospectos, ajustes de reservas y pendientes. El espacio del cliente está separado del website de The Launch Era."},
 {service:"ai-booking",topic:"role",
  keywords:["booking assistant","what can booking ai","ai booking does","answer questions","automated booking assistant","asistente de reservas","responde preguntas","asistente booking"],
  en:"AI Booking Assistant answers questions about your business and helps visitors prepare a booking inquiry on your website or Booking Page. Your team remains responsible for confirming reservations.",
  es:"AI Booking Assistant responde preguntas sobre tu negocio y ayuda a preparar solicitudes desde tu website o Booking Page. Tu equipo confirma las reservas."},
 {service:"ai-booking",topic:"custom",
  keywords:["train the ai","know my business","teach the assistant","custom faq","different services","change answers","ai training","entrenar inteligencia","conocer mi negocio","preguntas frecuentes","personalizar respuestas"],
  en:"The assistant is configured around your approved business information, services and FAQs. You can request adjustments when your services or policies change, subject to the plan's agreed scope.",
  es:"El asistente se configura con la información, servicios y preguntas frecuentes aprobados de tu negocio. Puedes solicitar cambios cuando actualices servicios o políticas, según el alcance del plan."},
 {service:"ai-booking",topic:"control",
  keywords:["does ai confirm","will it book automatically","replace receptionist","can it charge","ai take payments","confirm appointments","confirma reservas","cobra a clientes","paga por mi","reemplaza persona"],
  en:"It helps visitors understand services and prepare requests, but it doesn't take payments or independently confirm bookings. You review the final details.",
  es:"Ayuda a entender los servicios y preparar solicitudes, pero no cobra ni confirma reservas por su cuenta. Tú revisas los datos finales."},
 {service:"ai-followup",topic:"permission",
  keywords:["automatic messages","auto followup","send followups","follow up agent","consent","permission to contact","mensajes automaticos","seguimiento por email","permiso contactar","consentimiento","mensajes no solicitados"],
  en:"AI Follow-Up Assistant supports follow-ups with leads who gave permission to be contacted. The owner reviews the workflow and controls the messages; specific automation is confirmed during onboarding.",
  es:"AI Follow-Up Assistant apoya seguimientos a prospectos que autorizaron el contacto. El dueño revisa el flujo y controla los mensajes; la automatización exacta se confirma en onboarding."},
 {service:"ai-followup",topic:"schedule",
  keywords:["how often follow up","how many reminders","stop followups","when someone replies","no reply","doesnt reply","doesn't reply","customer doesnt reply","followup timing","cuantas veces escribe","cuando se detiene","frecuencia mensajes","si responde"],
  en:"Follow-up timing and stop conditions are agreed during setup. We don't promise unlimited reminders or automatic replies; the flow must respect consent and responses.",
  es:"La frecuencia y las condiciones para detener seguimientos se acuerdan al configurar. No prometemos mensajes ilimitados; el flujo debe respetar permisos y respuestas."},
 {service:"ai-business",topic:"bundle",
  keywords:["business assistant","both agents","both assistants","ai bundle","combined plan","which ai plan","ai assistant comparison","los dos asistentes","plan completo","combinacion ia"],
  en:"AI Business Assistant combines Booking Assistant and Follow-Up Assistant: one helps with booking inquiries and the other with approved lead follow-ups. The monthly plan is separate from setup.",
  es:"AI Business Assistant reúne Booking Assistant y Follow-Up Assistant: uno ayuda con consultas de reservas y otro con seguimientos autorizados. La mensualidad es independiente de la activación."},
 {service:"cleaning-app",topic:"clients",
  keywords:["add client","customer profiles","client history","client details","manage customers","edit customer","add contacts","clientes","agregar cliente","historial de cliente","ficha de cliente"],
  en:"The Clients section keeps contact details and job history together. You can organize your customer records without searching across old messages.",
  es:"En Clientes tienes los contactos y el historial de trabajos juntos. Así organizas tus registros sin buscar entre mensajes antiguos."},
 {service:"cleaning-app",topic:"calendar",
  keywords:["calendar","recurring jobs","repeat cleanings","weekly","biweekly","monthly visits","schedules","calendario","trabajos recurrentes","semanal","quincenal","agenda"],
  en:"The calendar shows upcoming cleanings and recurring jobs. You can organize one-time, weekly, biweekly or monthly work from the same app.",
  es:"El calendario muestra las limpiezas próximas y recurrentes. Puedes organizar trabajos únicos, semanales, quincenales o mensuales desde la app."},
 {service:"cleaning-app",topic:"quotes",
  keywords:["quotes","invoices","billing","invoice status","estimate","send invoice","cotizaciones","facturas","cobranza","crear factura","enviar cotizacion"],
  en:"You can organize quotes and invoices alongside jobs and clients. Your business reviews amounts and payment status; the app doesn't automatically charge your customers.",
  es:"Puedes organizar cotizaciones y facturas junto con trabajos y clientes. Tu negocio revisa importes y pagos; la app no cobra automáticamente a tus clientes."},
 {service:"cleaning-app",topic:"payments",
  keywords:["pay by cash","accept zelle","check payment","charge credit card","cash zelle check","payment collection","efectivo","zelle","cheque","tarjeta de credito"],
  en:"The Cleaning App records your clients' Cash, Zelle or Check payment status. It is not a payment processor or card checkout for your cleaning customers.",
  es:"La Cleaning App registra pagos de tus clientes por Cash, Zelle o Check. No procesa tarjetas ni cobra directamente a tus clientes."},
 {service:"cleaning-app",topic:"team",
  keywords:["staff","team access","worker","employee","permissions","assign jobs","role","empleados","trabajadores","asignar trabajos","roles","permisos"],
  en:"Team tools help organize worker access and job assignments. Owner, admin and worker views are different, so each person sees only their role's workflow.",
  es:"Las herramientas de equipo organizan el acceso y asignación de trabajos. Dueño, administrador y trabajador tienen vistas diferentes según su función."},
 {service:"cleaning-app",topic:"time",
  keywords:["time tracking","clock in","clock out","hours worked","mileage","routes","gps","tracking","control de tiempo","registrar horas","millas","millaje","rutas","recorridos"],
  en:"The app includes work-time tracking, mileage and route tools to help you review daily operations. It isn't a guarantee of GPS precision or automated payroll.",
  es:"La app incluye registro de horas, millaje y rutas para revisar operaciones. No garantiza precisión GPS ni calcula nóminas automáticamente."},
 {service:"cleaning-app",topic:"pricing",
  keywords:["pricing calculator","cleaning estimate","add ons","square feet","service rate","service price","calculadora","precio por limpieza","precio estimado","servicio extra","metros cuadrados","pies cuadrados"],
  en:"The Pricing Calculator uses the services and rates you configure to prepare approximate estimates. You decide the final price after reviewing the job.",
  es:"La calculadora usa tus servicios y tarifas configuradas para preparar estimados aproximados. Tú decides el precio final después de revisar el trabajo."},
 {service:"cleaning-app",topic:"devices",
  keywords:["android","iphone","ipad","tablet","computer","desktop","download","install","pwa","mobile","telefono","movil","descargar","instalar","computadora"],
  en:"The Cleaning App works through a browser on phone, tablet and desktop; you can also add it to the home screen. It's a web app, not a promised App Store download.",
  es:"La Cleaning App funciona desde el navegador en teléfono, tablet y computadora, y puedes añadirla a la pantalla de inicio. Es una app web, no una descarga garantizada de App Store."},
 {service:"cleaning-app",topic:"trial",
  keywords:["free trial","trial period","30 days","no card","signup","try the app","prueba gratis","30 dias","sin tarjeta","registrarme"],
  en:"You can try the Cleaning App for 30 days without entering a card; after the trial, the current monthly price appears in the offer. The sample demo uses fictional data.",
  es:"Puedes probar la Cleaning App 30 días sin tarjeta; después se aplica el precio mensual vigente indicado en la oferta. La demo usa datos ficticios."},
 {service:"cleaning-app",topic:"sample",
  keywords:["demo data","sample workspace","real customers","test demo","sample accounts","clientes ficticios","datos de ejemplo","demostracion","cuentas reales"],
  en:"The Cleaning App demo is an interactive sample with invented clients, dates, prices and activities. Nothing in that sample accesses real customer accounts.",
  es:"La demo de Cleaning App tiene clientes, fechas, precios y actividades ficticias. Nada de ese ejemplo accede a cuentas reales."},
 {service:"cleaning-app",topic:"languages",
  keywords:["spanish","english","french","creole","languages","bilingual","idiomas","espanol","ingles","frances","criollo"],
  en:"The Cleaning App is designed for English, Spanish, French and Haitian Creole. If a specific translated screen matters to you, we can verify it before setup.",
  es:"La Cleaning App está diseñada para inglés, español, francés y criollo haitiano. Si necesitas comprobar una pantalla traducida en concreto, podemos revisarla antes de configurar."},
 {service:"website",topic:"existing",
  keywords:["existing website","need a new website","works with my website","website form","connect website","sitio existente","necesito otro website","formulario web","conectar sitio"],
  en:"Website Automation is for an existing website. We review your platform and inquiry form, then set up an inquiry-to-tracker and follow-up workflow where compatible.",
  es:"Website Automation es para un website existente. Revisamos la plataforma y el formulario para preparar un flujo de consultas hacia el tracker y los seguimientos cuando sea compatible."},
 {service:"website",topic:"alerts",
  keywords:["lost messages","website inquiries","alert me","new inquiry","lead tracking","notify me","consultas del website","avisos de clientes","notificaciones web","perder leads"],
  en:"It helps put website inquiries in one place, with owner alerts and follow-up status, rather than leaving messages scattered across inboxes.",
  es:"Ayuda a concentrar consultas del website con avisos y estados de seguimiento, en vez de dejar mensajes dispersos entre bandejas."},
 {service:"website",topic:"scope",
  keywords:["website redesign","redesign my entire website","redesign my website","full redesign","build me a website","change my website design","included pages","landing page","redisenar website","crear website","pagina nueva","incluye diseno"],
  en:"Website Automation organizes incoming inquiries; it isn't automatically a full website redesign. We review your current site and agree on any additional scope before starting.",
  es:"Website Automation organiza consultas entrantes; no incluye automáticamente rediseñar todo el website. Revisamos tu sitio y cualquier trabajo adicional antes de comenzar."},
 {service:"va",topic:"hours",
  keywords:["how many hours","8 hours","va tasks","what does va do","virtual assistant tasks","8 horas","horas incluidas","tareas de asistente","que hace va"],
  en:"VA Essential Support offers up to 8 hours a month for administrative tasks agreed with you in advance. We clarify exactly what is in scope before starting.",
  es:"VA Essential Support ofrece hasta 8 horas mensuales para tareas administrativas acordadas contigo antes de comenzar. Definimos qué está incluido."},
 {service:"va",topic:"limits",
  keywords:["unlimited help","24/7","extra hours","weekends","every day","ilimitado","todos los dias","horas extras","fines de semana"],
  en:"VA support isn't unlimited or guaranteed around the clock. The plan covers the agreed monthly hours; extra tasks or hours need separate confirmation.",
  es:"El apoyo VA no es ilimitado ni garantiza disponibilidad las 24 horas. El plan cubre las horas mensuales acordadas; extras requieren confirmación."},
 {service:"whatsapp",topic:"status",
  keywords:["whatsapp ai","whatsapp assistant","when whatsapp","whatsapp for customers","asistente whatsapp","automatizar whatsapp","disponible whatsapp"],
  en:"WhatsApp AI is listed as Coming Soon and isn't available for purchase yet. AI Booking and AI Follow-Up are currently offered for website or booking workflows.",
  es:"WhatsApp AI aparece como Próximamente y aún no está disponible para comprar. AI Booking y AI Follow-Up son opciones actuales para website o reservas."}
];

function normalize(value:string):string {
 return String(value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g,"").replace(/[?!.,;:]+/g," ").replace(/\s+/g," ").trim();
}
export function findFaq(question:string, service:string, limit=4):Fact[] {
 const q=normalize(question);
 if(!q)return [];
 const result:{fact:Fact,score:number}[]=[];
 for(const fact of FAQ){
  if(fact.service!=="general"&&fact.service!==service)continue;
  let score=0;
  for(const phrase of fact.keywords){
   const needle=normalize(phrase);
   if(q.includes(needle))score=Math.max(score,2+Math.min(needle.length/11,2));
   else if(needle.includes(" ")&&needle.split(" ").length>=3){
    const tokens=needle.split(" ").filter(w=>w.length>3);
    const hits=tokens.filter(w=>q.includes(w)).length;
    if(hits>=2)score=Math.max(score,hits/tokens.length*1.25);
   }
  }
  if(score>0)result.push({fact,score:score+(fact.service===service?0.5:0)});
 }
 return result.sort((a,b)=>b.score-a.score).slice(0,Math.min(6,Math.max(1,limit))).map(x=>x.fact);
}
export function knowledgeForModel(question:string,service:string,language:"en"|"es"):string {
 const facts=findFaq(question,service,5);
 const overview=FAQ.filter(x=>x.service===service).map(x=>x.topic+": "+x[language]).slice(0,22);
 const focused=facts.map(f=>f.topic+": "+f[language]);
 return "RELEVANT ANSWERS:\n"+(focused.length?focused.join("\n"):"None exact; do not invent")+
   "\nVERIFIED SERVICE CAPABILITIES:\n"+overview.join("\n");
}
export function fallbackFaq(question:string,service:string,language:"en"|"es"):string|null {
 const result=findFaq(question,service,2);
 return result.length?result[0][language]:null;
}
