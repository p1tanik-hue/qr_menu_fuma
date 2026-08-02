/** Centralised, validated environment access. */

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    // During `next build` some values may be absent; fail loudly at runtime only.
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.warn(`[env] Missing required variable: ${name}`);
    }
    return fallback ?? '';
  }
  return value;
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  AUTH_SECRET: required(
    'AUTH_SECRET',
    'dev-insecure-secret-change-me-please-32chars',
  ),
  SITE_URL: required('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
  RESTAURANT_NAME: required('NEXT_PUBLIC_RESTAURANT_NAME', 'FUMA LOUNGE'),
  MAX_LOGIN_ATTEMPTS: Number(process.env.MAX_LOGIN_ATTEMPTS ?? 5),
  LOGIN_LOCK_MINUTES: Number(process.env.LOGIN_LOCK_MINUTES ?? 15),
  IS_PROD: process.env.NODE_ENV === 'production',
};
