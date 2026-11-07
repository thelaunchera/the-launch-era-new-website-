import { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  Instagram,
  Menu,
  X,
} from 'lucide-react';

type Language = 'es' | 'en';
type Route = 'home' | 'contact' | 'privacy' | 'terms' | 'product';
type Product = {
  id: string;
  name: Record<Language, string>;
  category: Record<Language, string>;
  description: Record<Language, string>;
  image: string;
  position?: string;
};

const photos = {
  hero: '/demos/la-vie-in-pink/resources/36a1bfe5-3660-4b7e-964d-8031fe824941.png',
  croissant: '/demos/la-vie-in-pink/resources/8572492e-4032-4e82-a5d3-7e087ec38613.png',
  breakfast: '/demos/la-vie-in-pink/resources/28efa0a2-eefe-40b3-9398-b25bb8e0532a.png',
  pastry: '/demos/la-vie-in-pink/resources/3ab35897-f8f3-4dcb-bc98-3ed74cc6aa16.png',
  chef: '/demos/la-vie-in-pink/resources/4d3f2997-94a4-4af4-826d-bd40f493cb62.png',
  interior: '/demos/la-vie-in-pink/resources/0a8472e4-57b2-4259-81cb-0b3e156e09c6.png',
  customers: '/demos/la-vie-in-pink/resources/07f9bcb7-9784-42d5-b155-cd42ec3d207c.png',
  gifting: '/demos/la-vie-in-pink/resources/d27af730-b413-4fa8-8502-84431ef687eb.png',
  forTwo: '/demos/la-vie-in-pink/resources/bdea766e-ea26-4756-9a9f-659d473627ef.png',
  breakfastHero: '/demos/la-vie-in-pink/resources/3674f67a-abe7-4116-b01c-19afb41ae3d5.png',
};

const fallbacks = {
  storefront: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1800&q=85',
  croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1500&q=85',
  breakfast: 'https://images.unsplash.com/photo-1558909552-8fcf7c94b575?auto=format&fit=crop&w=1500&q=85',
  pastry: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=1400&q=85',
  chef: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=85',
  interior: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=85',
  customers: 'https://images.unsplash.com/photo-1558909552-8fcf7c94b575?auto=format&fit=crop&w=1400&q=85',
  gifting: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=1400&q=85',
  forTwo: 'https://images.unsplash.com/photo-1558909552-8fcf7c94b575?auto=format&fit=crop&w=1400&q=85',
  breakfastHero: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1400&q=85',
};

type EditorialPhotoProps = {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  style?: React.CSSProperties;
};

function EditorialPhoto({
  src,
  fallback,
  alt,
  className,
  loading = 'lazy',
  fetchPriority,
  style,
}: EditorialPhotoProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      style={style}
      onError={event => {
        const image = event.currentTarget;
        // The approved original PNG is a local backup if a generated WebP fails.
        const originalPng = src.endsWith('.webp') ? src.slice(0, -5) + '.png' : null;
        if (originalPng && !image.src.endsWith('.png')) {
          image.src = originalPng;
        } else if (image.src !== fallback) {
          image.src = fallback;
        }
      }}
    />
  );
}

const products: Product[] = [
  {
    id: 'croissants',
    name: { es: 'Croissants gourmet', en: 'Gourmet croissants' },
    category: { es: '01 / LA ESPECIALIDAD', en: '01 / THE SPECIALTY' },
    description: {
      es: 'Capas doradas, textura delicada y ese primer bocado que hace especial cualquier mañana. Variedades y sabores por confirmar.',
      en: 'Golden layers, delicate texture, and that first bite that makes any morning feel special. Flavors and varieties to be confirmed.',
    },
    image: photos.croissant,
    position: 'center 58%',
  },
  {
    id: 'breakfast',
    name: { es: 'Desayunos europeos', en: 'European breakfasts' },
    category: { es: '02 / EL RITUAL', en: '02 / THE RITUAL' },
    description: {
      es: 'Una invitación a desayunar sin prisa. Una colección inspirada en las mesas y rituales de Europa, todavía en preparación.',
      en: 'An invitation to slow down at breakfast. A collection inspired by European tables and morning rituals, still in development.',
    },
    image: photos.breakfast,
    position: 'center 52%',
  },
  {
    id: 'pastries',
    name: { es: 'Pastelería & pastries', en: 'Pastries & pâtisserie' },
    category: { es: '03 / LOS PEQUEÑOS PLACERES', en: '03 / LITTLE PLEASURES' },
    description: {
      es: 'Dulces para acompañar un café, compartir una sobremesa o regalar un momento bonito. Selección en desarrollo.',
      en: 'Sweet little pleasures for coffee, slow afternoons, and thoughtful gifting. Selection in development.',
    },
    image: photos.pastry,
    position: 'center',
  },
];

