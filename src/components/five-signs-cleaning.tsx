type Language = 'en' | 'es';

const copy = {
  en: {
    eyebrow: 'FOR RESIDENTIAL & COMMERCIAL CLEANING BUSINESSES',
    badge: 'THE LAUNCH ERA · A SIMPLER WORKDAY',
    title: '5 signs your cleaning business has outgrown DMs and spreadsheets.',
    intro: 'Whether you clean homes or commercial spaces, booking requests, client notes and quotes should not live in five different places. Here are five signs it is time for a clearer system.',
    jump: 'Recognize these signs?',
    cta: 'Explore the Cleaning App',
    note: 'See what the Cleaning App does before choosing what your business needs.',
    signsTitle: 'Sound familiar?',
    signsIntro: 'You do not need to be a big company to need a better system.',
    signs: [
      { title: 'New booking requests disappear into messages.', detail: 'You remember seeing the inquiry, but finding the service, address and preferred date takes another search.' },
      { title: 'Client details are in too many places.', detail: 'Access notes, past jobs and customer preferences are spread across texts, screenshots and spreadsheets.' },
      { title: 'Every new quote means starting over.', detail: 'You are hunting for the last conversation before you can send an estimate or record what was discussed.' },
      { title: 'Job notes are hard to find on cleaning day.', detail: 'The team needs clear work details without asking you to scroll through old messages.' },
      { title: 'Following up depends on remembering.', detail: 'A customer asks about a service, you get busy on a job, and the next step is easy to miss.' },
    ],
    shiftLabel: 'LESS SCATTERED INFORMATION',
    shiftTitle: 'Your work needs a home. Not another spreadsheet.',
    shiftText: 'The Launch Era Cleaning App helps organize clients, bookings, quotes, jobs and invoices in one workspace. It works from your phone or computer.',
    toolA: 'Cleaning App',
    toolADesc: 'For running your day: client records, jobs, calendar, quotes and invoices.',
    toolB: 'Personalized Booking Page + Command Center',
    toolBDesc: 'For collecting new service requests and tracking follow-ups. This is a separate service; the Cleaning App is not required.',
    bookingLink: 'See how the Booking Page works',
    sampleNote: 'No invented customer results or promises. Choose the tools that match your workflow.',
    endEyebrow: 'YOUR NEXT STEP',
    endTitle: 'Make the next request easier to manage.',
    endText: 'Start with a clear look at the Cleaning App. You can decide later whether a personalized Booking Page fits your business too.',
    languageLabel: 'Leer en español',
    languageHref: '/es/5-signs-cleaning-business',
  },
  es: {
    eyebrow: 'PARA NEGOCIOS DE LIMPIEZA RESIDENCIAL Y COMERCIAL',
    badge: 'THE LAUNCH ERA · UN DÍA MÁS ORGANIZADO',
    title: '5 señales de que tu negocio de limpieza ya necesita algo más que mensajes y hojas de cálculo.',
    intro: 'Tanto si limpias hogares como espacios comerciales, las reservas, notas de clientes y cotizaciones no deberían estar repartidas en cinco lugares. Estas son cinco señales de que necesitas un sistema más claro.',
    jump: '¿Te pasa esto?',
    cta: 'Conocer la Cleaning App',
    note: 'Mira lo que ofrece la Cleaning App antes de elegir lo que necesita tu negocio.',
    signsTitle: '¿Te suena familiar?',
    signsIntro: 'No necesitas tener una empresa grande para organizarte mejor.',
    signs: [
      { title: 'Las solicitudes nuevas se pierden entre mensajes.', detail: 'Recuerdas que alguien te escribió, pero buscar el servicio, la dirección y la fecha vuelve a tomar tiempo.' },
      { title: 'La información de tus clientes está regada.', detail: 'Las notas de acceso, limpiezas anteriores y preferencias aparecen en mensajes, capturas y documentos distintos.' },
      { title: 'Cada cotización comienza desde cero.', detail: 'Primero tienes que recuperar una conversación antes de preparar un estimado o registrar lo que acordaron.' },
      { title: 'Es difícil encontrar las notas de un trabajo.', detail: 'Tu equipo necesita instrucciones claras sin que tengas que revisar conversaciones viejas.' },
      { title: 'El seguimiento depende de tu memoria.', detail: 'Un cliente pregunta por un servicio, te ocupas limpiando y se te puede pasar el siguiente mensaje.' },
    ],
    shiftLabel: 'MENOS INFORMACIÓN REGADA',
    shiftTitle: 'Tu trabajo necesita un lugar fijo. No otra hoja de cálculo.',
    shiftText: 'The Launch Era Cleaning App te ayuda a organizar clientes, reservas, cotizaciones, trabajos y facturas en un mismo espacio. Funciona desde el celular o la computadora.',
    toolA: 'Cleaning App',
    toolADesc: 'Para el día a día: clientes, trabajos, calendario, cotizaciones y facturas.',
    toolB: 'Booking Page personalizada + Command Center',
    toolBDesc: 'Para recibir solicitudes y organizar seguimientos. Es un servicio independiente; la Cleaning App no es obligatoria.',
    bookingLink: 'Conocer cómo funciona la Booking Page',
    sampleNote: 'Sin resultados de clientes inventados ni promesas exageradas. Elige lo que necesita tu negocio.',
    endEyebrow: 'TU SIGUIENTE PASO',
    endTitle: 'Que la próxima solicitud sea más fácil de organizar.',
    endText: 'Conoce primero la Cleaning App. Después podrás decidir si una Booking Page personalizada también te conviene.',
    languageLabel: 'Read in English',
    languageHref: '/5-signs-cleaning-business',
  },
} as const;

