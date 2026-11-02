import './content-lab-referral.css';

const labEs = 'https://podcast.thelaunchera.com/content-lab/descubre/';
const labEn = 'https://podcast.thelaunchera.com/content-lab/descubre/en/';

/** A quiet, separate resource after the cleaning-business sales journey. */
export function ContentLabReferral({lang='en'}:{lang?:'en'|'es'}) {
  const es = lang === 'es';
  return <section className="tle-content-lab-referral" aria-labelledby="tle-content-lab-referral-title">
    <div className="tle-content-lab-referral-inner">
      <div className="tle-content-lab-referral-copy">
        <p className="tle-content-lab-referral-label">{es?'RECURSO CREATIVO ADICIONAL':'OPTIONAL CREATIVE TOOL'}</p>
        <h2 id="tle-content-lab-referral-title">{es?'¿También creas contenido para redes?':'Creating social posts, too?'}</h2>
        <p>{es
          ? 'Content Lab es un espacio separado para diseñar posts y carruseles, organizar tu grid y planificar publicaciones. No forma parte de la Cleaning App ni del sistema de reservas.'
          : 'Content Lab is a separate space for designing posts and carousels, previewing your feed and planning content. It is not part of the Cleaning App or booking system.'}</p>
      </div>
      <div className="tle-content-lab-referral-actions">
        <a className="tle-content-lab-referral-button" href={es?labEs:labEn} rel="noopener noreferrer">{es?'Explorar Content Lab':'Explore Content Lab'}</a>
        <a className="tle-content-lab-referral-language" href={es?labEn:labEs} lang={es?'en':'es'} hrefLang={es?'en':'es'}>{es?'English version':'Ver en español'}</a>
      </div>
    </div>
  </section>;
}
