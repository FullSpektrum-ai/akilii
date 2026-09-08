import { createClient } from '@supabase/supabase-js';

export function createSupabaseSession({ url, anonKey } = {}) {
  if (typeof url !== 'string' || !url.trim() || typeof anonKey !== 'string' || !anonKey.trim()) {
    return null;
  }

  const client = createClient(url.trim(), anonKey.trim(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return Object.freeze({
    async getAccessToken() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session?.access_token || null;
    },
    async getUser() {
      const { data, error } = await client.auth.getUser();
      if (error) return null;
      return data.user || null;
    },
    onChange(callback) {
      const { data } = client.auth.onAuthStateChange((_event, session) => callback?.(session));
      return () => data.subscription.unsubscribe();
    },
    client,
  });
}
