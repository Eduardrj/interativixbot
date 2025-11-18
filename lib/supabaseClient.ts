import { createClient } from '@supabase/supabase-js';

// Validate environment variables before creating client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl) {
    throw new Error('❌ VITE_SUPABASE_URL is not set. Add it to your .env.local file');
}

if (!supabaseKey) {
    throw new Error('❌ VITE_SUPABASE_ANON_KEY is not set. Add it to your .env.local file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);