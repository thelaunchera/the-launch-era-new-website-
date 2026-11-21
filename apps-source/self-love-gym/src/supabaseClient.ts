import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://atrkarecooxkzmpkxrdu.supabase.co', 'sb_publishable_1gFrwfVfMlw1JkA1DRGb6g_eSLokc7H', {
  auth: {
    // Keep the default storage key so existing customers stay signed in after this update.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
const AUTH_RETURN_URL = 'https://thelaunchera.com/apps/self-love-gym/';
const empty = () => ({ revision: 0, clients: [], sessions: [], payments: [], checkins: [], memberships: [], reminders: [] });
export const auth = {
  onPasswordRecovery(callback: () => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') callback();
    });
    return () => subscription.unsubscribe();
  },
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    // A temporary connection failure must not be interpreted as a signed-out account.
    if (error) throw error;
    if (!data.user) return null;
    const { data: approved, error: approvalError } = await supabase.rpc('coach_is_approved');
    if (approvalError) throw approvalError;
    if (!approved) throw new Error('No active Coach Desk subscription was found for your verified email. Please use the same email as your Stripe purchase, or subscribe at thelaunchera.com/self-love-gym. / No hay una suscripción activa para este correo. Usa el mismo correo de compra o suscríbete en thelaunchera.com/self-love-gym.');
    return { userId: data.user.id, name: data.user.user_metadata?.name || data.user.email || 'Coach', email: data.user.email };
  },
  async signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: AUTH_RETURN_URL } });
    if (error) throw error;
    return { session: data.session };
  },
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: AUTH_RETURN_URL });
    if (error) throw error;
  },
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
export const api = {
  async get(_path: string) {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) throw new Error('Sign in required');
    const { data, error } = await supabase.from('coach_workspaces').select('workspace').eq('user_id', user.user.id).maybeSingle();
    if (error) throw error;
    return { data: data?.workspace ?? empty() };
  },
  async put(_path: string, next: Record<string, unknown>) {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) throw new Error('Sign in required');
    const revision = Number(next.revision);
    const workspace = { ...next, revision: revision + 1 };
    if (revision === 0) {
      const { error } = await supabase.from('coach_workspaces').insert({ user_id: user.user.id, workspace });
      if (error) throw new Error(error.code === '23505' ? '409 Conflict' : error.message);
    } else {
      const { data, error } = await supabase.from('coach_workspaces').update({ workspace, updated_at: new Date().toISOString() }).eq('user_id', user.user.id).filter('workspace->>revision', 'eq', String(revision)).select('user_id');
      if (error) throw error;
      if (!data?.length) throw new Error('409 Conflict');
    }
    return { data: workspace };
  }
};

export const ownerAccess = {
  async isOwner() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;
    const { data, error } = await supabase.from('app_admins').select('user_id').eq('user_id', user.user.id).maybeSingle();
    if (error) throw error;
    return Boolean(data);
  },
  async listInvites() {
    const { data, error } = await supabase.from('coach_invites').select('email,created_at').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async invite(email: string) {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) throw new Error('Sign in required');
    const { error } = await supabase.from('coach_invites').insert({ email: email.trim().toLowerCase(), invited_by: user.user.id });
    if (error) throw error;
  },
  async revoke(email: string) {
    const { error } = await supabase.from('coach_invites').delete().eq('email', email);
    if (error) throw error;
  }
};
