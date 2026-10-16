import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import './faq-topic-tabs.css';

export type FAQItem = readonly [question: string, answer: string];
type Language = 'en' | 'es';
type Props = {
  lang?: Language;
  billing: readonly FAQItem[];
  account: readonly FAQItem[];
  privacy?: readonly FAQItem[];
};

function privacyQuestions(lang: Language): FAQItem[] {
  return lang === 'es'
    ? [
        ['¿Dónde puedo consultar cómo se utilizan mis datos?', 'Consulta nuestra Política de Privacidad para conocer cómo manejamos la información que compartes en el website.'],
        ['¿Cómo puedo hacer una pregunta sobre privacidad?', 'Puedes enviarnos tu pregunta a través de nuestro formulario de contacto antes de compartir información de tu negocio.'],
      ]
    : [
        ['Where can I read how my information is used?', 'Our Privacy Policy explains how information you share through the website is handled.'],
        ['How can I ask a privacy question?', 'Use our contact form to ask us about privacy before sharing business information.'],
      ];
}

/** Accessible, animated FAQ tabs. Each panel keeps its native details/summary questions. */
export function FAQTopicTabs({ lang = 'en', billing, account, privacy }: Props) {
  const base = useId().replace(/:/g, '');
  const [active, setActive] = useState(0);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const panels = useRef<Array<HTMLDivElement | null>>([]);
  const es = lang === 'es';
  const groups = [
    { label: es ? 'Pagos' : 'Billing', questions: billing },
    { label: es ? 'Cuenta' : 'Account', questions: account },
    { label: es ? 'Privacidad' : 'Privacy', questions: privacy ?? privacyQuestions(lang) },
  ];

  useEffect(() => {
    const panel = panels.current[active];
    if (!panel) return;
    const measure = () => setPanelHeight(Math.ceil(panel.scrollHeight));
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(panel);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [active, lang]);

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % groups.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + groups.length) % groups.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = groups.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="tle-faq-topics">
      <div
        className="tle-faq-tablist"
        role="tablist"
        aria-label={es ? 'Temas de preguntas frecuentes' : 'Frequently asked questions by topic'}
        style={{ '--faq-active': active } as CSSProperties}
      >
        {groups.map((group, index) => (
          <button
            key={group.label}
            ref={(node) => { tabs.current[index] = node; }}
            id={base + '-tab-' + index}
            type="button"
            role="tab"
            aria-controls={base + '-panel-' + index}
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
          >
            {group.label}
          </button>
        ))}
        <span className="tle-faq-tab-indicator" aria-hidden="true" />
      </div>
      <div className="tle-faq-panels" style={{ height: panelHeight ?? undefined }}>
        {groups.map((group, index) => (
          <div
            key={group.label}
            ref={(node) => { panels.current[index] = node; }}
            className="tle-faq-panel"
            id={base + '-panel-' + index}
            role="tabpanel"
            aria-labelledby={base + '-tab-' + index}
            aria-hidden={index !== active}
            tabIndex={index === active ? 0 : -1}
            inert={index !== active}
            data-active={index === active ? 'true' : 'false'}
            style={{ '--o': index - active } as CSSProperties}
          >
            <div className="tle-faq-question-list">
              {group.questions.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    <span>{question}</span>
                    <Plus size={19} aria-hidden="true" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
            {index === 2 && (
              <a className="tle-faq-privacy-link" href={es ? '/es/privacy.html' : '/privacy.html'}>
                {es ? 'Leer la Política de Privacidad' : 'Read our Privacy Policy'}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
