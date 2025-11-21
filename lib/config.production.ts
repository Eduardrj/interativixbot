export const CONFIG = {
  APP_NAME: 'Interativix Bot',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE,
  
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // Gemini AI
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Feature Flags
  FEATURES: {
    ANALYTICS: true,
    INTEGRATIONS: true,
    NOTIFICATIONS: false, // Sprint 9B
    ADVANCED_CHARTS: false, // Sprint 9A
  },
  
  // Production URLs
  PRODUCTION_URL: 'https://interativixbot.vercel.app',
  
  // App Metadata
  META: {
    title: 'Interativix Bot - Sistema de Gestão',
    description: 'Plataforma completa de gestão com agendamentos, CRM, financeiro e analytics',
    keywords: 'gestão, agendamentos, crm, financeiro, analytics, multi-tenant',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

if (CONFIG.ENVIRONMENT === 'production') {
  const missing = requiredEnvVars.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('Please configure them in Vercel Dashboard → Settings → Environment Variables');
  }
}

export default CONFIG;