const content = {
  es: {
    strip: 'UN PEQUEÑO RINCÓN DE EUROPA, MUY CERCA DE TI',
    nav: ['Inicio', 'Colección', 'Nuestra historia', 'Membresías', 'Contacto'],
    eyebrow: 'INSPIRADO EN LOS DESAYUNOS DE EUROPA',
    heroTitle1: 'Un pedacito',
    heroTitle2: 'de Europa,',
    heroTitle3: 'en cada bocado.',
    heroDescription:
      'Croissants gourmet, desayunos de inspiración europea y pequeños placeres de pastelería para quienes extrañan esos sabores de casa.',
    discover: 'Explorar la colección',
    heroNote: 'El placer de las mañanas lentas',
    heroPhoto: 'Imagen conceptual de la tienda · creada con IA',
    index: 'HECHO PARA DISFRUTAR DESPACIO',
    introTitle: 'Algunos sabores te llevan de vuelta a casa.',
    introBody:
      'Hay recuerdos que viven en el aroma del café y en el crujido de un croissant. La vie in pink nace de esa sensación: acercar la magia de un desayuno europeo a tus días de hoy.',
    collectionEyebrow: 'LA COLECCIÓN',
    collectionTitle: 'Para cada antojo, un pequeño viaje.',
    collectionIntro:
      'Descubre las categorías que estamos preparando. El menú final, los precios y la disponibilidad se anunciarán más adelante.',
    explore: 'Descubrir',
    limited: 'Colección en preparación',
    storyEyebrow: 'NUESTRA HISTORIA',
    storyTitle: 'Nostalgia que sabe a algo bonito.',
    storyBody:
      'Pensado para quienes llevan un poquito de Europa en el corazón: una pausa para recordar sabores familiares, descubrir otros nuevos y celebrar las cosas sencillas.',
    storyQuote: 'Porque a veces estar en casa empieza con un solo bocado.',
    storyLink: 'Conoce nuestra inspiración',
    galleryEyebrow: 'EL UNIVERSO LA VIE IN PINK',
    galleryTitle: 'Un vistazo a nuestras mañanas.',
    galleryNote:
      'Visualizaciones conceptuales creadas con IA. La fachada, las personas y el interior no representan un local ni empleados reales.',
    membersEyebrow: 'PRÓXIMAMENTE',
    membersTitle: 'Tu ritual favorito, una y otra vez.',
    membersBody:
      'Estamos imaginando un pequeño club para quienes nunca dicen que no a un buen desayuno. Las opciones, los beneficios y los precios se definirán antes de abrir inscripciones.',
    memberBenefits: [
      'Novedades de temporada',
      'Pequeños momentos especiales',
      'Beneficios por anunciar',
    ],
    memberButton: 'Preguntar por el club',
    memberStatus: 'Sin inscripciones ni cobros activos',
    faqEyebrow: 'ANTES DEL PRIMER BOCADO',
    faqTitle: 'Preguntas frecuentes.',
    faqs: [
      [
        '¿Puedo comprar en la web?',
        'Todavía no. Esta es una primera vista de la marca; las compras se habilitarán cuando se confirmen el catálogo, los precios y el método de pago.',
      ],
      [
        '¿Ya están disponibles los desayunos y pastries?',
        'El menú, la disponibilidad y las opciones de entrega o recogida aún están por confirmar.',
      ],
      [
        '¿Cómo funcionan las membresías?',
        'La sección presenta una idea futura del club. No hay planes, precios ni suscripciones activos por el momento.',
      ],
      [
        '¿Puedo enviar una consulta?',
        'La página de contacto está diseñada; el envío por correo se habilitará cuando se conecte y pruebe el servicio de mensajes.',
      ],
    ],
    footerTag: 'Un sabor familiar. Una manera nueva de disfrutarlo.',
    footerExplore: 'EXPLORAR',
    footerHelp: 'INFORMACIÓN',
    footHome: 'Inicio',
    footCollection: 'Colección',
    footStory: 'Nuestra historia',
    footClub: 'Membresías',
    footContact: 'Contacto',
    footFaq: 'Preguntas frecuentes',
    footPrivacy: 'Política de privacidad',
    footTerms: 'Términos y condiciones',
    copyright: 'Todos los derechos reservados.',
    contactEyebrow: 'HABLEMOS',
    contactTitle: 'Siempre hay tiempo para un café.',
    contactBody:
      '¿Tienes alguna pregunta sobre la colección o el futuro club? Preparamos este espacio para conversar.',
    contactNotice:
      'Vista previa: el envío de mensajes todavía no está conectado. No introduzcas información confidencial.',
    name: 'Nombre',
    email: 'Correo electrónico',
    message: 'Tu mensaje',
    namePlaceholder: 'Tu nombre',
    emailPlaceholder: 'tucorreo@ejemplo.com',
    msgPlaceholder: 'Cuéntanos qué te gustaría saber…',
    send: 'Enviar mensaje',
    contactResponse:
      'Este formulario es una vista previa. Tu mensaje no se ha enviado ni guardado. Se activará cuando conectemos el servicio de correo.',
    back: 'Volver al inicio',
    detailTag: 'UNA CATEGORÍA DE LA COLECCIÓN',
    availability: 'Menú, precios y disponibilidad por confirmar.',
    ask: 'Consultar esta categoría',
    other: 'Explora también',
    privacyTitle: 'Política de privacidad',
    termsTitle: 'Términos y condiciones',
    legalEyebrow: 'INFORMACIÓN LEGAL',
    privacyBody:
      'Esta página es un borrador para revisión antes del lanzamiento. Esta vista previa no procesa pagos, no crea cuentas de miembros y no transmite los datos del formulario de contacto. Cuando se conecten servicios de contacto, analítica y venta, habrá que actualizar esta política para explicar qué datos se recogen, con qué fines y cómo ejercer los derechos correspondientes.',
    termsBody:
      'Estos términos son un borrador pendiente de revisión antes del lanzamiento comercial. Actualmente no se aceptan pedidos, pagos, reservas ni suscripciones en este sitio. Los precios, las condiciones de entrega, cancelación, devoluciones y membresía deberán publicarse cuando el negocio confirme sus políticas.',
    preview: 'VISTA PREVIA · NO ACEPTA PAGOS',
    imageAlt: 'Visualización de la fachada exterior de La vie in pink',
  },
  en: {
    strip: 'A LITTLE CORNER OF EUROPE, CLOSER TO HOME',
    nav: ['Home', 'Collection', 'Our story', 'Memberships', 'Contact'],
    eyebrow: 'INSPIRED BY EUROPEAN MORNINGS',
    heroTitle1: 'A little taste',
    heroTitle2: 'of Europe,',
    heroTitle3: 'in every bite.',
    heroDescription:
      'Gourmet croissants, European-inspired breakfasts, and little pastry pleasures for those who miss the flavors of home.',
    discover: 'Explore the collection',
    heroNote: 'The pleasure of slow mornings',
    heroPhoto: 'Concept storefront · AI-generated image',
    index: 'MADE FOR SAVORING SLOWLY',
    introTitle: 'Some flavors take you right back home.',
    introBody:
      'Some memories live in the aroma of coffee and the crunch of a croissant. La vie in pink is inspired by that feeling: bringing the magic of a European breakfast into everyday life.',
    collectionEyebrow: 'THE COLLECTION',
    collectionTitle: 'A little journey for every craving.',
    collectionIntro:
      'Discover the categories we are planning. Final menus, pricing, and availability will be announced later.',
    explore: 'Discover',
    limited: 'Collection in development',
    storyEyebrow: 'OUR STORY',
    storyTitle: 'Nostalgia never tasted so lovely.',
    storyBody:
      'For those who carry a little piece of Europe in their hearts: a pause to remember familiar flavors, find new favorites, and celebrate the simple things.',
    storyQuote: 'Because sometimes feeling at home begins with one bite.',
    storyLink: 'Discover our inspiration',
    galleryEyebrow: 'THE LA VIE IN PINK WORLD',
    galleryTitle: 'A glimpse of our mornings.',
    galleryNote:
      'AI-generated concept visuals. The storefront, people, and interior do not depict an actual location or real employees.',
    membersEyebrow: 'COMING SOON',
    membersTitle: 'Your favorite ritual, on repeat.',
    membersBody:
      'We are dreaming up a little club for people who never say no to a beautiful breakfast. Plans, benefits, and pricing will be confirmed before enrollment opens.',
    memberBenefits: [
      'Seasonal discoveries',
      'Thoughtful little moments',
      'Benefits to be announced',
    ],
    memberButton: 'Ask about the club',
    memberStatus: 'No active enrollment or charges',
    faqEyebrow: 'BEFORE THE FIRST BITE',
    faqTitle: 'Frequently asked questions.',
    faqs: [
      [
        'Can I order through the website?',
        'Not yet. This is an early brand preview. Ordering will be enabled after the menu, prices, and payment method have been confirmed.',
      ],
      [
        'Are breakfasts and pastries available now?',
        'The final menu, availability, and delivery or pickup options have not yet been confirmed.',
      ],
      [
        'How do memberships work?',
        'This section previews a future club idea. There are currently no active plans, prices, or subscriptions.',
      ],
      [
        'Can I send a question?',
        'The dedicated contact page is designed. Email delivery will become available once the messaging service has been connected and tested.',
      ],
    ],
    footerTag: 'A familiar flavor. A lovely new way to enjoy it.',
    footerExplore: 'EXPLORE',
    footerHelp: 'INFORMATION',
    footHome: 'Home',
    footCollection: 'Collection',
    footStory: 'Our story',
    footClub: 'Memberships',
    footContact: 'Contact',
    footFaq: 'FAQ',
    footPrivacy: 'Privacy policy',
    footTerms: 'Terms & conditions',
    copyright: 'All rights reserved.',
    contactEyebrow: 'SAY BONJOUR',
    contactTitle: 'There is always time for coffee.',
    contactBody:
      'Have a question about the collection or our future club? This is where our conversation will begin.',
    contactNotice:
      'Preview: message delivery is not connected yet. Please do not enter confidential information.',
    name: 'Name',
    email: 'Email address',
    message: 'Your message',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@example.com',
    msgPlaceholder: 'Tell us what you would like to know…',
    send: 'Send message',
    contactResponse:
      'This form is a preview. Your message was not sent or stored. Delivery will be enabled once an email service is connected.',
    back: 'Back to home',
    detailTag: 'A COLLECTION CATEGORY',
    availability: 'Menu, prices, and availability to be confirmed.',
    ask: 'Ask about this category',
    other: 'You may also love',
    privacyTitle: 'Privacy policy',
    termsTitle: 'Terms & conditions',
    legalEyebrow: 'LEGAL INFORMATION',
    privacyBody:
      'This page is a draft requiring review before launch. This preview does not process payments, create member accounts, or transmit contact-form entries. Once contact, analytics, and sales services are connected, this policy must be updated to explain what data is collected, for which purposes, and how users can exercise relevant rights.',
    termsBody:
      'These terms are a draft requiring review before commercial launch. This website currently does not accept orders, payments, reservations, or subscriptions. Prices, fulfillment terms, cancellations, refunds, and membership policies must be published after the business confirms them.',
    preview: 'PREVIEW · NO PAYMENTS ACCEPTED',
    imageAlt: 'Conceptual street-facing La vie in pink bakery storefront',
  },
};

