// Configuration for API URLs based on environment
export const getApiUrl = (): string => {
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

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

/**
 * Helper function to create authenticated fetch headers with JWT token
 * @param token JWT token from Supabase session
 * @returns Headers object with Authorization bearer token
 */
export function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}