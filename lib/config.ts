// Configuration for API URLs based on environment
export const getApiUrl = (): string => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }

  // In production, use the environment variable or the current domain
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // Fallback to current domain (for Vercel deployment)
  return `${window.location.protocol}//${window.location.host}`;
};

export const API_URL = getApiUrl();

export const endpoints = {
  chat: `${API_URL}/api/chat`,
  appointments: `${API_URL}/api/appointments`,
};

export const corsConfig = {
  origin: 'https://interativixbot.com.br',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Content-Type',
    'Date',
    'X-Api-Version',
    'Authorization',
  ],
};
