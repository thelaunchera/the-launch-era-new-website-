import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, CreditCard, Mail, MessageCircle, Phone, Plus, UserRound, Wallet } from 'lucide-react';
import { formatStart } from './CoachCalendar';
import type { CalendarClient, CalendarSession } from './CoachCalendar';
import './ClientProfile.css';

export type ProfileClient = CalendarClient & { joined: string; checkInDay: string };
export type ProfilePayment = { id: string; clientId: string; amount: number; due: string; status: 'Due' | 'Paid'; method?: string; paidAt?: string };
export type ProfileMembership = { id: string; clientId: string; name: string; status: string; amount: number; interval: string; nextDue: string };
export type ProfileCheckin = { id: string; clientId: string; date: string; energy: string; note: string };

type Props = {
  language: 'en' | 'es';
  client: ProfileClient;
  sessions: CalendarSession[];
  payments: ProfilePayment[];
  memberships: ProfileMembership[];
  checkins: ProfileCheckin[];
  onBack: () => void;
  onEdit: () => void;
  onNewSession: () => void;
  onOpenCalendar: (date: string) => void;
};

const dateLabel = (value: string, lang: 'en' | 'es') => value
  ? new Date(value + 'T12:00:00').toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day:'numeric', month:'short', year:'numeric' }) : '—';
const usd = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

