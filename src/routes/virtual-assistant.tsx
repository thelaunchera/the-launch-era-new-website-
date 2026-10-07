import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/virtual-assistant')({ component: Page });
function Page() {
  return (
    <main style={{ background: '#fffaf1', minHeight: '85vh' }}>
      <section className="container" style={{ padding: '7rem 1.5rem 5rem', display: 'grid', gap: '2rem', alignItems: 'center' }}>
        <div>
          <div className="eyebrow">VIRTUAL ASSISTANT</div>
          <h1 className="editorial" style={{ fontSize: 'clamp(3rem,8vw,6rem)', lineHeight: .95 }}>Get support.<br />Keep moving.</h1>
          <p style={{ maxWidth: 560, fontSize: '1.1rem', margin: '1.5rem 0' }}>Behind-the-scenes admin support shaped around your cleaning business.</p>
          <a className="cta-button" href="/service-checkout/?offer=va&lang=en">Get Started — $49.99 →</a>
        </div>
        <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85" alt="Professional working at a bright desk" style={{ width: '100%', maxHeight: 520, objectFit: 'cover', borderRadius: 24 }} />
      </section>
    </main>
  );
}
