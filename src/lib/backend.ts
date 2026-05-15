/** Resolve the Python FastAPI base URL for server-side proxying on Vercel. */
export function getPythonApiBase(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://127.0.0.1:8000";
}

/** Full URL for a FastAPI route (api/index.py is mounted at /api/index on Vercel). */
export function getPythonApiUrl(path: string): string {
  const base = getPythonApiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_BACKEND_URL) {
    return `${base}/api/index${normalized}`;
  }

  return `${base}${normalized}`;
}
