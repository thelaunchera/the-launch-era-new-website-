import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Plus, UserRound, X } from 'lucide-react';
import './CoachCalendar.css';

export type CalendarSession = {
  id: string;
  clientId: string;
  date: string;
  startTime?: string;
  minutes: number;
  type: string;
  note: string;
};
export type CalendarClient = { id: string; name: string; status: 'Active' | 'Paused'; focus: string; email?: string; phone?: string };
type Props = {
  language: 'en' | 'es';
  sessions: CalendarSession[];
  clients: CalendarClient[];
  focusDate?: string;
  onNewSession: (date: string) => void;
  onEditSession: (session: CalendarSession) => void;
  onOpenClient: (clientId: string) => void;
  visitFor: (session: CalendarSession) => {
    status: 'Pending' | 'Confirmed' | 'CannotAttend';
    attendanceStatus: 'Scheduled' | 'Attended' | 'NoShow';
  } | undefined;
  inviteUrlFor: (session: CalendarSession) => string | undefined;
  onIssueVisit: (session: CalendarSession) => void;
  onCopyVisit: (session: CalendarSession) => void;
  onShareVisit: (session: CalendarSession, channel: 'email' | 'sms') => void;
  onMarkVisit: (session: CalendarSession, status: 'Attended' | 'NoShow') => void;
  visitBusy: string | null;
};

const localKey = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
const parseKey = (key: string) => new Date(key + 'T12:00:00');
const todayKey = () => localKey(new Date());
const formatDay = (key: string, language: 'en' | 'es', options?: Intl.DateTimeFormatOptions) =>
  parseKey(key).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', options ?? { weekday: 'long', day: 'numeric', month: 'long' });
