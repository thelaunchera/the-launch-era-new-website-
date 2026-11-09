import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

// Retired standalone Cleaning App offer. Preserve older inbound URLs without selling the discontinued product.
export const Route = createFileRoute('/cleaning-web-app')({
  head: () => ({ meta: [
    { title: 'Website Services | The Launch Era' },
    { name: 'robots', content: 'noindex,follow' },
  ] }),
  component: RetiredOffer,
});
function RetiredOffer() {
  useEffect(() => { window.location.replace('/website-for-your-business/'); }, []);
  return <main className="container" style={{ minHeight: '50vh', paddingBlock: '5rem' }}>
    <h1>Explore our website services</h1>
    <p>Discover websites, booking experiences, and business automation tailored to your business.</p>
    <a href="/website-for-your-business/">Explore website packages</a>
  </main>;
}
