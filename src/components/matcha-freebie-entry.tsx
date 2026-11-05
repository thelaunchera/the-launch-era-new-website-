type MatchaFreebieEntryProps = {
  lang: 'en' | 'es';
};

/** A secondary, low-emphasis entry point on the public cleaning homepage. */
export function MatchaFreebieEntry({ lang }: MatchaFreebieEntryProps) {
  const isSpanish = lang === 'es';
  const href = isSpanish
    ? 'https://podcast.thelaunchera.com/content-lab/prompts/#recibir'
    : 'https://podcast.thelaunchera.com/content-lab/prompts/en/#recibir';

  return (
    <div style={{ marginTop: 11, display: 'flex', justifyContent: 'flex-start' }}>
      <a
        className="tle-matcha-freebie-entry"
        href={href}
        aria-label={isSpanish ? 'Abrir el freebie Matcha con 8 Master Prompts gratis' : 'Open the free Matcha guide with 8 Master Prompts'}
        style={{
          alignItems: 'center',
          background: 'rgba(250,248,243,.92)',
          border: '1px solid rgba(25,25,25,.22)',
          borderRadius: 999,
          color: '#191919',
          display: 'inline-flex',
          fontFamily: "'Prompt', 'DM Sans', sans-serif",
          fontSize: 11,
          fontWeight: 650,
          gap: 8,
          letterSpacing: '.01em',
          lineHeight: 1.3,
          maxWidth: '100%',
          minHeight: 42,
          padding: '8px 13px',
          textDecoration: 'none',
          width: 'fit-content',
        }}
      >
        <span aria-hidden="true" style={{ background: '#F2D85B', borderRadius: '50%', display: 'inline-block', flex: '0 0 8px', height: 8 }} />
        {isSpanish ? 'Freebie Matcha · 8 Master Prompts gratis' : 'Matcha Freebie · 8 Master Prompts'}
      </a>
    </div>
  );
}
