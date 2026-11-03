import { createFileRoute } from '@tanstack/react-router';
import { FiveSignsCleaning } from '@/components/five-signs-cleaning';

export const Route = createFileRoute('/es/5-signs-cleaning-business')({
  head: () => ({
    meta: [
      { title: '5 Señales de que Tu Negocio de Limpieza Necesita Organizarse | The Launch Era' },
      { name: 'description', content: 'Solicitudes perdidas, clientes desorganizados, cotizaciones manuales y seguimientos pendientes. Reconoce cinco señales y conoce la Cleaning App.' },
      { property: 'og:title', content: '5 señales de que tu negocio de limpieza necesita un sistema más claro' },
      { property: 'og:description', content: 'Organiza reservas, clientes, cotizaciones y trabajos con herramientas para negocios de limpieza residencial y comercial.' },
      { property: 'og:type', content: 'article' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'canonical', href: 'https://thelaunchera.com/es/5-signs-cleaning-business' },
      { rel: 'alternate', hrefLang: 'en-US', href: 'https://thelaunchera.com/5-signs-cleaning-business' },
      { rel: 'alternate', hrefLang: 'es-US', href: 'https://thelaunchera.com/es/5-signs-cleaning-business' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://thelaunchera.com/5-signs-cleaning-business' },
      { rel: 'stylesheet', href: '/assets/tle-five-signs.css?v=20261103-1' },
    ],
  }),
  component: () => <FiveSignsCleaning lang="es" />,
});
