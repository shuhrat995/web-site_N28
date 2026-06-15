const DEFAULT_API_ORIGIN = 'http://localhost:3001';

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, '');
}

export const API_ORIGIN = normalizeOrigin(
  (import.meta.env.VITE_API_ORIGIN as string | undefined) ||
  (import.meta.env.VITE_API_URL as string | undefined) ||
  DEFAULT_API_ORIGIN
);

export const API_BASE_URL = `${API_ORIGIN}/api`;
