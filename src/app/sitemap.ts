import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://snugpt.rishabhj.in";

  const routes = [
    "",
    "/about",
    "/profile",
    "/chat",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/license",
    "/updates",
    "/changelog",
    "/demo"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: (route === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: route === "" ? 1.0 : route === "/chat" || route === "/contact" ? 0.9 : 0.7,
  }));

  return routes;
}
