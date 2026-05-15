/** Python FastAPI is deployed at /api/py (api/py/index.py) to avoid clashing with Next /api/*. */

export function getPythonApiBase(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://127.0.0.1:8000";
}

/** Full URL for a FastAPI route on Vercel (mounted under /api/py). */
export function getPythonApiUrl(path: string): string {
  const base = getPythonApiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_BACKEND_URL) {
    return `${base}/_/backend${normalized}`;
  }

  return `${base}${normalized}`;
}

/** Browser-facing backend URL (uses Vercel rewrite to Python). */
export function getPublicBackendApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `/_/backend${normalized}`;
  }
  return getPythonApiUrl(path);
}
