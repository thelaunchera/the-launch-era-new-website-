import { createFileRoute } from '@tanstack/react-router';
import { FiveSignsCleaning } from '@/components/five-signs-cleaning';

export const Route = createFileRoute('/5-signs-cleaning-business')({
  head: () => ({
    meta: [
      { title: '5 Signs Your Cleaning Business Needs a Better System | The Launch Era' },
      { name: 'description', content: 'Missed requests, scattered client details, manual quotes and forgotten follow-ups? See five signs and explore the Cleaning App for residential cleaning business owners.' },
      { property: 'og:title', content: '5 Signs Your Cleaning Business Has Outgrown DMs and Spreadsheets' },
      { property: 'og:description', content: 'Five signs your cleaning business needs a simpler way to organize bookings, clients, quotes and jobs.' },
      { property: 'og:type', content: 'article' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'canonical', href: 'https://thelaunchera.com/5-signs-cleaning-business' },
      { rel: 'alternate', hrefLang: 'en-US', href: 'https://thelaunchera.com/5-signs-cleaning-business' },
      { rel: 'alternate', hrefLang: 'es-US', href: 'https://thelaunchera.com/es/5-signs-cleaning-business' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://thelaunchera.com/5-signs-cleaning-business' },
      { rel: 'stylesheet', href: '/assets/tle-five-signs.css?v=20261103-1' },
    ],
  }),
  component: () => <FiveSignsCleaning lang="en" />,
});
