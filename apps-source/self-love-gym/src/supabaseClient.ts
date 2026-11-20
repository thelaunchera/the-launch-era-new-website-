import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://atrkarecooxkzmpkxrdu.supabase.co', 'sb_publishable_1gFrwfVfMlw1JkA1DRGb6g_eSLokc7H');
const empty = () => ({ revision: 0, clients: [], sessions: [], payments: [], checkins: [], memberships: [], reminders: [] });
export const auth = {
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { userId: data.user.id, name: data.user.user_metadata?.name || data.user.email || 'Coach', email: data.user.email };
  },
  async signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { session: data.session };
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
