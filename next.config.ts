import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "snu.edu.in" },
      { protocol: "https", hostname: "**.snu.edu.in" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/chat",
        destination: process.env.NODE_ENV === "development" 
          ? `${backend}/api/chat`
          : "/_/backend/api/chat",
      },
      {
        source: "/api/waitlist",
        destination: process.env.NODE_ENV === "development"
          ? `${backend}/api/waitlist`
          : "/_/backend/api/waitlist",
      },
      {
        source: "/api/health",
        destination: process.env.NODE_ENV === "development"
          ? `${backend}/api/health`
          : "/_/backend/api/health",
      },
      {
        source: "/_/backend/:path*",
        destination: "/api/py/index.py",
      },
    ];
  },
};

export default nextConfig;