export const formatStart = (time: string | undefined, language: 'en' | 'es') => {
  if (!time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return language === 'es' ? 'Hora no asignada' : 'Time not set';
  const [hour, minutes] = time.split(':').map(Number);
  return new Date(2020, 0, 1, hour, minutes).toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: 'numeric', minute: '2-digit' });
};
const endTime = (startTime: string | undefined, duration: number, language: 'en' | 'es') => {
  if (!startTime || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) return '—';
  const [hour, minute] = startTime.split(':').map(Number);
  const date = new Date(2020, 0, 1, hour, minute + duration);
  return date.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: 'numeric', minute: '2-digit' });
};
const dayNames = { en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'], es: ['D', 'L', 'M', 'X', 'J', 'V', 'S'] };

export default function CoachCalendar({ language, sessions, clients, focusDate, onNewSession, onEditSession, onOpenClient, visitFor, inviteUrlFor, onIssueVisit, onCopyVisit, onShareVisit, onMarkVisit, visitBusy }: Props) {
  const [selectedDate, setSelectedDate] = useState(focusDate || todayKey());
  const [month, setMonth] = useState(() => (focusDate || todayKey()).slice(0, 7));
  const [filter, setFilter] = useState('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (focusDate) { setSelectedDate(focusDate); setMonth(focusDate.slice(0, 7)); }
  }, [focusDate]);

  useEffect(() => {
    if (!selectedSessionId) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedSessionId(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [selectedSessionId]);

  const sessionsInView = useMemo(() => sessions.filter(item => filter === 'all' || item.clientId === filter), [sessions, filter]);
  const daySessions = useMemo(() => sessionsInView.filter(item => item.date === selectedDate)
    .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99') || a.clientId.localeCompare(b.clientId)), [sessionsInView, selectedDate]);
  const countByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    sessionsInView.forEach(item => { counts[item.date] = (counts[item.date] || 0) + 1; });
    return counts;
  }, [sessionsInView]);
  const monthStart = new Date(month + '-01T12:00:00');
  const gridStart = new Date(monthStart);
  gridStart.setDate(1 - monthStart.getDay());
  const cells = Array.from({ length: 42 }, (_, i) => {
    const value = new Date(gridStart);
    value.setDate(gridStart.getDate() + i);
    return localKey(value);
  });
  const selectedSession = sessions.find(item => item.id === selectedSessionId);
  const getClient = (id: string) => clients.find(item => item.id === id);
  const changeMonth = (delta: number) => {
    const next = new Date(month + '-01T12:00:00');
    next.setMonth(next.getMonth() + delta);
    const key = localKey(next);
    setMonth(key.slice(0, 7));
    setSelectedDate(key);
  };
  const pickToday = () => { const key = todayKey(); setMonth(key.slice(0, 7)); setSelectedDate(key); };
  const dateTitle = formatDay(month + '-01', language, { month: 'long', year: 'numeric' });
  const count = daySessions.length;

  return (
    <div className="coach-calendar-layout">
      <section className="coach-calendar-card">
        <div className="coach-calendar-head">
          <div>
            <span className="coach-calendar-kicker">{language === 'es' ? 'TODAS LAS CITAS' : 'ALL APPOINTMENTS'}</span>
            <h2>{dateTitle.charAt(0).toUpperCase() + dateTitle.slice(1)}</h2>
          </div>
          <div className="coach-calendar-arrows">
            <button type="button" onClick={pickToday} className="coach-calendar-today">{language === 'es' ? 'Hoy' : 'Today'}</button>
            <button type="button" aria-label={language === 'es' ? 'Mes anterior' : 'Previous month'} onClick={() => changeMonth(-1)}><ChevronLeft size={19}/></button>
            <button type="button" aria-label={language === 'es' ? 'Mes siguiente' : 'Next month'} onClick={() => changeMonth(1)}><ChevronRight size={19}/></button>
          </div>
        </div>
        <label className="coach-calendar-filter">
          <span>{language === 'es' ? 'Mostrar' : 'Show'}</span>
          <select value={filter} onChange={e => setFilter(e.target.value)} aria-label={language === 'es' ? 'Filtrar clientes' : 'Filter clients'}>
            <option value="all">{language === 'es' ? 'Todos los clientes' : 'All clients'}</option>
            {clients.map(client => <option value={client.id} key={client.id}>{client.name}</option>)}
          </select>
        </label>
        <div className="coach-calendar-weekdays">{dayNames[language].map((name, idx) => <span key={idx}>{name}</span>)}</div>
        <div className="coach-calendar-grid">
          {cells.map(date => {
            const inMonth = date.slice(0, 7) === month;
            const quantity = countByDate[date] || 0;
            return <button
              key={date}
              type="button"
              aria-label={formatDay(date, language) + (quantity ? ` · ${quantity} ${language === 'es' ? 'sesiones' : 'sessions'}` : '')}
              aria-pressed={selectedDate === date}
              className={['coach-calendar-day', inMonth ? '' : 'outside', selectedDate === date ? 'selected' : '', date === todayKey() ? 'today' : ''].join(' ')}
              onClick={() => { setSelectedDate(date); if (!inMonth) setMonth(date.slice(0, 7)); }}
            >
              <span>{Number(date.slice(-2))}</span>
              {quantity > 0 && <small className="coach-day-count">{quantity > 9 ? '9+' : quantity}</small>}
            </button>;
          })}
        </div>
        <p className="coach-calendar-help">{language === 'es' ? 'Toca un día para ver los clientes y las horas de sus sesiones.' : 'Tap any day to see clients and their scheduled times.'}</p>
      </section>
      <section className="coach-day-agenda">
        <div className="coach-agenda-header">
          <div>
            <span className="coach-calendar-kicker">{language === 'es' ? 'AGENDA DEL DÍA' : 'DAILY AGENDA'}</span>
            <h2>{formatDay(selectedDate, language)}</h2>
            <p>{count} {language === 'es' ? (count === 1 ? 'sesión' : 'sesiones') : (count === 1 ? 'session' : 'sessions')}</p>
          </div>
          <button type="button" className="coach-agenda-add" onClick={() => onNewSession(selectedDate)} disabled={!clients.length}><Plus size={17}/>{language === 'es' ? 'Nueva cita' : 'New session'}</button>
        </div>
        <div className="coach-day-appointments">
          {count ? daySessions.map(item => {
            const client = getClient(item.clientId);
            return <button type="button" key={item.id} className="coach-appointment" onClick={() => setSelectedSessionId(item.id)}>
              <div className="coach-appointment-time"><Clock3 size={15}/><strong>{formatStart(item.startTime, language)}</strong></div>
              <div className="coach-appointment-main">
                <span className="coach-appointment-avatar">{(client?.name || '?').split(' ').slice(0, 2).map(x => x.charAt(0)).join('').toUpperCase()}</span>
                <div><strong>{client?.name || (language === 'es' ? 'Cliente no disponible' : 'Client unavailable')}</strong><small>{item.type} · {item.minutes} min</small><small style={{ display: 'block', marginTop: 3, color: visitFor(item)?.status === 'Confirmed' ? '#2d7959' : '#795982' }}>{visitFor(item)?.status === 'Confirmed' ? (language === 'es' ? 'Asistencia confirmada ✓' : 'RSVP confirmed ✓') : visitFor(item)?.status === 'CannotAttend' ? (language === 'es' ? 'No puede asistir' : 'Cannot attend') : (language === 'es' ? 'Sin confirmar' : 'Awaiting RSVP')}</small></div>
                <ChevronRight size={18}/>
              </div>
            </button>;
          }) : <div className="coach-calendar-empty">
            <CalendarDays size={27}/>
            <strong>{language === 'es' ? 'No hay sesiones este día' : 'No sessions this day'}</strong>
            <p>{language === 'es' ? 'Selecciona otra fecha o registra una cita nueva.' : 'Choose another date or add a new appointment.'}</p>
          </div>}
        </div>
      </section>
      {selectedSession && <div className="coach-session-overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelectedSessionId(null); }}>
        <section className="coach-session-detail" role="dialog" aria-modal="true" aria-label={language === 'es' ? 'Detalle de la sesión' : 'Session details'}>
          <div className="coach-session-detail-head">
            <div><span className="coach-calendar-kicker">COACH DESK</span><h2>{language === 'es' ? 'Detalle de la cita' : 'Session details'}</h2></div>
            <button aria-label={language === 'es' ? 'Cerrar' : 'Close'} type="button" onClick={() => setSelectedSessionId(null)}><X size={20}/></button>
          </div>
          <button type="button" className="coach-session-client" onClick={() => { setSelectedSessionId(null); onOpenClient(selectedSession.clientId); }}>
            <span className="coach-appointment-avatar"><UserRound size={24}/></span>
            <span><strong>{getClient(selectedSession.clientId)?.name || 'Client'}</strong><small>{language === 'es' ? 'Ver ficha del cliente' : 'Open client profile'}</small></span><ArrowRight size={18}/>
          </button>
          <dl className="coach-session-details-grid">
            <div><dt>{language === 'es' ? 'Fecha' : 'Date'}</dt><dd>{formatDay(selectedSession.date, language)}</dd></div>
            <div><dt>{language === 'es' ? 'Hora de inicio' : 'Starts'}</dt><dd>{formatStart(selectedSession.startTime, language)}</dd></div>
            <div><dt>{language === 'es' ? 'Hora de finalización' : 'Ends'}</dt><dd>{endTime(selectedSession.startTime, selectedSession.minutes, language)}</dd></div>
            <div><dt>{language === 'es' ? 'Duración' : 'Duration'}</dt><dd>{selectedSession.minutes} min</dd></div>
            <div><dt>{language === 'es' ? 'Tipo' : 'Type'}</dt><dd>{selectedSession.type}</dd></div>
          </dl>
          <div className="coach-session-note">
            <strong>{language === 'es' ? 'Confirmación de asistencia' : 'Visit RSVP'}</strong>
            <p>{visitFor(selectedSession)?.status === 'Confirmed' ? (language === 'es' ? 'Cliente confirmó que asistirá.' : 'Client confirmed they will attend.') : visitFor(selectedSession)?.status === 'CannotAttend' ? (language === 'es' ? 'El cliente no puede asistir.' : 'Client cannot attend.') : (language === 'es' ? 'Esperando la respuesta del cliente.' : 'Awaiting client response.')}</p>
            <small>{language === 'es' ? 'El día anterior, envía el enlace único. La respuesta no equivale a asistencia presencial.' : 'Send the unique link the day before. RSVP is separate from attendance at the visit.'}</small>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '13px 0' }}>
              <button type="button" disabled={visitBusy === selectedSession.id} onClick={() => onIssueVisit(selectedSession)}>{visitFor(selectedSession) ? (language === 'es' ? 'Nuevo enlace' : 'New link') : (language === 'es' ? 'Crear enlace' : 'Create RSVP link')}</button>
              {inviteUrlFor(selectedSession) && <>
                <button type="button" onClick={() => onCopyVisit(selectedSession)}>{language === 'es' ? 'Copiar' : 'Copy'}</button>
                <button type="button" onClick={() => onShareVisit(selectedSession, 'email')}>{language === 'es' ? 'Correo' : 'Email'}</button>
                <button type="button" onClick={() => onShareVisit(selectedSession, 'sms')}>SMS</button>
              </>}
              {visitFor(selectedSession) && <>
                <button type="button" disabled={visitBusy === selectedSession.id} onClick={() => onMarkVisit(selectedSession, 'Attended')}>{language === 'es' ? 'Asistió' : 'Attended'}</button>
                <button type="button" disabled={visitBusy === selectedSession.id} onClick={() => onMarkVisit(selectedSession, 'NoShow')}>{language === 'es' ? 'No asistió' : 'No-show'}</button>
              </>}
            </div>
            {inviteUrlFor(selectedSession) && <p style={{ overflowWrap: 'anywhere', fontSize: 11 }}><a href={inviteUrlFor(selectedSession)} target="_blank" rel="noreferrer">{inviteUrlFor(selectedSession)}</a></p>}
            <small>{language === 'es' ? 'Envío manual por ahora; los correos y SMS automáticos aún no están conectados.' : 'Manual send for now; automatic emails and SMS are not yet connected.'}</small>
          </div>
          <div className="coach-session-note"><strong>{language === 'es' ? 'Nota privada' : 'Private note'}</strong><p>{selectedSession.note || (language === 'es' ? 'Sin notas registradas.' : 'No notes yet.')}</p></div>
          <button type="button" className="coach-session-edit" onClick={() => { setSelectedSessionId(null); onEditSession(selectedSession); }}>{language === 'es' ? 'Editar sesión u horario' : 'Edit session or time'} <ArrowRight size={17}/></button>
        </section>
      </div>}
    </div>
  );
}
