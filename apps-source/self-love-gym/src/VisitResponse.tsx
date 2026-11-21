import { useEffect, useState } from 'react';
import { CheckCircle2, CalendarDays, Clock3, Heart, XCircle } from 'lucide-react';
import { visitConfirmation } from './supabaseClient';
import type { PublicVisit } from './supabaseClient';
import { formatStart } from './CoachCalendar';
import type { Language } from './i18n';

type Props = { token: string; language: Language };
export default function VisitResponse({ token, language }: Props) {
  const [visit, setVisit] = useState<PublicVisit | null>(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isSpanish = language === 'es';

  useEffect(() => {
    let active = true;
    void visitConfirmation.get(token).then(result => {
      if (!active) return;
      setVisit(result);
      setBusy(false);
    }).catch(() => {
      if (!active) return;
      setError(isSpanish ? 'Este enlace expiró, cambió o ya no está disponible. Contacta a tu entrenador.' : 'This link expired, changed, or is unavailable. Please contact your coach.');
      setBusy(false);
    });
    return () => { active = false; };
  }, [token, isSpanish]);

  async function submit(choice: 'Confirmed' | 'CannotAttend') {
    setSaving(true);
    setError('');
    try {
      await visitConfirmation.respond(token, choice);
      setVisit(current => current ? { ...current, status: choice } : current);
    } catch {
      setError(isSpanish ? 'No pudimos guardar tu respuesta. Inténtalo nuevamente.' : 'We could not save your response. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ minHeight: '100dvh', padding: '32px 18px', background: 'radial-gradient(circle at 80% 0%, #efd9f9, transparent 42%), #faf7fc', display: 'grid', placeItems: 'center', color: '#28212b' }}>
      <section style={{ background: '#fff', width: '100%', maxWidth: 440, borderRadius: 28, boxShadow: '0 16px 60px rgba(55,21,60,.10)', padding: '32px 24px', textAlign: 'center' }}>
        <span style={{ display: 'inline-grid', placeItems: 'center', height: 54, width: 54, borderRadius: 20, background: '#f4dded', color: '#6a3972', marginBottom: 18 }}><Heart size={27} fill="currentColor" /></span>
        <p style={{ letterSpacing: '.12em', fontSize: 10, fontWeight: 800, color: '#77547f', marginBottom: 10 }}>SELF LOVE GYM · COACH DESK</p>
        <h1 style={{ fontSize: 'clamp(27px,7vw,36px)', lineHeight: 1.13, letterSpacing: '-.04em', margin: '0 0 13px' }}>
          {busy ? (isSpanish ? 'Abriendo tu cita…' : 'Opening your visit…') :
            visit?.status === 'Confirmed' ? (isSpanish ? '¡Asistencia confirmada!' : 'You’re confirmed!') :
            visit?.status === 'CannotAttend' ? (isSpanish ? 'Recibimos tu respuesta' : 'We got your response') :
            (isSpanish ? '¿Nos vemos mañana?' : 'Will we see you there?')}
        </h1>
        {visit && <>
          <p style={{ color: '#675f6b', lineHeight: 1.6, margin: '0 0 22px' }}>{isSpanish ? `Hola, ${visit.firstName}. Confirma si podrás asistir a tu próxima sesión.` : `Hi, ${visit.firstName}! Please confirm if you’ll attend your next training session.`}</p>
          <div style={{ borderRadius: 20, background: '#f7effa', textAlign: 'left', padding: 20, marginBottom: 18 }}>
            <strong style={{ fontSize: 18 }}>{visit.type}</strong>
            <p style={{ display: 'flex', gap: 9, alignItems: 'center', color: '#624c69', margin: '13px 0 7px' }}><CalendarDays size={16} />{new Date(visit.date + 'T12:00:00').toLocaleDateString(isSpanish ? 'es-419' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p style={{ display: 'flex', gap: 9, alignItems: 'center', color: '#624c69', margin: 0 }}><Clock3 size={16} />{formatStart(visit.startTime, language)} · {visit.minutes} min</p>
          </div>
          {visit.status === 'Pending' ? <div style={{ display: 'grid', gap: 12 }}>
            <button className="primary-button" disabled={saving} onClick={() => void submit('Confirmed')} style={{ justifyContent: 'center', padding: 16, width: '100%' }}><CheckCircle2 size={18} />{isSpanish ? 'Sí, voy a asistir' : 'Yes, I’ll be there'}</button>
            <button className="secondary-button" disabled={saving} onClick={() => void submit('CannotAttend')} style={{ justifyContent: 'center', padding: 16, width: '100%' }}><XCircle size={18} />{isSpanish ? 'No puedo asistir' : 'I can’t make it'}</button>
          </div> : <p style={{ color: '#5b4d61', lineHeight: 1.6 }}>{visit.status === 'Confirmed' ? (isSpanish ? 'Tu entrenador verá la confirmación. La asistencia real se registrará después de la visita.' : 'Your coach can see your confirmation. Actual attendance is recorded after your visit.') : (isSpanish ? 'Tu entrenador verá que no puedes asistir. Contacta directamente para reagendar.' : 'Your coach can see that you cannot attend. Please contact them to reschedule.')}</p>}
        </>}
        {error && <p role="alert" style={{ color: '#a73561', margin: '16px 0' }}>{error}</p>}
        <p style={{ color: '#84718a', fontSize: 11, letterSpacing: '.04em', margin: '26px 0 0' }}>POWERED BY THE LAUNCH ERA</p>
      </section>
    </main>
  );
}
