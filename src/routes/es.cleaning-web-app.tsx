import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

// La oferta independiente de Cleaning App ha terminado; conservar enlaces anteriores sin ofrecer su compra.
export const Route = createFileRoute('/es/cleaning-web-app')({
  head: () => ({ meta: [
    { title: 'Servicios de websites | The Launch Era' },
    { name: 'robots', content: 'noindex,follow' },
  ] }),
  component: RetiredOffer,
});
function RetiredOffer() {
  useEffect(() => { window.location.replace('/es/website-for-your-business/'); }, []);
  return <main className="container" style={{ minHeight: '50vh', paddingBlock: '5rem' }}>
    <h1>Conoce nuestros servicios para negocios</h1>
    <p>Descubre websites, experiencias de reservas y automatizaciones adaptadas a tu negocio.</p>
    <a href="/es/website-for-your-business/">Ver paquetes de websites</a>
  </main>;
}
