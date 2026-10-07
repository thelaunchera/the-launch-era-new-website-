import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/website-automation')({ component: Page });
function Page() {
  return (
    <main style={{ background: '#faf4f7', minHeight: '85vh' }}>
      <section className="container" style={{ padding: '7rem 1.5rem 5rem', display: 'grid', gap: '2rem', alignItems: 'center' }}>
        <div>
          <div className="eyebrow">WEBSITE AUTOMATION</div>
          <h1 className="editorial" style={{ fontSize: 'clamp(3rem,8vw,6rem)', lineHeight: .95 }}>A website that<br />works after you log off.</h1>
          <p style={{ maxWidth: 560, fontSize: '1.1rem', margin: '1.5rem 0' }}>A clean online home with a clearer path from inquiry to next step.</p>
          <a className="cta-button" href="/service-checkout/?offer=website-automation&lang=en">Get Started — $59.99 →</a>
          <p style={{ marginTop: '1rem', fontSize: '.9rem' }}>48-hour production · External platform costs not included.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85" alt="Website dashboard on a laptop" style={{ width: '100%', maxHeight: 520, objectFit: 'cover', borderRadius: 24 }} />
      </section>
    </main>
  );
}
