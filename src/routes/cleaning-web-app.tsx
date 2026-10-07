import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/cleaning-web-app')({ component: Page });
function Page() {
  return (
    <main style={{ background: '#eef6ff', minHeight: '85vh' }}>
      <section className="container" style={{ padding: '7rem 1.5rem 5rem', display: 'grid', gap: '2rem', alignItems: 'center' }}>
        <div>
          <div className="eyebrow">CLEANING WEB APP</div>
          <h1 className="editorial" style={{ fontSize: 'clamp(3rem,8vw,6rem)', lineHeight: .95 }}>Run your business<br />in one place.</h1>
          <p style={{ maxWidth: 560, fontSize: '1.1rem', margin: '1.5rem 0' }}>Bookings, clients, jobs, quotes and invoices—organized without the complicated setup.</p>
          <a className="cta-button" href="https://app.thelaunchera.com/">Start Your Free Trial →</a>
          <p style={{ marginTop: '1rem', fontSize: '.9rem' }}>60 days included with Booking Page purchase · then $5.99/month</p>
        </div>
        <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85" alt="Small business owner working at a bright desk" style={{ width: '100%', maxHeight: 520, objectFit: 'cover', borderRadius: 24 }} />
      </section>
    </main>
  );
}
