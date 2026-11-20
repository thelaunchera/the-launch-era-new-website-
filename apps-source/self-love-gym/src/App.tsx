import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  MessageCircle,
  Send,
  CreditCard,
  ExternalLink,
  Bell,
  Plus,
  Search,
  Settings2,
  MoreHorizontal,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import { api, auth, ownerAccess } from './supabaseClient';
import { translateUi } from './i18n';
import type { Language } from './i18n';

type Client = {
  id: string;
  name: string;
  focus: string;
  status: 'Active' | 'Paused';
  joined: string;
  checkInDay: string;
  email?: string;
  phone?: string;
};
type Session = {
  id: string;
  clientId: string;
  date: string;
  minutes: number;
  type: string;
  note: string;
};
type Payment = {
  id: string;
  clientId: string;
  amount: number;
  due: string;
  status: 'Due' | 'Paid';
  method?: 'Cash' | 'Check' | 'Other' | '';
  paidAt?: string;
  checkNumber?: string;
};
type Membership = {
  id: string;
  clientId: string;
  name: string;
  amount: number;
  interval: 'Monthly' | 'Weekly';
  nextDue: string;
  status: 'Active' | 'Paused';
  paymentLink: string;
};
type Reminder = {
  id: string;
  clientId: string;
  subject: string;
  message: string;
  due: string;
  status: 'Pending' | 'Done';
};
type CheckIn = {
  id: string;
  clientId: string;
  date: string;
  energy: string;
  note: string;
};
type Workspace = {
  clients: Client[];
  sessions: Session[];
  payments: Payment[];
  checkins: CheckIn[];
  memberships: Membership[];
  reminders: Reminder[];
  revision: number;
};
type Account = { userId: string; name?: string; email?: string };
type Section = 'Overview' | 'Clients' | 'Sessions' | 'Memberships' | 'Payments' | 'Messages' | 'Check-ins' | 'Settings';
type Kind = 'client' | 'session' | 'payment' | 'checkin' | 'membership' | 'reminder';

