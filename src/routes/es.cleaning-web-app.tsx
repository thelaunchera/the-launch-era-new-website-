import { createFileRoute } from '@tanstack/react-router';
import { CleaningAppEditorial } from '../components/cleaning-app-editorial';

export const Route = createFileRoute('/es/cleaning-web-app')({
  head: () => ({
    meta: [
      { title: 'Cleaning App para Negocios de Limpieza | The Launch Era' },
      { name: 'description', content: 'Organiza reservas, clientes, trabajos, cotizaciones, facturas y rutas en una Cleaning App sencilla para tu negocio de limpieza.' },
      { property: 'og:title', content: 'Cleaning App para Negocios de Limpieza | The Launch Era' },
      { property: 'og:description', content: 'Organiza reservas, clientes, trabajos, cotizaciones, facturas y rutas en una Cleaning App sencilla para tu negocio de limpieza.' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ],
    links: [
      { rel: 'canonical', href: 'https://thelaunchera.com/es/cleaning-web-app/' },
      { rel: 'alternate', hrefLang: 'en-US', href: 'https://thelaunchera.com/cleaning-web-app' },
      { rel: 'alternate', hrefLang: 'es-US', href: 'https://thelaunchera.com/es/cleaning-web-app/' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://thelaunchera.com/cleaning-web-app' },
      { rel: 'stylesheet', href: '/assets/tle-app-landing.css?v=20261013-short-1' },
      { rel: 'stylesheet', href: '/assets/tle-cleaning-case-study.css?v=20261013-01' }
    ]
  }),
  component: Page
});

function Page() { return <CleaningAppEditorial lang="es"/>; }