export default function ClientProfile({ language: lang, client, sessions, payments, memberships, checkins, onBack, onEdit, onNewSession, onOpenCalendar }: Props) {
  const es = lang === 'es';
  const initials = client.name.split(/\s+/).filter(Boolean).slice(0,2).map(x => x.charAt(0)).join('').toUpperCase();
  const today = new Date();
  const todayKey = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  const upcoming = sessions.filter(s => s.date >= todayKey)
    .sort((a, b) => (a.date + (a.startTime || '99:99')).localeCompare(b.date + (b.startTime || '99:99')));
  const past = sessions.filter(s => s.date < todayKey).length;
  const owed = payments.filter(p => p.status === 'Due').reduce((total,p)=>total+p.amount,0);
  const sortedCheckins = [...checkins].sort((a,b)=>b.date.localeCompare(a.date));
  return (
    <div className="coach-profile">
      <button type="button" className="coach-profile-back" onClick={onBack}><ArrowLeft size={18}/>{es ? 'Volver a clientes' : 'Back to clients'}</button>
      <section className="coach-profile-hero">
        <div className="coach-profile-identity">
          <span className="coach-profile-avatar">{initials || <UserRound size={27}/>}</span>
          <div>
            <span className="coach-profile-overline">{es ? 'FICHA DE CLIENTE' : 'CLIENT PROFILE'}</span>
            <h2>{client.name}</h2>
            <span className={client.status === 'Active' ? 'coach-profile-status active' : 'coach-profile-status'}>{client.status === 'Active' ? (es ? 'Activo' : 'Active') : (es ? 'En pausa' : 'Paused')}</span>
          </div>
        </div>
        <div className="coach-profile-hero-actions">
          <button type="button" onClick={onEdit}>{es ? 'Editar perfil' : 'Edit profile'}</button>
          <button type="button" className="accent" onClick={onNewSession}><Plus size={17}/>{es ? 'Nueva sesión' : 'New session'}</button>
        </div>
      </section>
      <div className="coach-profile-metrics">
        <div><span>{es ? 'Próximas sesiones' : 'Upcoming sessions'}</span><strong>{upcoming.length}</strong></div>
        <div><span>{es ? 'Sesiones anteriores' : 'Past sessions'}</span><strong>{past}</strong></div>
        <div><span>{es ? 'Pendiente manual' : 'Manual amount due'}</span><strong>{usd(owed)}</strong></div>
      </div>
      <div className="coach-profile-grid">
        <section className="coach-profile-card">
          <h3>{es ? 'Información de contacto' : 'Contact information'}</h3>
          <p><strong>{es ? 'Objetivo' : 'Focus'}</strong><span>{client.focus || (es ? 'Sin objetivo registrado' : 'No goal added')}</span></p>
          <p><strong>{es ? 'Desde' : 'Joined'}</strong><span>{dateLabel(client.joined, lang)}</span></p>
          <p><strong>{es ? 'Día de seguimiento' : 'Check-in day'}</strong><span>{client.checkInDay}</span></p>
          {client.email && <a href={`mailto:${client.email}`}><Mail size={17}/>{client.email}<ArrowRight size={15}/></a>}
          {client.phone && <a href={`tel:${client.phone.replace(/[^+\d]/g,'')}`}><Phone size={17}/>{client.phone}<ArrowRight size={15}/></a>}
          {!client.email && !client.phone && <small>{es ? 'Puedes añadir correo y teléfono al editar el perfil.' : 'Add an email or phone in the profile editor.'}</small>}
        </section>
        <section className="coach-profile-card">
          <div className="coach-profile-card-heading"><h3>{es ? 'Próximas citas' : 'Upcoming appointments'}</h3><CalendarDays size={18}/></div>
          {upcoming.length ? upcoming.slice(0,5).map(item =>
            <button type="button" className="coach-profile-entry" key={item.id} onClick={() => onOpenCalendar(item.date)}>
              <span className="coach-profile-entry-icon"><Clock3 size={18}/></span>
              <span><strong>{dateLabel(item.date, lang)} · {formatStart(item.startTime,lang)}</strong><small>{item.type} · {item.minutes} min</small></span>
              <ArrowRight size={17}/>
            </button>
          ) : <div className="coach-profile-empty">{es ? 'Todavía no hay sesiones futuras programadas.' : 'No upcoming sessions have been scheduled.'}</div>}
          <button type="button" className="coach-profile-inline-action" onClick={onNewSession}><Plus size={16}/>{es ? 'Programar sesión' : 'Schedule session'}</button>
        </section>
        <section className="coach-profile-card">
          <div className="coach-profile-card-heading"><h3>{es ? 'Membresías y pagos' : 'Memberships & payments'}</h3><Wallet size={18}/></div>
          {memberships.map(item => <div className="coach-profile-entry static" key={item.id}>
            <span className="coach-profile-entry-icon"><CreditCard size={18}/></span>
            <span><strong>{item.name}</strong><small>{usd(item.amount)} · {item.interval} · {item.status}</small></span>
          </div>)}
          {payments.slice().sort((a,b)=>b.due.localeCompare(a.due)).slice(0,5).map(item => <div key={item.id} className="coach-profile-entry static">
            <span className="coach-profile-entry-icon"><Check size={18}/></span>
            <span><strong>{usd(item.amount)} · {item.status === 'Paid' ? (es ? 'Pagado' : 'Paid') : (es ? 'Pendiente' : 'Due')}</strong><small>{dateLabel(item.due,lang)} · {es ? 'Registro manual' : 'Manual entry'}</small></span>
          </div>)}
          {!payments.length && !memberships.length && <div className="coach-profile-empty">{es ? 'Sin registros de membresías ni pagos.' : 'No memberships or payment records yet.'}</div>}
          <p className="coach-profile-footnote">{es ? 'Los enlaces de Stripe no confirman automáticamente un pago.' : 'Stripe links do not automatically verify a payment.'}</p>
        </section>
        <section className="coach-profile-card">
          <div className="coach-profile-card-heading"><h3>{es ? 'Seguimiento y notas' : 'Check-ins & notes'}</h3><MessageCircle size={18}/></div>
          {sortedCheckins.slice(0,5).map(item => <div key={item.id} className="coach-profile-checkin">
            <span>{dateLabel(item.date,lang)} · {item.energy}</span>
            <p>{item.note || (es ? 'Sin nota' : 'No note')}</p>
          </div>)}
          {!sortedCheckins.length && <div className="coach-profile-empty">{es ? 'Todavía no hay notas de seguimiento.' : 'No check-in notes yet.'}</div>}
        </section>
      </div>
    </div>
  );
}
