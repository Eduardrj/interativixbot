import { createClient } from '@supabase/supabase-js';

export function extractBearerToken(header) {
  if (!header || typeof header !== 'string') return null;
  const m = header.match(/Bearer\s+(.+)/i);
  return m ? m[1] : null;
}

export async function verifySupabaseToken(token, supabaseUrl) {
  if (!token) throw new Error('No token provided');
  if (!supabaseUrl) throw new Error('No Supabase URL provided to verify token');

  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error('Supabase anon key not configured in environment (VITE_SUPABASE_ANON_KEY)');

  const supabase = createClient(supabaseUrl, anonKey);

  // supabase.auth.getUser accepts an access_token and returns user info
  const { data, error } = await supabase.auth.getUser(token).catch(err => ({ data: null, error: err }));
  if (error) throw error;

  const user = data?.user || data;
  if (!user) throw new Error('Invalid token: user not found');

  return { userId: user.id, user };
}