export function FiveSignsCleaning({ lang = 'en' }: { lang?: Language }) {
  const t = copy[lang];
  const es = lang === 'es';
  const appLink = es ? '/es/cleaning-web-app/' : '/cleaning-web-app';
  const bookingLink = es ? '/es/booking-lead-automation/' : '/booking-lead-automation';
  return (
    <main className="tle-five-signs">
      <section className="tle-five-hero" aria-labelledby="tle-five-title">
        <div className="tle-five-inner">
          <div className="tle-five-topline"><span>THE LAUNCH ERA</span><a href={t.languageHref} lang={es ? 'en' : 'es'}>{t.languageLabel}</a></div>
          <div className="tle-five-hero-grid">
            <div className="tle-five-copy">
              <p className="tle-five-eyebrow">{t.eyebrow}</p>
              <h1 id="tle-five-title">{t.title}</h1>
              <p className="tle-five-lead">{t.intro}</p>
              <a className="tle-five-button" href={appLink}>{t.cta}</a>
              <p className="tle-five-microcopy">{t.note}</p>
            </div>
            <div className="tle-five-hero-visual" aria-label={es ? 'Cinco señales de desorganización' : 'Five signs of scattered admin'}>
              <div className="tle-five-visual-label">{t.badge}</div>
              <div className="tle-five-orbit" aria-hidden="true"><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span></div>
              <div className="tle-five-visual-center">
                <span className="tle-five-visual-small">{es ? '¿MENSAJES? ¿NOTAS? ¿COTIZACIONES?' : 'MESSAGES? NOTES? QUOTES?'}</span>
                <strong>{es ? 'Un negocio. Demasiados lugares.' : 'One business. Too many places.'}</strong>
                <span className="tle-five-visual-rule" aria-hidden="true"/>
                <span>{es ? 'Menos buscar. Más claridad.' : 'Less searching. More clarity.'}</span>
              </div>
              <p className="tle-five-visual-caption">{es ? 'Una representación editorial, no una captura de la App.' : 'Editorial illustration, not an App screenshot.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="tle-five-signs-section" id="signs" aria-labelledby="tle-five-signs-heading">
        <div className="tle-five-inner">
          <div className="tle-five-section-header"><p className="tle-five-eyebrow">{t.jump}</p><h2 id="tle-five-signs-heading">{t.signsTitle}</h2><p>{t.signsIntro}</p></div>
          <ol className="tle-five-list">
            {t.signs.map((item, i) => <li key={i} className="tle-five-sign-card">
              <span className="tle-five-count" aria-hidden="true">{String(i + 1).padStart(2,'0')}</span>
              <div><h3>{item.title}</h3><p>{item.detail}</p></div>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="tle-five-solution" aria-labelledby="tle-five-solution-heading">
        <div className="tle-five-inner tle-five-solution-grid">
          <div className="tle-five-solution-intro"><p className="tle-five-eyebrow">{t.shiftLabel}</p><h2 id="tle-five-solution-heading">{t.shiftTitle}</h2><p>{t.shiftText}</p><a className="tle-five-button" href={appLink}>{t.cta}</a></div>
          <div className="tle-five-tool-stack">
            <article className="tle-five-tool-card"><span>01 / WORKSPACE</span><h3>{t.toolA}</h3><p>{t.toolADesc}</p></article>
            <article className="tle-five-tool-card"><span>02 / OPTIONAL SEPARATE SERVICE</span><h3>{t.toolB}</h3><p>{t.toolBDesc}</p><a href={bookingLink}>{t.bookingLink}</a></article>
          </div>
        </div>
      </section>

      <section className="tle-five-finish" aria-labelledby="tle-five-end-title">
        <div className="tle-five-inner tle-five-finish-inner">
          <p className="tle-five-eyebrow">{t.endEyebrow}</p>
          <h2 id="tle-five-end-title">{t.endTitle}</h2>
          <p>{t.endText}</p>
          <a className="tle-five-button" href={appLink}>{t.cta}</a>
          <small>{t.sampleNote}</small>
        </div>
      </section>
    </main>
  );
}
