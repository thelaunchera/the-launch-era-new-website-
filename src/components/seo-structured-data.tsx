import type { ReactElement } from 'react';

type Language = 'en' | 'es';
type Schema = Record<string, unknown>;
const siteUrl = 'https://thelaunchera.com';
const organizationId = siteUrl + '/#organization';

export const organizationWebsiteSchema: Schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'The Launch Era',
      url: siteUrl + '/',
      logo: siteUrl + '/apple-touch-icon.png',
      description: 'Booking automation, Cleaning App and AI assistants for residential cleaning businesses in the United States.',
      areaServed: { '@type': 'Country', name: 'United States' },
    },
    {
      '@type': 'WebSite',
      '@id': siteUrl + '/#website',
      name: 'The Launch Era',
      url: siteUrl + '/',
      publisher: { '@id': organizationId },
      inLanguage: ['en-US', 'es-US'],
    },
  ],
};

export function bookingServiceSchema(language: Language): Schema {
  const spanish = language === 'es';
  const url = siteUrl + (spanish ? '/es/booking-lead-automation/' : '/booking-lead-automation');
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': url + '#service',
    name: spanish
      ? 'Automatización de reservas y Command Center para negocios de limpieza'
      : 'Booking Automation + Command Center for Cleaning Businesses',
    description: spanish
      ? 'Booking Page personalizada con Command Center privado para organizar solicitudes, prospectos, horarios y seguimientos en negocios de limpieza.'
      : 'Personalized Booking Page and private Command Center to organize inquiries, leads, schedules and follow-ups for cleaning businesses.',
    serviceType: 'Booking and lead management automation for cleaning businesses',
    url,
    provider: { '@id': organizationId },
    areaServed: { '@type': 'Country', name: 'United States' },
    audience: { '@type': 'BusinessAudience', audienceType: 'Residential cleaning business owners' },
  };
}

export function cleaningAppSchema(language: Language): Schema {
  const spanish = language === 'es';
  const url = siteUrl + (spanish ? '/es/cleaning-web-app/' : '/cleaning-web-app');
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': url + '#app',
    name: 'The Launch Era Cleaning App',
    description: spanish
      ? 'App web para organizar clientes, reservas, cotizaciones, trabajos, facturas, tiempo del equipo y rutas en negocios de limpieza residencial.'
      : 'Web app to organize clients, bookings, quotes, jobs, invoices, team time and routes for residential cleaning businesses.',
    url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    publisher: { '@id': organizationId },
    featureList: spanish
      ? ['Reservas y clientes', 'Cotizaciones y facturas', 'Calendario de trabajos', 'Tiempo del equipo', 'Rutas']
      : ['Bookings and clients', 'Quotes and invoices', 'Job calendar', 'Team time tracking', 'Routes'],
  };
}

/** Static first-party factual JSON-LD only; no reviews, ranking scores or fabricated offers. */
export function SeoStructuredData({ data }: { data: Schema }): ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
