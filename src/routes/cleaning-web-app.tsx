import { createFileRoute } from '@tanstack/react-router';
import { SeoStructuredData, cleaningAppSchema } from '@/components/seo-structured-data';
import { CleaningAppEditorial } from '../components/cleaning-app-editorial';

export const Route = createFileRoute('/cleaning-web-app')({
  head: () => ({
    meta: [
      { title: 'Cleaning App for Residential Cleaning Businesses | The Launch Era' },
      { name: 'description', content: 'Keep bookings, clients, jobs, quotes, invoices, team time and routes organized in one simple Cleaning App for residential cleaning business owners.' },
      { property: 'og:title', content: 'Cleaning App for Residential Cleaning Businesses | The Launch Era' },
      { property: 'og:description', content: 'Keep bookings, clients, jobs, quotes, invoices, team time and routes organized in one simple Cleaning App for residential cleaning business owners.' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ],
    links: [
      { rel: 'canonical', href: 'https://thelaunchera.com/cleaning-web-app' },
      { rel: 'alternate', hrefLang: 'en-US', href: 'https://thelaunchera.com/cleaning-web-app' },
      { rel: 'alternate', hrefLang: 'es-US', href: 'https://thelaunchera.com/es/cleaning-web-app/' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://thelaunchera.com/cleaning-web-app' },
      { rel: 'stylesheet', href: '/assets/tle-app-landing.css?v=20261013-short-1' },
      { rel: 'stylesheet', href: '/assets/tle-cleaning-case-study.css?v=20261013-01' }
    ]
  }),
  component: Page
});

function Page() { return <><SeoStructuredData data={cleaningAppSchema("en")} /><CleaningAppEditorial lang="en"/></>; }