const routeFromHash = (): { page: Route; productId: string | null } => {
  const path = window.location.hash.replace(/^#\/?/, '');
  if (path.startsWith('product/'))
    return { page: 'product', productId: path.split('/')[1] };
  if (path === 'contact' || path === 'privacy' || path === 'terms')
    return { page: path, productId: null };
  return { page: 'home', productId: null };
};

function App() {
  const [lang, setLang] = useState<Language>(() =>
    localStorage.getItem('lavie-language') === 'en' ? 'en' : 'es'
  );
  const [location, setLocation] = useState(routeFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formResult, setFormResult] = useState(false);
  const t = content[lang];
  const selected = products.find(item => item.id === location.productId);

  useEffect(() => {
    const onHashChange = () => {
      setLocation(routeFromHash());
      setMenuOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('lavie-language', lang);
    document.title =
      'La vie in pink — ' +
      (lang === 'es' ? 'Un pedacito de Europa' : 'A little taste of Europe');
  }, [lang]);

  function navigate(path: string, section?: string) {
    const targetHash = '#/' + path;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      setLocation(routeFromHash());
    }
    setMenuOpen(false);
    if (section) {
      window.setTimeout(
        () =>
          document
            .getElementById(section)
            ?.scrollIntoView({ behavior: 'smooth' }),
        90
      );
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function openContact() {
    navigate('contact');
    setFormResult(false);
  }

  const Logo = ({ light = false }: { light?: boolean }) => (
    <button
      className={'logo ' + (light ? 'logo-light' : '')}
      aria-label="La vie in pink — Home"
      onClick={() => navigate('home')}
    >
      <span className="logo-main">
        La vie <i>in</i> pink<span className="logo-period">.</span>
      </span>
      <span className="logo-small">EUROPEAN-INSPIRED PATISSERIE</span>
    </button>
  );

  const Footer = () => (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo light />
          <p>{t.footerTag}</p>
          <span className="footer-ornament">BONJOUR</span>
        </div>
        <div className="footer-column">
          <span className="footer-column-title">{t.footerExplore}</span>
          <button onClick={() => navigate('home')}>{t.footHome}</button>
          <button onClick={() => navigate('home', 'collection')}>
            {t.footCollection}
          </button>
          <button onClick={() => navigate('home', 'story')}>
            {t.footStory}
          </button>
          <button onClick={() => navigate('home', 'membership')}>
            {t.footClub}
          </button>
        </div>
        <div className="footer-column">
          <span className="footer-column-title">{t.footerHelp}</span>
          <button onClick={openContact}>{t.footContact}</button>
          <button onClick={() => navigate('home', 'faq')}>{t.footFaq}</button>
          <button onClick={() => navigate('privacy')}>{t.footPrivacy}</button>
          <button onClick={() => navigate('terms')}>{t.footTerms}</button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} La vie in pink. {t.copyright}
        </span>
        <span className="footer-powered">Powered by The Launch Era</span>
      </div>
    </footer>
  );

  return (
    <div className="site-shell">
      <div className="announcement">
        {t.strip}
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="menu-button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
          <Logo />
          <nav
            className={'desktop-nav ' + (menuOpen ? 'mobile-open' : '')}
            aria-label="Main navigation"
          >
            <button onClick={() => navigate('home')}>{t.nav[0]}</button>
            <button onClick={() => navigate('home', 'collection')}>
              {t.nav[1]}
            </button>
            <button onClick={() => navigate('home', 'story')}>
              {t.nav[2]}
            </button>
            <button onClick={() => navigate('home', 'membership')}>
              {t.nav[3]}
            </button>
            <button className="mobile-contact" onClick={openContact}>
              {t.nav[4]}
            </button>
          </nav>
          <div className="header-actions">
            <div className="language-switch" aria-label="Website language">
              <button
                className={lang === 'es' ? 'active' : ''}
                aria-pressed={lang === 'es'}
                onClick={() => setLang('es')}
              >
                ES
              </button>
              <span>/</span>
              <button
                className={lang === 'en' ? 'active' : ''}
                aria-pressed={lang === 'en'}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
            <button className="header-contact" onClick={openContact}>
              {t.nav[4]} 
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        {location.page === 'home' && (
          <>
            <section className="hero">
              <div className="hero-content">
                <div className="eyebrow with-line">{t.eyebrow}</div>
                <h1>
                  {t.heroTitle1}
                  <br />
                  <em>{t.heroTitle2}</em>
                  <br />
                  {t.heroTitle3}
                </h1>
                <p className="hero-description">{t.heroDescription}</p>
                <button
                  className="button-primary"
                  onClick={() => navigate('home', 'collection')}
                >
                  {t.discover}
                </button>
                <div className="hero-bottom">
                  <span>{t.heroNote}</span>
                </div>
              </div>
              <div className="hero-image-wrap">
                <EditorialPhoto
                  className="hero-image"
                  src={photos.hero}
                  fallback={fallbacks.storefront}
                  alt={t.imageAlt}
                  loading="eager"
                  fetchPriority="high"
                />
                <span className="hero-image-credit">{t.heroPhoto}</span>
                <div className="hero-stamp">
                  <span>
                    LA VIE
                    <br />
                    IN PINK
                  </span>
                  <small>EST. WITH LOVE</small>
                </div>
              </div>
            </section>

            <section className="ticker" aria-label={t.index}>
              <span>UN PEU DE DOUCEUR</span>
              <span>THE ART OF SLOW MORNINGS</span>
              <span>MADE WITH AMOUR</span>
              <span>UN PEU DE DOUCEUR</span>
            </section>

            <section className="intro section-container">
              <div className="eyebrow muted">{t.index}</div>
              <h2>{t.introTitle}</h2>
              <p>{t.introBody}</p>
              <span className="intro-drawing" aria-hidden="true">
                ♡
              </span>
            </section>

            <section className="collection section-container" id="collection">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">{t.collectionEyebrow}</div>
                  <h2>{t.collectionTitle}</h2>
                </div>
                <p>{t.collectionIntro}</p>
              </div>
              <div className="product-grid">
                {products.map(product => (
                  <article className="product-card" key={product.id}>
                    <button
                      className="product-image-button"
                      aria-label={product.name[lang]}
                      onClick={() => navigate('product/' + product.id)}
                    >
                      <EditorialPhoto
                        src={product.image}
                        fallback={product.id === 'croissants' ? fallbacks.croissant : product.id === 'breakfast' ? fallbacks.breakfast : fallbacks.pastry}
                        alt={product.name[lang]}
                        loading="lazy"
                        style={{ objectPosition: product.position || 'center' }}
                      />
                      
                    </button>
                    <div className="product-meta">
                      <div>
                        <span className="micro-label">
                          {product.category[lang]}
                        </span>
                        <h3>{product.name[lang]}</h3>
                      </div>
                      <button
                        className="product-view-button"
                        aria-label={t.explore + ' ' + product.name[lang]}
                        onClick={() => navigate('product/' + product.id)}
                      >
                        {lang === 'es' ? 'Ver' : 'View'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <p className="collection-notice">{t.limited}</p>
            </section>

            <section className="story-block" id="story">
              <div className="story-image">
                <EditorialPhoto
                  src={photos.chef}
                  fallback={fallbacks.chef}
                  alt={lang === 'es' ? 'Imagen conceptual de una pastelera preparando croissants' : 'Concept photo of a pastry chef preparing croissants'}
                  loading="lazy"
                />
              </div>
              <div className="story-copy">
                <span className="eyebrow">{t.storyEyebrow}</span>
                <h2>{t.storyTitle}</h2>
                <p>{t.storyBody}</p>
                <blockquote>“{t.storyQuote}”</blockquote>
                <button className="text-link" onClick={openContact}>
                  {t.storyLink}
                  
                </button>
              </div>
            </section>

            <section className="gallery-section section-container">
              <div className="gallery-top">
                <div>
                  <div className="eyebrow">{t.galleryEyebrow}</div>
                  <h2>{t.galleryTitle}</h2>
                </div>
                <span className="gallery-heart">♡</span>
              </div>
              <div className="gallery-grid">
                <div className="gallery-photo gallery-tall">
                  <EditorialPhoto src={photos.interior} fallback={fallbacks.interior} alt="Conceptual La vie in pink bakery interior" />
                </div>
                <div className="gallery-photo">
                  <EditorialPhoto src={photos.customers} fallback={fallbacks.customers} alt="Conceptual image of customers sharing a European breakfast" />
                </div>
                <div className="gallery-photo">
                  <EditorialPhoto src={photos.gifting} fallback={fallbacks.gifting} alt="Pastries inside an elegant burgundy-ribboned gift box" />
                </div>
                <div className="gallery-photo">
                  <EditorialPhoto src={photos.breakfastHero} fallback={fallbacks.breakfastHero} alt="Gourmet croissants and coffee served at a European café table" />
                </div>
                <div className="gallery-photo">
                  <EditorialPhoto src={photos.forTwo} fallback={fallbacks.forTwo} alt="Elegant European breakfast for two" />
                </div>
              </div>
              <p className="gallery-note">{t.galleryNote}</p>
            </section>

            <section className="membership-section" id="membership">
              <div className="membership-inner">
                <div className="eyebrow light">{t.membersEyebrow}</div>
                <h2>{t.membersTitle}</h2>
                <p>{t.membersBody}</p>
                <div className="member-benefits">
                  {t.memberBenefits.map(benefit => (
                    <span key={benefit}>
                      <Check size={14} />
                      {benefit}
                    </span>
                  ))}
                </div>
                <button className="button-cream" onClick={openContact}>
                  {t.memberButton}
                  
                </button>
                <span className="membership-status">{t.memberStatus}</span>
              </div>
            </section>

            <section className="faq-section section-container" id="faq">
              <div className="faq-title">
                <span className="eyebrow">{t.faqEyebrow}</span>
                <h2>{t.faqTitle}</h2>
              </div>
              <div className="faq-items">
                {t.faqs.map((faq, idx) => (
                  <details key={idx}>
                    <summary>
                      {faq[0]}
                      <ChevronDown size={20} />
                    </summary>
                    <p>{faq[1]}</p>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}

        {location.page === 'product' && selected && (
          <section className="detail-page">
            <div className="detail-photo">
              <EditorialPhoto src={selected.image} fallback={selected.id === 'croissants' ? fallbacks.croissant : selected.id === 'breakfast' ? fallbacks.breakfast : fallbacks.pastry} alt={selected.name[lang]} />
            </div>
            <div className="detail-content">
              <button
                className="back-link"
                onClick={() => navigate('home', 'collection')}
              >
                
                {t.back}
              </button>
              <div className="eyebrow">{t.detailTag}</div>
              <h1>
                {selected.name[lang]}
                <em>.</em>
              </h1>
              <p>{selected.description[lang]}</p>
              <div className="detail-notice">{t.availability}</div>
              <button className="button-primary" onClick={openContact}>
                {t.ask}
                
              </button>
              <p className="detail-other">{t.other}</p>
              <div className="detail-links">
                {products
                  .filter(p => p.id !== selected.id)
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => navigate('product/' + p.id)}
                    >
                      {p.name[lang]} 
                    </button>
                  ))}
              </div>
            </div>
          </section>
        )}

        {location.page === 'contact' && (
          <section className="contact-page">
            <div className="contact-intro">
              <span className="eyebrow light">{t.contactEyebrow}</span>
              <h1>{t.contactTitle}</h1>
              <p>{t.contactBody}</p>
              <span className="contact-script">
                avec amour, La vie in pink ♡
              </span>
            </div>
            <div className="contact-form-panel">
              <button className="back-link" onClick={() => navigate('home')}>
                
                {t.back}
              </button>
              <div className="form-notice">{t.contactNotice}</div>
              <form
                onSubmit={event => {
                  event.preventDefault();
                  setFormResult(true);
                }}
              >
                <label htmlFor="contact-name">{t.name}</label>
                <input
                  required
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder={t.namePlaceholder}
                />
                <label htmlFor="contact-email">{t.email}</label>
                <input
                  required
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t.emailPlaceholder}
                />
                <label htmlFor="contact-message">{t.message}</label>
                <textarea
                  required
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder={t.msgPlaceholder}
                />
                <button className="button-primary" type="submit">
                  {t.send}
                  
                </button>
                {formResult && (
                  <div className="form-result" role="status">
                    {t.contactResponse}
                  </div>
                )}
              </form>
            </div>
          </section>
        )}

        {(location.page === 'privacy' || location.page === 'terms') && (
          <section className="legal-page section-container">
            <button className="back-link" onClick={() => navigate('home')}>
              
              {t.back}
            </button>
            <span className="eyebrow">{t.legalEyebrow}</span>
            <h1>
              {location.page === 'privacy' ? t.privacyTitle : t.termsTitle}
            </h1>
            <div className="legal-content">
              <p>{location.page === 'privacy' ? t.privacyBody : t.termsBody}</p>
              <button className="text-link" onClick={openContact}>
                {t.footContact}
                
              </button>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <div className="preview-ribbon">{t.preview}</div>
    </div>
  );
}

export default App;