const today = () => new Date().toLocaleDateString('en-CA');
const shifted = (days: number) => {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toLocaleDateString('en-CA');
};
const uid = () => crypto.randomUUID();
const money = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
const prettyDate = (date: string, language: Language = 'en') =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString(language === 'es' ? 'es-419' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

const sample: Workspace = {
  revision: 0,
  clients: [
    {
      id: 'demo-maya',
      name: 'Maya Brooks',
      focus: 'Build strength',
      status: 'Active',
      joined: shifted(-27),
      checkInDay: 'Monday',
    },
    {
      id: 'demo-sofia',
      name: 'Sofia Lane',
      focus: 'Move with confidence',
      status: 'Active',
      joined: shifted(-12),
      checkInDay: 'Friday',
    },
    {
      id: 'demo-jules',
      name: 'Jules Carter',
      focus: 'Feel more energized',
      status: 'Paused',
      joined: shifted(-42),
      checkInDay: 'Wednesday',
    },
  ],
  sessions: [
    {
      id: 'demo-session-1',
      clientId: 'demo-maya',
      date: shifted(-1),
      minutes: 45,
      type: 'Strength',
      note: 'Great session.',
    },
    {
      id: 'demo-session-2',
      clientId: 'demo-sofia',
      date: shifted(1),
      minutes: 30,
      type: 'Mobility',
      note: '',
    },
  ],
  payments: [
    {
      id: 'demo-payment-1',
      clientId: 'demo-maya',
      amount: 90,
      due: shifted(-2),
      status: 'Due',
    },
    {
      id: 'demo-payment-2',
      clientId: 'demo-sofia',
      amount: 75,
      due: shifted(-5),
      status: 'Paid',
    },
  ],
  checkins: [
    {
      id: 'demo-checkin-1',
      clientId: 'demo-sofia',
      date: shifted(-3),
      energy: 'Feeling good',
      note: 'Ready for the next session.',
    },
  ],
  memberships: [{ id: 'demo-membership-1', clientId: 'demo-maya', name: 'Strong Start', amount: 90, interval: 'Monthly', nextDue: shifted(8), status: 'Active', paymentLink: '' }],
  reminders: [{ id: 'demo-reminder-1', clientId: 'demo-sofia', subject: 'Weekly check-in', message: 'Hi Sofia! How are you feeling after this week’s sessions?', due: shifted(1), status: 'Pending' }],
};

function withDefaults(value: Workspace): Workspace {
  return { ...value, memberships: value.memberships ?? [], reminders: value.reminders ?? [] };
}

function loadDemo(): Workspace {
  try {
    const saved = localStorage.getItem('selflovegym-coachdesk-demo-v1');
    return saved ? withDefaults(JSON.parse(saved) as Workspace) : sample;
  } catch {
    return sample;
  }
}

const nav: { name: Section; Icon: typeof LayoutDashboard }[] = [
  { name: 'Overview', Icon: LayoutDashboard },
  { name: 'Clients', Icon: UsersRound },
  { name: 'Sessions', Icon: CalendarDays },
  { name: 'Memberships', Icon: CreditCard },
  { name: 'Payments', Icon: CircleDollarSign },
  { name: 'Messages', Icon: MessageCircle },
  { name: 'Check-ins', Icon: ClipboardCheck },
  { name: 'Settings', Icon: Settings2 },
];

function App() {
  const [workspace, setWorkspace] = useState<Workspace>(loadDemo);
  const [account, setAccount] = useState<Account | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(true);
  const [authNotice, setAuthNotice] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invites, setInvites] = useState<{ email: string; created_at: string }[]>([]);
  const [inviteNotice, setInviteNotice] = useState('');
  const [mode, setMode] = useState<'demo' | 'account'>('demo');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [section, setSection] = useState<Section>('Overview');
  const [modal, setModal] = useState<Kind | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('selflovegym-language') === 'es' ? 'es' : 'en');
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('selflovegym-language', language);
    const root = document.getElementById('root');
    if (root) translateUi(root, language);
  }, [language, section, workspace, modal, formError, errorMessage, moreOpen, ready]);

  function navigate(next: Section) {
    setSection(next);
    setMoreOpen(false);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function restore() {
    setReady(false);
    setErrorMessage('');
    try {
      const user = await auth.getUser();
      if (user) {
        const result = await api.get('/api/workspace');
        setAccount(user);
        const owner = await ownerAccess.isOwner();
        setIsOwner(owner);
        if (owner) setInvites(await ownerAccess.listInvites());
        setWorkspace(withDefaults(result.data as Workspace));
        setMode('account');
      } else {
        setAccount(null);
        setWorkspace(withDefaults({ revision: 0, clients: [], sessions: [], payments: [], checkins: [], memberships: [], reminders: [] }));
        setMode('demo');
      }
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : 'Your workspace could not load. Please retry before making changes.'
      );
      setAccount(null);
      setWorkspace(withDefaults({ revision: 0, clients: [], sessions: [], payments: [], checkins: [], memberships: [], reminders: [] }));
      setMode('demo');
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    void restore();
  }, []);

  async function save(next: Workspace) {
    if (busy.current || !ready || errorMessage.includes('could not load'))
      return false;
    busy.current = true;
    setSaving(true);
    setErrorMessage('');
    if (mode === 'demo') {
      try {
        localStorage.setItem(
          'selflovegym-coachdesk-demo-v1',
          JSON.stringify(next)
        );
        setWorkspace(next);
        busy.current = false;
        setSaving(false);
        return true;
      } catch {
        setErrorMessage(
          'Could not save this preview on your device. Check browser storage.'
        );
        busy.current = false;
        setSaving(false);
        return false;
      }
    }
    try {
      const result = await api.put('/api/workspace', next);
      setWorkspace(result.data as Workspace);
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      setErrorMessage(
        message.includes('409')
          ? 'This workspace changed in another tab. Reload before editing.'
          : 'Could not save your change. Your previous data is still here; please retry.'
      );
      return false;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  function openModal(kind: Kind, item?: Client | Session | Payment | CheckIn | Membership | Reminder, clientId?: string) {
    if (kind === 'client') {
      const current = item as Client | undefined;
      setForm({
        id: current?.id ?? '',
        name: current?.name ?? '',
        focus: current?.focus ?? '',
        status: current?.status ?? 'Active',
        joined: current?.joined ?? today(),
        checkInDay: current?.checkInDay ?? 'Monday',
        email: current?.email ?? '',
        phone: current?.phone ?? '',
      });
    } else if (kind === 'session') {
      const current = item as Session | undefined;
      setForm({
        id: current?.id ?? '',
        clientId: current?.clientId ?? workspace.clients[0]?.id ?? '',
        date: current?.date ?? today(),
        minutes: String(current?.minutes ?? 45),
        type: current?.type ?? 'Strength',
        note: current?.note ?? '',
      });
    } else if (kind === 'payment') {
      const current = item as Payment | undefined;
      setForm({
        id: current?.id ?? '',
        clientId: current?.clientId ?? workspace.clients[0]?.id ?? '',
        amount: String(current?.amount ?? ''),
        due: current?.due ?? today(),
        status: current?.status ?? 'Due',
        method: current?.method ?? '',
        paidAt: current?.paidAt ?? '',
        checkNumber: current?.checkNumber ?? '',
      });
    } else if (kind === 'membership') {
      const current = item as Membership | undefined;
      setForm({ id: current?.id ?? '', clientId: current?.clientId ?? clientId ?? workspace.clients[0]?.id ?? '', name: current?.name ?? '', amount: String(current?.amount ?? ''), interval: current?.interval ?? 'Monthly', nextDue: current?.nextDue ?? today(), status: current?.status ?? 'Active', paymentLink: current?.paymentLink ?? '' });
    } else if (kind === 'reminder') {
      const current = item as Reminder | undefined;
      setForm({ id: current?.id ?? '', clientId: current?.clientId ?? clientId ?? workspace.clients[0]?.id ?? '', subject: current?.subject ?? '', message: current?.message ?? '', due: current?.due ?? today(), status: current?.status ?? 'Pending' });
    } else {
      const current = item as CheckIn | undefined;
      setForm({
        id: current?.id ?? '',
        clientId: current?.clientId ?? workspace.clients[0]?.id ?? '',
        date: current?.date ?? today(),
        energy: current?.energy ?? 'Feeling good',
        note: current?.note ?? '',
      });
    }
    setFormError('');
    setModal(kind);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal) return;
    if (modal === 'client' && !form.name?.trim()) {
      setFormError('Enter a client name.');
      return;
    }
    if (modal !== 'client' && !form.clientId) {
      setFormError('Add a client first.');
      return;
    }
    if (
      modal === 'session' &&
      (!Number.isFinite(Number(form.minutes)) || Number(form.minutes) < 1)
    ) {
      setFormError('Enter a valid session length.');
      return;
    }
    if (
      modal === 'payment' &&
      (!form.amount ||
        !Number.isFinite(Number(form.amount)) ||
        Number(form.amount) < 0)
    ) {
      setFormError('Enter a valid amount.');
      return;
    }
    if (modal === 'membership' && (!form.name?.trim() || !form.amount || Number(form.amount) <= 0 || !Number.isFinite(Number(form.amount)))) {
      setFormError('Enter a membership name and a valid price.');
      return;
    }
    if (modal === 'membership' && form.paymentLink && !/^https:\/\/buy\.stripe\.com\/[a-zA-Z0-9]+$/.test(form.paymentLink.trim())) {
      setFormError('Paste a Stripe Payment Link starting with https://buy.stripe.com/.');
      return;
    }
    if (modal === 'reminder' && (!form.subject?.trim() || !form.message?.trim())) {
      setFormError('Add a subject and message.');
      return;
    }
    if (modal === 'client' && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (modal === 'payment' && form.status === 'Paid' && !['Cash', 'Check', 'Other'].includes(form.method)) {
      setFormError('Choose how the client paid.');
      return;
    }
    const recordId = form.id || uid();
    const next: Workspace = structuredClone(workspace);
    if (modal === 'client') {
      const item: Client = {
        id: recordId,
        name: form.name.trim(),
        focus: form.focus.trim(),
        status: form.status as Client['status'],
        joined: form.joined,
        checkInDay: form.checkInDay,
        email: form.email.trim(),
        phone: form.phone.trim(),
      };
      next.clients = form.id
        ? next.clients.map(row => (row.id === form.id ? item : row))
        : [...next.clients, item];
    } else if (modal === 'session') {
      const item: Session = {
        id: recordId,
        clientId: form.clientId,
        date: form.date,
        minutes: Number(form.minutes),
        type: form.type,
        note: form.note.trim(),
      };
      next.sessions = form.id
        ? next.sessions.map(row => (row.id === form.id ? item : row))
        : [...next.sessions, item];
    } else if (modal === 'payment') {
      const item: Payment = {
        id: recordId,
        clientId: form.clientId,
        amount: Number(form.amount),
        due: form.due,
        status: form.status as Payment['status'],
        method: form.status === 'Paid' ? form.method as Payment['method'] : '',
        paidAt: form.status === 'Paid' ? (form.paidAt || today()) : '',
        checkNumber: form.status === 'Paid' && form.method === 'Check' ? form.checkNumber.trim() : '',
      };
      next.payments = form.id
        ? next.payments.map(row => (row.id === form.id ? item : row))
        : [...next.payments, item];
    } else if (modal === 'membership') {
      const item: Membership = { id: recordId, clientId: form.clientId, name: form.name.trim(), amount: Number(form.amount), interval: form.interval as Membership['interval'], nextDue: form.nextDue, status: form.status as Membership['status'], paymentLink: form.paymentLink.trim() };
      next.memberships = form.id ? next.memberships.map(row => row.id === form.id ? item : row) : [...next.memberships, item];
    } else if (modal === 'reminder') {
      const item: Reminder = { id: recordId, clientId: form.clientId, subject: form.subject.trim(), message: form.message.trim(), due: form.due, status: form.status as Reminder['status'] };
      next.reminders = form.id ? next.reminders.map(row => row.id === form.id ? item : row) : [...next.reminders, item];
    } else {
      const item: CheckIn = {
        id: recordId,
        clientId: form.clientId,
        date: form.date,
        energy: form.energy,
        note: form.note.trim(),
      };
      next.checkins = form.id
        ? next.checkins.map(row => (row.id === form.id ? item : row))
        : [...next.checkins, item];
    }
    if (await save(next)) setModal(null);
  }

  async function remove(kind: Kind, recordId: string) {
    const label =
      kind === 'client'
        ? 'this client and all their sessions, memberships, payments, reminders and check-ins'
        : `this ${kind === 'checkin' ? 'check-in' : kind}`;
    const prompt = language === 'es'
      ? kind === 'client'
        ? '¿Borrar esta clienta y todas sus sesiones, membresías, pagos, recordatorios y seguimientos? No se puede deshacer.'
        : '¿Borrar este registro? No se puede deshacer.'
      : `Delete ${label}? This cannot be undone.`;
    if (!window.confirm(prompt)) return;
    const next: Workspace = structuredClone(workspace);
    if (kind === 'client') {
      next.clients = next.clients.filter(item => item.id !== recordId);
      next.sessions = next.sessions.filter(item => item.clientId !== recordId);
      next.payments = next.payments.filter(item => item.clientId !== recordId);
      next.checkins = next.checkins.filter(item => item.clientId !== recordId);
      next.memberships = next.memberships.filter(item => item.clientId !== recordId);
      next.reminders = next.reminders.filter(item => item.clientId !== recordId);
    } else if (kind === 'session')
      next.sessions = next.sessions.filter(item => item.id !== recordId);
    else if (kind === 'payment')
      next.payments = next.payments.filter(item => item.id !== recordId);
    else if (kind === 'membership')
      next.memberships = next.memberships.filter(item => item.id !== recordId);
    else if (kind === 'reminder')
      next.reminders = next.reminders.filter(item => item.id !== recordId);
    else next.checkins = next.checkins.filter(item => item.id !== recordId);
    await save(next);
  }

  function compose(client: Client, message: string, subject = 'A note from your coach', channel: 'email' | 'sms' = 'email') {
    if (mode === 'demo') {
      setErrorMessage('Preview only: sign in and add a real client to compose messages.');
      return;
    }
    if (channel === 'email' && client.email) {
      window.location.href = `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    } else if (channel === 'sms' && client.phone) {
      window.location.href = `sms:${client.phone.replace(/[^+\d]/g, '')}?body=${encodeURIComponent(message)}`;
    } else setErrorMessage(`Add ${channel === 'email' ? 'an email' : 'a phone number'} to this client first.`);
  }

  async function completeReminder(item: Reminder) {
    await save({ ...workspace, reminders: workspace.reminders.map(row => row.id === item.id ? { ...row, status: 'Done' as const } : row) });
  }

  async function signIn() {
    setErrorMessage('');
    setAuthNotice('');
    if (!loginEmail.trim() || loginPassword.length < 6) {
      setErrorMessage(language === 'es' ? 'Ingresa tu correo y una contraseña de al menos 6 caracteres.' : 'Enter your email and a password of at least 6 characters.');
      return;
    }
    try {
      if (creatingAccount) {
        const response = await auth.signUp(loginEmail.trim(), loginPassword);
        if (!response.session) {
          setAuthNotice(language === 'es' ? 'Revisa tu correo para confirmar tu cuenta. Después inicia sesión.' : 'Check your email to confirm your account, then sign in.');
          setCreatingAccount(false);
          return;
        }
      } else {
        await auth.signInWithPassword(loginEmail.trim(), loginPassword);
      }
      setLoginPassword('');
      await restore();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Sign-in failed. Please try again.';
      setErrorMessage(!creatingAccount && /invalid login credentials/i.test(message)
        ? (language === 'es' ? 'Todavía no tienes una cuenta. Toca «Crear una cuenta nueva» y regístrate primero.' : 'No account found with those credentials. Select “Create a new account” to register first.')
        : message);
    }
  }

  async function signOut() {
    await auth.signOut();
    setAccount(null);
    setIsOwner(false);
    setInvites([]);
    setMode('demo');
    setWorkspace(withDefaults({ revision: 0, clients: [], sessions: [], payments: [], checkins: [], memberships: [], reminders: [] }));
    setSection('Overview');
  }

  function exportCsv() {
    const header = [
      'Client',
      'Status',
      'Focus',
      'Sessions',
      'Paid USD',
      'Due USD',
      'Last check-in',
    ];
    const rows = workspace.clients.map(client => {
      const payments = workspace.payments.filter(
        item => item.clientId === client.id
      );
      const last = workspace.checkins
        .filter(item => item.clientId === client.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      return [
        client.name,
        client.status,
        client.focus,
        String(
          workspace.sessions.filter(item => item.clientId === client.id).length
        ),
        String(
          payments
            .filter(item => item.status === 'Paid')
            .reduce((sum, item) => sum + item.amount, 0)
        ),
        String(
          payments
            .filter(item => item.status === 'Due')
            .reduce((sum, item) => sum + item.amount, 0)
        ),
        last?.date ?? '',
      ];
    });
    const csv = [header, ...rows]
      .map(row =>
        row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')
      )
      .join('\r\n');
    const url = URL.createObjectURL(
      new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'coach-desk-clients.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const clientName = (id: string) =>
    workspace.clients.find(client => client.id === id)?.name ?? 'Client';
  const visibleClients = useMemo(
    () =>
      workspace.clients.filter(item =>
        `${item.name} ${item.focus}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [workspace.clients, search]
  );
  const due = workspace.payments.filter(item => item.status === 'Due');
  const dueTotal = due.reduce((sum, item) => sum + item.amount, 0);
  const paidTotal = workspace.payments
    .filter(item => item.status === 'Paid')
    .reduce((sum, item) => sum + item.amount, 0);
  const upcoming = [...workspace.sessions]
    .filter(item => item.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date));
  const sortedSessions = [...workspace.sessions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const sortedPayments = [...workspace.payments].sort((a, b) =>
    b.due.localeCompare(a.due)
  );
  const sortedCheckins = [...workspace.checkins].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const sortedMemberships = [...workspace.memberships].sort((a, b) => a.nextDue.localeCompare(b.nextDue));
  const sortedReminders = [...workspace.reminders].sort((a, b) => a.due.localeCompare(b.due));
  const pendingReminders = sortedReminders.filter(item => item.status === 'Pending');

  const action =
    section === 'Overview' || section === 'Clients'
      ? 'client'
      : section === 'Sessions'
        ? 'session'
        : section === 'Memberships'
          ? 'membership'
        : section === 'Payments'
          ? 'payment'
          : section === 'Messages'
            ? 'reminder'
          : 'checkin';
  const actionLabel =
    section === 'Overview' || section === 'Clients'
      ? 'Add client'
      : section === 'Sessions'
        ? 'Log session'
        : section === 'Memberships'
          ? 'Add membership'
        : section === 'Payments'
          ? 'Add payment'
          : section === 'Messages'
            ? 'Plan reminder'
          : 'Add check-in';

  if (!ready || !account) {
    return (
      <div className="shell" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <main className="panel" style={{ width: '100%', maxWidth: 470, padding: 32, textAlign: 'center' }}>
          <div className="brand-mark" style={{ margin: '0 auto 20px' }}><span>SL</span></div>
          <span className="eyebrow">SELF LOVE GYM · COACH DESK</span>
          <h1>{language === 'es' ? 'Tu espacio de entrenamiento, organizado.' : 'Your coaching space, beautifully organized.'}</h1>
          <p>{language === 'es' ? 'Inicia sesión para gestionar tus clientas, sesiones, membresías y pagos en tu espacio privado.' : 'Sign in to manage your clients, sessions, memberships and payments in your private workspace.'}</p>
          {errorMessage && <p role="alert">{errorMessage}</p>}
          {authNotice && <p role="status">{authNotice}</p>}
          <div className="language-switch" role="group" aria-label="Language / Idioma" style={{ justifyContent: 'center', margin: '20px 0' }}>
            <button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>English</button>
            <button className={language === 'es' ? 'selected' : ''} onClick={() => setLanguage('es')}>Español latino</button>
          </div>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>{creatingAccount ? (language === 'es' ? 'CREAR TU CUENTA' : 'CREATE YOUR ACCOUNT') : (language === 'es' ? 'ENTRAR A TU CUENTA' : 'SIGN IN')}</p>
          <form onSubmit={event => { event.preventDefault(); void signIn(); }} style={{ display: 'grid', gap: 12, textAlign: 'left' }}>
            <label>{language === 'es' ? 'Correo electrónico' : 'Email'}<input type="email" autoComplete="email" required value={loginEmail} onChange={event => setLoginEmail(event.target.value)} style={{ width: '100%', padding: 12 }} /></label>
            <label>{language === 'es' ? 'Contraseña' : 'Password'}<input type="password" autoComplete={creatingAccount ? 'new-password' : 'current-password'} minLength={6} required value={loginPassword} onChange={event => setLoginPassword(event.target.value)} style={{ width: '100%', padding: 12 }} /></label>
          <button type="submit" className="primary-button" disabled={!ready} style={{ width: '100%', justifyContent: 'center', padding: 15 }}>
            <LogIn size={18} /> {ready ? (creatingAccount ? (language === 'es' ? 'Crear cuenta' : 'Create account') : (language === 'es' ? 'Iniciar sesión' : 'Sign in to your account')) : (language === 'es' ? 'Cargando…' : 'Loading…')}
          </button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0 24px' }}>
            <button type="button" className="primary-button" onClick={() => { setCreatingAccount(true); setErrorMessage(''); setAuthNotice(''); }} style={{ width: '100%', justifyContent: 'center', padding: 14, background: creatingAccount ? undefined : '#f1ddf4', color: creatingAccount ? undefined : '#24172c' }}>{language === 'es' ? 'Crear una cuenta nueva' : 'Create a new account'}</button>
            <button type="button" className="text-action" onClick={() => { setCreatingAccount(false); setErrorMessage(''); setAuthNotice(''); }} style={{ width: '100%', padding: 12 }}>{language === 'es' ? 'Ya tengo una cuenta · Iniciar sesión' : 'I already have an account · Sign in'}</button>
          </div>
          <p style={{ marginTop: 20, fontSize: 12 }}><a href="./terms.html">{language === 'es' ? 'Términos' : 'Terms'}</a> · <a href="./privacy.html">{language === 'es' ? 'Privacidad' : 'Privacy'}</a></p>
          <p style={{ fontSize: 11 }}>POWERED BY THE LAUNCH ERA</p>
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span>SL</span>
          </div>
          <div>
            <strong>Self Love Gym</strong>
            <span>COACH DESK</span>
          </div>
        </div>
        <div className="sidebar-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {nav.map(({ name, Icon }) => (
            <button
              key={name}
              className={`nav-item ${section === name ? 'active' : ''}`}
              onClick={() => {
                navigate(name);
              }}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{name}</span>
              {name === 'Payments' && due.length > 0 && <i>{due.length}</i>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <div className="note-icon">
            <Activity size={18} />
          </div>
          <strong>Less admin. More coaching.</strong>
          <p>
            Your clients, sessions and follow-ups, together in one calm place.
          </p>
        </div>
        <div className="sidebar-foot">
          <span className="avatar">{account?.name?.[0] ?? 'S'}</span>
          <div>
            <strong>{account.name}</strong>
            <span>
              Your private workspace
            </span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">
              <span>SL</span>
            </span>
            <strong>Self Love Gym</strong>
          </div>
          <span className="topbar-label">
            COACH DESK <span> / {section}</span>
          </span>
          <div className="top-actions">
            <span className="today-tag">{prettyDate(today(), language)}</span>
            <button className="text-action" onClick={() => void signOut()}><LogOut size={17} /> Sign out</button>
          </div>
        </header>

        {!ready ? (
          <div className="loading">Opening your workspace…</div>
        ) : (
          <>
            {false && (
              <div className="demo-strip">
                <span className="demo-dot" />
                <span>
                  <strong>Interactive preview</strong> · Fictional clients.
                  Changes stay in this browser.
                </span>
                <button
                  onClick={() => {
                    if (window.confirm(language === 'es' ? '¿Restablecer los datos ficticios de la vista de prueba?' : 'Reset fictional preview data?')) {
                      localStorage.removeItem('selflovegym-coachdesk-demo-v1');
                      setWorkspace(sample);
                      setErrorMessage('');
                    }
                  }}
                >
                  Reset preview
                </button>
              </div>
            )}
            {errorMessage && (
              <div className="error-banner" role="alert">
                {errorMessage}
                <button onClick={() => void restore()}>Reload</button>
              </div>
            )}

            <div className="content">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    {section === 'Overview'
                      ? 'YOUR DAY AT A GLANCE'
                      : 'COACHING WORKSPACE'}
                  </div>
                  <h1>
                    {section === 'Overview'
                      ? 'A little more room to coach.'
                      : section}
                  </h1>
                  <p>
                    {section === 'Overview'
                      ? 'Keep the people and the details close, without the busywork.'
                      : section === 'Clients'
                        ? 'Every client, their focus and their next step.'
                        : section === 'Sessions'
                          ? 'A clear record of the work you do together.'
                          : section === 'Memberships'
                            ? 'Recurring plans and each client’s payment link.'
                          : section === 'Settings'
                            ? 'Make this space feel like yours and keep it close on your device.'
                          : section === 'Payments'
                            ? 'Record cash and check payments without mixing them with online charges.'
                            : section === 'Messages'
                              ? 'Write a personal note and keep reminders on your list.'
                            : 'The conversations that keep your coaching personal.'}
                  </p>
                </div>
                {section !== 'Settings' && <button
                  className="primary-button"
                  onClick={() => openModal(action)}
                  disabled={
                    saving || (action !== 'client' && !workspace.clients.length)
                  }
                >
                  <Plus size={18} />
                  {actionLabel}
                </button>}
              </div>

              {section === 'Overview' && (
                <>
                  <div className="focus-banner">
                    <div className="focus-copy"><span className="eyebrow">TODAY IN FOCUS</span><h2>Stay close to your people.</h2><p>{pendingReminders.length ? `${pendingReminders.length} personal follow-up${pendingReminders.length === 1 ? '' : 's'} waiting for you.` : 'Your follow-ups are all caught up.'} Keep the next step simple.</p></div>
                    <div className="focus-actions"><button onClick={() => navigate('Messages')}>Review reminders</button><button onClick={() => navigate('Memberships')}>See memberships</button></div>
                  </div>
                  <div className="stats">
                    <div className="stat stat-feature">
                      <span>ACTIVE CLIENTS</span>
                      <div>
                        <strong>
                          {
                            workspace.clients.filter(
                              item => item.status === 'Active'
                            ).length
                          }
                        </strong>
                        <UsersRound size={25} />
                      </div>
                      <small>People in your care</small>
                    </div>
                    <div className="stat">
                      <span>UPCOMING SESSIONS</span>
                      <div>
                        <strong>{upcoming.length}</strong>
                        <CalendarDays size={24} />
                      </div>
                      <small>On your calendar</small>
                    </div>
                    <div className="stat">
                      <span>PAYMENTS DUE</span>
                      <div>
                        <strong>{money(dueTotal)}</strong>
                        <CircleDollarSign size={24} />
                      </div>
                      <small>{`${due.length} ${due.length === 1 ? 'open entry' : 'open entries'}`}</small>
                    </div>
                    <div className="stat">
                      <span>RECORDED AS PAID</span>
                      <div>
                        <strong>{money(paidTotal)}</strong>
                        <Check size={24} />
                      </div>
                      <small>Manual records only</small>
                    </div>
                  </div>
                  <div className="overview-grid">
                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <span className="eyebrow">COMING UP</span>
                          <h2>Next sessions</h2>
                        </div>
                        <button
                          className="arrow-button"
                          onClick={() => setSection('Sessions')}
                        >
                          View all <ArrowRight size={16} />
                        </button>
                      </div>
                      {upcoming.length ? (
                        upcoming.slice(0, 4).map(item => (
                          <div className="list-row" key={item.id}>
                            <div className="date-tile">
                              <b>
                                {new Date(
                                  `${item.date}T12:00:00`
                                ).toLocaleDateString('en-US', {
                                  day: '2-digit',
                                })}
                              </b>
                              <span>
                                {new Date(
                                  `${item.date}T12:00:00`
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                })}
                              </span>
                            </div>
                            <div className="row-main">
                              <strong>{clientName(item.clientId)}</strong>
                              <small>
                                {item.type} · {item.minutes} min
                              </small>
                            </div>
                            <ChevronRight size={17} />
                          </div>
                        ))
                      ) : (
                        <div className="empty-mini">
                          No upcoming sessions yet. Add one when you're ready.
                        </div>
                      )}
                    </section>
                    <section className="panel soft-panel">
                      <div className="panel-heading">
                        <div>
                          <span className="eyebrow">STAY CONNECTED</span>
                          <h2>Check-in notes</h2>
                        </div>
                        <button
                          className="arrow-button"
                          onClick={() => setSection('Check-ins')}
                        >
                          View all <ArrowRight size={16} />
                        </button>
                      </div>
                      {sortedCheckins.length ? (
                        sortedCheckins.slice(0, 3).map(item => (
                          <div className="quote-row" key={item.id}>
                            <div className="circle-avatar">
                              {clientName(item.clientId).slice(0, 1)}
                            </div>
                            <div>
                              <div className="quote-top">
                                <strong>{clientName(item.clientId)}</strong>
                                <small>{prettyDate(item.date, language)}</small>
                              </div>
                              <p>{item.note || item.energy}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-mini">
                          A little note after each check-in goes a long way.
                        </div>
                      )}
                    </section>
                  </div>
                  <div className="quick-panel">
                    <div className="quick-icon">
                      <Heart size={22} />
                    </div>
                    <div>
                      <strong>Made for the human side of coaching.</strong>
                      <span>
                        Keep the admin light, so your attention stays with your
                        clients.
                      </span>
                    </div>
                    <button onClick={() => setSection('Clients')}>
                      See clients <ArrowRight size={17} />
                    </button>
                  </div>
                </>
              )}

              {section === 'Clients' && (
                <section className="panel list-panel">
                  <div className="list-toolbar">
                    <div>
                      <span className="eyebrow">YOUR PEOPLE</span>
                      <h2>
                        {workspace.clients.length}{' '}
                        {workspace.clients.length === 1 ? 'client' : 'clients'}
                      </h2>
                    </div>
                    <div className="toolbar-right">
                      <label className="search-box">
                        <Search size={17} />
                        <input
                          placeholder="Search clients"
                          value={search}
                          onChange={event => setSearch(event.target.value)}
                        />
                      </label>
                      <button
                        className="secondary-button"
                        onClick={exportCsv}
                        disabled={!workspace.clients.length}
                      >
                        <ArrowDownToLine size={17} /> Export CSV
                      </button>
                    </div>
                  </div>
                  {visibleClients.length ? (
                    visibleClients.map(item => (
                      <div className="client-row" key={item.id}>
                        <div className="client-avatar">
                          {item.name
                            .split(' ')
                            .map(word => word[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div className="client-info">
                          <strong>{item.name}</strong>
                          <span>
                            {item.focus || 'No focus added'} · Check-in{' '}
                            {item.checkInDay}
                          </span>
                        </div>
                        <span
                          className={`badge ${item.status === 'Active' ? 'green' : 'muted'}`}
                        >
                          {item.status}
                        </span>
                        <div className="row-actions">
                          <button
                            onClick={() => openModal('client', item)}
                            aria-label={`Edit ${item.name}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void remove('client', item.id)}
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-large">
                      {search
                        ? 'No clients match that search.'
                        : 'Your client list starts here. Add the first person you coach.'}
                    </div>
                  )}
                </section>
              )}

              {section === 'Sessions' && (
                <section className="panel list-panel">
                  <div className="list-toolbar">
                    <div>
                      <span className="eyebrow">TIME TOGETHER</span>
                      <h2>Session log</h2>
                    </div>
                    <span className="helper">
                      Scheduled and completed sessions
                    </span>
                  </div>
                  {sortedSessions.length ? (
                    sortedSessions.map(item => (
                      <div className="record-row" key={item.id}>
                        <div className="record-icon lavender">
                          <Clock3 size={20} />
                        </div>
                        <div className="record-main">
                          <strong>{clientName(item.clientId)}</strong>
                          <span>
                            {item.type} · {item.minutes} minutes
                            {item.note ? ` · ${item.note}` : ''}
                          </span>
                        </div>
                        <span className="record-date">
                          {prettyDate(item.date, language)}
                        </span>
                        <div className="row-actions">
                          <button onClick={() => openModal('session', item)}>
                            Edit
                          </button>
                          <button
                            onClick={() => void remove('session', item.id)}
                            aria-label="Delete session"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-large">
                      No sessions yet. Log a session to keep your schedule
                      together.
                    </div>
                  )}
                </section>
              )}

              {section === 'Memberships' && (
                <>
                  <div className="membership-intro membership-guide">
                    <div><span className="eyebrow">ONLINE MEMBERSHIPS</span><h2>Set up payments in three steps.</h2><p>Your clients check out through Stripe. Your bank information stays in your own Stripe account.</p></div>
                    <ol className="setup-steps">
                      <li><span>1</span><div><strong>Connect your bank in Stripe</strong><small>Stripe handles bank details and deposits.</small></div></li>
                      <li><span>2</span><div><strong>Create a recurring link</strong><small>Choose the same price and billing interval.</small></div></li>
                      <li><span>3</span><div><strong>Add a membership here</strong><small>Paste the link so a client can check out.</small></div></li>
                    </ol>
                    <div className="setup-actions"><a className="secondary-button" href="https://dashboard.stripe.com/settings/payouts" target="_blank" rel="noopener noreferrer">Set up bank in Stripe <ExternalLink size={16} /></a><a className="secondary-button" href="https://dashboard.stripe.com/payment-links/create/standard-pricing" target="_blank" rel="noopener noreferrer">Create payment link <ExternalLink size={16} /></a><button className="primary-button" onClick={() => openModal('membership')} disabled={!workspace.clients.length}>Add membership <Plus size={16} /></button></div>
                  </div>
                  <section className="panel list-panel"><div className="list-toolbar"><div><span className="eyebrow">YOUR PLANS</span><h2>Client memberships</h2></div><span className="helper">Online status and payouts are checked in Stripe</span></div>
                    {sortedMemberships.length ? sortedMemberships.map(item => {
                      const client = workspace.clients.find(row => row.id === item.clientId);
                      return <div className="record-row" key={item.id}><div className="record-icon lavender"><CreditCard size={20} /></div><div className="record-main"><strong>{item.name} · {client?.name ?? 'Client'}</strong><span>{money(item.amount)} / {item.interval.toLowerCase()} · Next review {prettyDate(item.nextDue, language)} · {item.status}</span></div>
                        <div className="row-actions membership-actions">
                          {item.paymentLink && mode === 'account' ? <><a href={item.paymentLink} target="_blank" rel="noopener noreferrer">Open checkout</a><button onClick={() => client && compose(client, `Hi ${client.name.split(' ')[0]}! Here is the link for your ${item.name} membership: ${item.paymentLink}`, `${item.name} membership`)}>Open email draft</button><button onClick={() => client && compose(client, `Hi ${client.name.split(' ')[0]}! Here is your ${item.name} membership link: ${item.paymentLink}`, '', 'sms')}>Open SMS draft</button></> : <span className="helper">{mode === 'demo' ? 'Preview only' : 'Add Stripe link'}</span>}
                          <button onClick={() => openModal('membership', item)}>Edit</button><button onClick={() => void remove('membership', item.id)} aria-label="Delete membership"><Trash2 size={17} /></button>
                        </div></div>;
                    }) : <div className="empty-large">Create the first membership for a client.</div>}
                  </section>
                  <p className="section-note">Keep bank details in Stripe. This workspace stores only your checkout link; it does not verify subscription payments automatically.</p>
                </>
              )}

              {section === 'Payments' && (
                <section className="panel list-panel">
                  <div className="list-toolbar">
                    <div>
                      <span className="eyebrow">CLEAR AND SIMPLE</span>
                      <h2>Payment log</h2>
                    </div>
                    <span className="helper">
                      Cash and check records · online billing stays in Stripe
                    </span>
                  </div>
                  {sortedPayments.length ? (
                    sortedPayments.map(item => (
                      <div className="record-row" key={item.id}>
                        <div className="record-icon peach">
                          <CircleDollarSign size={20} />
                        </div>
                        <div className="record-main">
                          <strong>{clientName(item.clientId)}</strong>
                          <span>
                            Due {prettyDate(item.due, language)} · {money(item.amount)}
                            {item.status === 'Paid' ? ` · ${item.method || 'Method not recorded'}${item.method === 'Check' && item.checkNumber ? ` #${item.checkNumber}` : ''} · ${prettyDate(item.paidAt || item.due, language)}` : ''}
                          </span>
                        </div>
                        <button
                          className={`badge badge-button ${item.status === 'Paid' ? 'green' : 'amber'}`}
                          disabled={saving}
                          onClick={() => openModal('payment', item)}
                          title="Edit payment record"
                        >
                          {item.status === 'Paid' ? '✓ Paid' : 'Record payment'}
                        </button>
                        <div className="row-actions">
                          <button onClick={() => openModal('payment', item)}>
                            Edit
                          </button>
                          <button
                            onClick={() => void remove('payment', item.id)}
                            aria-label="Delete payment"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-large">
                      No payments recorded yet. Add an entry when you need it.
                    </div>
                  )}
                </section>
              )}

              {section === 'Messages' && (
                <>
                  <div className="membership-intro message-intro"><div><span className="eyebrow">PERSONAL FOLLOW-UPS</span><h2>Messages with intention.</h2><p>Plan a reminder, then open the email or SMS composer when it is time. You review and send it yourself. Messages are not sent automatically.</p></div><Bell size={36} /></div>
                  <section className="panel list-panel"><div className="list-toolbar"><div><span className="eyebrow">REMINDER LIST</span><h2>Planned messages</h2></div><span className="helper">{`${pendingReminders.filter(item => item.due <= today()).length} due today or earlier`}</span></div>
                    {sortedReminders.length ? sortedReminders.map(item => {
                      const client = workspace.clients.find(row => row.id === item.clientId);
                      return <div className="record-row" key={item.id}><div className="record-icon peach"><Bell size={20} /></div><div className="record-main"><strong>{item.subject} · {client?.name ?? 'Client'}</strong><span>{item.message}</span><small>{prettyDate(item.due, language)} · {item.status === 'Done' ? 'Completed manually' : item.due <= today() ? 'Ready to send' : 'Upcoming'}</small></div><div className="row-actions membership-actions">{item.status === 'Pending' && <><button onClick={() => client && compose(client, item.message, item.subject)}><Mail size={15} /> Open email draft</button><button onClick={() => client && compose(client, item.message, item.subject, 'sms')}><Send size={15} /> Open SMS draft</button><button onClick={() => void completeReminder(item)}>Mark done</button></>}<button onClick={() => openModal('reminder', item)}>Edit</button><button onClick={() => void remove('reminder', item.id)} aria-label="Delete reminder"><Trash2 size={17} /></button></div></div>;
                    }) : <div className="empty-large">No reminders yet. Plan a personal follow-up for a client.</div>}
                  </section>
                  <p className="section-note">Mark a reminder done only after you have sent the message yourself.</p>
                  <section className="panel list-panel"><div className="list-toolbar"><div><span className="eyebrow">COMPOSE NOW</span><h2>Quick message</h2></div></div><div className="message-client-list">{workspace.clients.map(client => <div key={client.id}><strong>{client.name}</strong><div className="row-actions"><button onClick={() => compose(client, `Hi ${client.name.split(' ')[0]}! Just checking in. How are you feeling this week?`, 'Checking in')}><Mail size={15} /> Open email draft</button><button onClick={() => compose(client, `Hi ${client.name.split(' ')[0]}! Just checking in. How are you feeling this week?`, '', 'sms')}><MessageCircle size={15} /> Open SMS draft</button></div></div>)}</div></section>
                </>
              )}

              {section === 'Check-ins' && (
                <section className="panel list-panel">
                  <div className="list-toolbar">
                    <div>
                      <span className="eyebrow">A PERSONAL TOUCH</span>
                      <h2>Weekly check-ins</h2>
                    </div>
                    <span className="helper">
                      Private notes for your own records
                    </span>
                  </div>
                  {sortedCheckins.length ? (
                    sortedCheckins.map(item => (
                      <div className="record-row checkin-row" key={item.id}>
                        <div className="record-icon blue">
                          <Heart size={20} />
                        </div>
                        <div className="record-main">
                          <strong>
                            {clientName(item.clientId)}{' '}
                            <span className="energy">{item.energy}</span>
                          </strong>
                          <span>{item.note || 'No note added'}</span>
                        </div>
                        <span className="record-date">
                          {prettyDate(item.date, language)}
                        </span>
                        <div className="row-actions">
                          <button onClick={() => openModal('checkin', item)}>
                            Edit
                          </button>
                          <button
                            onClick={() => void remove('checkin', item.id)}
                            aria-label="Delete check-in"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-large">
                      No check-ins recorded yet. Keep a short note after your
                      next conversation.
                    </div>
                  )}
                </section>
              )}

              {section === 'Settings' && (
                <div className="settings-grid">
                  {isOwner && <section className="panel settings-panel" style={{ gridColumn: '1 / -1' }}>
                    <span className="eyebrow">OWNER · ADMIN ACCESS</span>
                    <h2>{language === 'es' ? 'Controla quién puede entrar' : 'Control who can join'}</h2>
                    <p>{language === 'es' ? 'Solo las personas que autorices aquí podrán acceder a su espacio. Crear una cuenta no da acceso automáticamente.' : 'Only people you approve here can access a workspace. Creating an account does not grant access.'}</p>
                    <form onSubmit={async event => {
                      event.preventDefault();
                      try {
                        await ownerAccess.invite(inviteEmail);
                        setInvites(await ownerAccess.listInvites());
                        setInviteEmail('');
                        setInviteNotice(language === 'es' ? 'Correo autorizado. La persona ya puede registrarse y confirmar su correo.' : 'Email approved. This person can now register and verify their email.');
                      } catch (cause) { setInviteNotice(cause instanceof Error ? cause.message : 'Could not approve email'); }
                    }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <input type="email" required value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} placeholder="coach@example.com" aria-label="Email to approve" style={{ flex: 1, minWidth: 170, padding: 12 }} />
                      <button className="primary-button" type="submit">{language === 'es' ? 'Autorizar correo' : 'Approve email'}</button>
                    </form>
                    {inviteNotice && <p role="status">{inviteNotice}</p>}
                    {invites.map(item => <div key={item.email} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginTop: 12 }}>
                      <span>{item.email}</span>
                      <button type="button" onClick={async () => { try { await ownerAccess.revoke(item.email); setInvites(await ownerAccess.listInvites()); setInviteNotice(language === 'es' ? 'Acceso revocado' : 'Access revoked'); } catch (cause) { setInviteNotice(cause instanceof Error ? cause.message : 'Could not revoke access'); } }}>{language === 'es' ? 'Revocar' : 'Revoke'}</button>
                    </div>)}
                  </section>
                  <section className="panel settings-panel">
                    <span className="eyebrow">{language === 'es' ? 'IDIOMA' : 'LANGUAGE'}</span>
                    <h2>{language === 'es' ? 'Elige cómo quieres ver la app' : 'Choose your language'}</h2>
                    <p>{language === 'es' ? 'Puedes cambiarlo cuando quieras. Tu preferencia se guarda en este dispositivo.' : 'Switch whenever you like. Your choice is saved on this device.'}</p>
                    <div className="language-switch" role="group" aria-label="Language / Idioma">
                      <button className={language === 'en' ? 'selected' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button>
                      <button className={language === 'es' ? 'selected' : ''} aria-pressed={language === 'es'} onClick={() => setLanguage('es')}>Español latino</button>
                    </div>
                  </section>
                  <section className="panel settings-panel">
                    <span className="eyebrow">{language === 'es' ? 'AYUDA' : 'HELP'}</span>
                    <h2>{language === 'es' ? 'Pon la app en tu pantalla' : 'Add the app to your screen'}</h2>
                    <p>{language === 'es' ? 'Abre este mismo enlace en el dispositivo donde la quieres usar.' : 'Open this same link on the device where you want to use it.'}</p>
                    <div className="install-steps">
                      <div><strong>iPhone / iPad · Safari</strong><span>{language === 'es' ? 'Toca Compartir → Añadir a pantalla de inicio → Añadir.' : 'Tap Share → Add to Home Screen → Add.'}</span></div>
                      <div><strong>Android · Chrome</strong><span>{language === 'es' ? 'Toca el menú de tres puntos → Añadir a pantalla principal o Instalar app.' : 'Tap the three-dot menu → Add to Home screen or Install app.'}</span></div>
                      <div><strong>{language === 'es' ? 'Computadora · Chrome' : 'Computer · Chrome'}</strong><span>{language === 'es' ? 'Abre el menú de tres puntos → Transmitir, guardar y compartir → Instalar página como app.' : 'Open the three-dot menu → Cast, save, and share → Install page as app.'}</span></div>
                    </div>
                    <p className="settings-hint">{language === 'es' ? 'Tus registros privados se guardan en tu cuenta.' : 'Your private records are saved to your account.'}</p>
                  </section>
                  <section className="panel settings-panel">
                    <span className="eyebrow">{language === 'es' ? 'LEGALES' : 'LEGAL'}</span>
                    <h2>{language === 'es' ? 'Tus datos y condiciones' : 'Your data and terms'}</h2>
                    <p>{language === 'es' ? 'Consulta cómo funciona este servicio y qué información guarda.' : 'Read how the service works and what information it keeps.'}</p>
                    <div className="legal-links"><a href="terms.html" target="_blank" rel="noopener noreferrer">{language === 'es' ? 'Términos y condiciones' : 'Terms & conditions'} <ExternalLink size={15} /></a><a href="privacy.html" target="_blank" rel="noopener noreferrer">{language === 'es' ? 'Política de privacidad' : 'Privacy policy'} <ExternalLink size={15} /></a></div>
                    <p className="settings-hint">{language === 'es' ? '¿Necesitas ayuda? Escríbenos a hello@thelaunchera.com.' : 'Need help? Email hello@thelaunchera.com.'}</p>
                  </section>
                </div>
              )}

              <footer className="content-footer">
                <span>SELF LOVE GYM · COACH DESK <b>· POWERED BY THE LAUNCH ERA</b></span>
                <span>
                  {'PRIVATE WORKSPACE'}{' '}
                  {saving ? '· SAVING…' : ''}
                </span>
              </footer>
            </div>
          </>
        )}
      </main>

      {moreOpen && <div className="more-menu" role="menu" aria-label="More sections">{nav.filter(item => ['Sessions', 'Payments', 'Check-ins'].includes(item.name)).map(({ name, Icon }) => <button key={name} role="menuitem" onClick={() => navigate(name)}><Icon size={17} />{name}</button>)}</div>}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {nav.filter(item => ['Overview', 'Clients', 'Memberships', 'Messages', 'Settings'].includes(item.name)).map(({ name, Icon }) => (
          <button
            key={name}
            className={section === name ? 'active' : ''}
            onClick={() => navigate(name)}
          >
            <Icon size={20} />
            <span>{name}</span>
          </button>
        ))}
        <button className={moreOpen || ['Sessions', 'Payments', 'Check-ins'].includes(section) ? 'active' : ''} onClick={() => setMoreOpen(value => !value)} aria-expanded={moreOpen} aria-label="More sections"><MoreHorizontal size={20} /><span>More</span></button>
      </nav>

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${form.id ? 'Edit' : 'Add'} ${modal}`}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">COACH DESK</span>
                <h2>
                  {form.id ? 'Edit' : 'Add'}{' '}
                  {modal === 'checkin' ? 'check-in' : modal}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setModal(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={event => void submitForm(event)}>
              {modal === 'client' ? (
                <>
                  <label>
                    Client name
                    <input
                      autoFocus
                      maxLength={80}
                      value={form.name}
                      onChange={event =>
                        setForm({ ...form, name: event.target.value })
                      }
                      placeholder="e.g. Maya Brooks"
                    />
                  </label>
                  <label>
                    Focus / goal
                    <input
                      maxLength={100}
                      value={form.focus}
                      onChange={event =>
                        setForm({ ...form, focus: event.target.value })
                      }
                      placeholder="e.g. Build strength"
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Joined
                      <input
                        type="date"
                        value={form.joined}
                        onChange={event =>
                          setForm({ ...form, joined: event.target.value })
                        }
                        required
                      />
                    </label>
                    <label>
                      Status
                      <select
                        value={form.status}
                        onChange={event =>
                          setForm({ ...form, status: event.target.value })
                        }
                      >
                        <option>Active</option>
                        <option>Paused</option>
                      </select>
                    </label>
                  </div>
                  <div className="form-grid"><label>Email for messages<input type="email" maxLength={120} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="client@example.com" /></label><label>Mobile phone<input type="tel" maxLength={40} value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="+1 555 000 0000" /></label></div>
                  <label>
                    Check-in day
                    <select
                      value={form.checkInDay}
                      onChange={event =>
                        setForm({ ...form, checkInDay: event.target.value })
                      }
                    >
                      {[
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                        'Sunday',
                      ].map(day => (
                        <option key={day}>{day}</option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Client
                    <select
                      value={form.clientId}
                      onChange={event =>
                        setForm({ ...form, clientId: event.target.value })
                      }
                      required
                    >
                      {workspace.clients.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {modal === 'session' && (
                    <>
                      <div className="form-grid">
                        <label>
                          Date
                          <input
                            type="date"
                            value={form.date}
                            onChange={event =>
                              setForm({ ...form, date: event.target.value })
                            }
                            required
                          />
                        </label>
                        <label>
                          Minutes
                          <input
                            type="number"
                            min="1"
                            max="600"
                            value={form.minutes}
                            onChange={event =>
                              setForm({ ...form, minutes: event.target.value })
                            }
                            required
                          />
                        </label>
                      </div>
                      <label>
                        Type
                        <select
                          value={form.type}
                          onChange={event =>
                            setForm({ ...form, type: event.target.value })
                          }
                        >
                          <option>Strength</option>
                          <option>Pilates</option>
                          <option>Mobility</option>
                          <option>Cardio</option>
                          <option>Other</option>
                        </select>
                      </label>
                      <label>
                        Private note
                        <textarea
                          maxLength={240}
                          value={form.note}
                          onChange={event =>
                            setForm({ ...form, note: event.target.value })
                          }
                          placeholder="Optional note"
                        />
                      </label>
                    </>
                  )}
                  {modal === 'payment' && (
                    <>
                      <div className="form-grid">
                        <label>
                          Amount (USD)
                          <input
                            type="number"
                            min="0"
                            max="100000"
                            step="0.01"
                            value={form.amount}
                            onChange={event =>
                              setForm({ ...form, amount: event.target.value })
                            }
                            required
                          />
                        </label>
                        <label>
                          Due date
                          <input
                            type="date"
                            value={form.due}
                            onChange={event =>
                              setForm({ ...form, due: event.target.value })
                            }
                            required
                          />
                        </label>
                      </div>
                      <label>
                        Status
                        <select
                          value={form.status}
                          onChange={event =>
                            setForm({ ...form, status: event.target.value })
                          }
                        >
                          <option>Due</option>
                          <option>Paid</option>
                        </select>
                      </label>
                      {form.status === 'Paid' && <><div className="form-grid"><label>Paid with<select value={form.method} onChange={event => setForm({ ...form, method: event.target.value })}><option value="">Select method</option><option>Cash</option><option>Check</option><option>Other</option></select></label><label>Date received<input type="date" value={form.paidAt || today()} onChange={event => setForm({ ...form, paidAt: event.target.value })} /></label></div>{form.method === 'Check' && <label>Check number (optional)<input maxLength={40} value={form.checkNumber} onChange={event => setForm({ ...form, checkNumber: event.target.value })} placeholder="e.g. 1042" /></label>}</>}
                      <p className="form-hint">
                        Manual record only. No charge is made here.
                      </p>
                    </>
                  )}
                  {modal === 'membership' && <><label>Membership name<input maxLength={80} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Strong Start" required /></label><div className="form-grid"><label>Price (USD)<input type="number" step="0.01" min="0.01" max="100000" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} required /></label><label>Frequency<select value={form.interval} onChange={event => setForm({ ...form, interval: event.target.value })}><option>Monthly</option><option>Weekly</option></select></label></div><div className="form-grid"><label>Next review date<input type="date" value={form.nextDue} onChange={event => setForm({ ...form, nextDue: event.target.value })} required /></label><label>Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}><option>Active</option><option>Paused</option></select></label></div><label>Stripe recurring Payment Link<input type="url" maxLength={500} value={form.paymentLink} onChange={event => setForm({ ...form, paymentLink: event.target.value })} placeholder="https://buy.stripe.com/..." /></label><p className="form-hint">Create the link in your own Stripe account with a recurring price that matches this plan. Add your bank securely in Stripe. The link opens Stripe Checkout; this app cannot confirm charges or cancel subscriptions.</p></>}
                  {modal === 'reminder' && <><label>Subject<input maxLength={100} value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} placeholder="e.g. Session tomorrow" required /></label><label>Message<textarea maxLength={1000} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} placeholder="Write a personal note..." required /></label><label>Remind me on<input type="date" value={form.due} onChange={event => setForm({ ...form, due: event.target.value })} required /></label><label>Status<select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}><option>Pending</option><option>Done</option></select></label><p className="form-hint">Appears in your reminder list. You must open the email or text composer and send it yourself.</p></>}
                  {modal === 'checkin' && (
                    <>
                      <label>
                        Date
                        <input
                          type="date"
                          value={form.date}
                          onChange={event =>
                            setForm({ ...form, date: event.target.value })
                          }
                          required
                        />
                      </label>
                      <label>
                        How did it feel?
                        <select
                          value={form.energy}
                          onChange={event =>
                            setForm({ ...form, energy: event.target.value })
                          }
                        >
                          <option>Feeling good</option>
                          <option>Finding my rhythm</option>
                          <option>Need some support</option>
                          <option>Taking it easy</option>
                        </select>
                      </label>
                      <label>
                        Conversation note
                        <textarea
                          maxLength={240}
                          value={form.note}
                          onChange={event =>
                            setForm({ ...form, note: event.target.value })
                          }
                          placeholder="What should you remember for next time?"
                        />
                      </label>
                    </>
                  )}
                </>
              )}
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving…'
                    : form.id
                      ? 'Save changes'
                      : 'Add to workspace'}{' '}
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

