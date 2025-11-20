import { createClient } from '@supabase/supabase-js';

/**
 * Helper to safely read environment variables across environments
 * - Vite (`import.meta.env`)
 * - Browser runtime injection (`window._env_`)
 * - Node.js (`process.env`)
 */
function getEnvVar(name: string): string | undefined {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[name]) {
    return (import.meta as any).env[name];
  }

  if (typeof window !== 'undefined' && (window as any)._env_ && (window as any)._env_[name]) {
    return (window as any)._env_[name];
  }

  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }

  return undefined;
}

// Retrieve environment variables safely
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Validate environment variables before creating client
if (!supabaseUrl?.trim()) {
  throw new Error(
    '❌ VITE_SUPABASE_URL is not set. ' +
    'Add it to your .env.local file or environment variables. ' +
    'Example: VITE_SUPABASE_URL=https://your-project.supabase.co'
  );
}

if (!supabaseKey?.trim()) {
  throw new Error(
    '❌ VITE_SUPABASE_ANON_KEY is not set. ' +
    'Add it to your .env.local file or environment variables. ' +
    'Example: VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());