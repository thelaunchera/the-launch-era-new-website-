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
    </main>
  );
}
