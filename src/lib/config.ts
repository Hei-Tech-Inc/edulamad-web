/**
 * Single place for public env-derived config. SSR-safe: no throws on import.
 * Critical production checks can be added where the app boots (e.g. CI / build).
 */

function trimUrl(v: string | undefined): string {
  return (v ?? '').trim().replace(/\/$/, '');
}

const requiredInProd = (key: string, value: string | undefined): string | undefined => {
  if (process.env.NODE_ENV === 'production' && !trimUrl(value)) {
    console.warn(`[config] Missing ${key} in production build — set it in the deployment env.`);
  }
  return value;
};

export const config = {
  apiUrl: trimUrl(process.env.NEXT_PUBLIC_API_URL) || 'http://127.0.0.1:5003',
  appUrl: trimUrl(process.env.NEXT_PUBLIC_APP_URL) || 'http://localhost:3000',
  appName: trimUrl(process.env.NEXT_PUBLIC_APP_NAME) || 'Edulamad',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;

requiredInProd('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL);
