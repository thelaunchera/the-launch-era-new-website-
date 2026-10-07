import { createFileRoute } from '@tanstack/react-router';
import { PageIntro, BookingSection } from '@/components/editorial-sections';

export const Route = createFileRoute('/booking-lead-automation')({
  head: () => ({
    meta: [
      { title: 'Booking + Lead Automation — THE LAUNCH ERA' },
      { name: 'description', content: 'Booking requests, lead tracking, and follow-ups in one connected flow.' },
    ],
  }),
  component: Booking,
});

function Booking() {
  return (
    <main>
      <PageIntro
        label="YOUR CLIENT IS READY. LET’S GET YOUR SYSTEM READY."
        title="Booking + Lead Automation"
        description="Bring your booking requests, lead details, and follow-ups together."
      />
      <BookingSection detail />
      <section className="container" style={{ padding: '1rem 1.5rem 6rem', textAlign: 'center' }}>
        <a className="cta-button" href="/service-checkout/?offer=booking-flow&lang=en">Get Started — $29.99 →</a>
        <p style={{ marginTop: '1rem', fontSize: '.9rem' }}>One-time offer · secure checkout</p>
      </section>
    </main>
  );
}
