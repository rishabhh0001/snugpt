import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://snugpt.rishabhj.in";

  const routes = ["", "/about", "/chat", "/privacy-policy", "/license"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: (route === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: route === "" ? 1.0 : route === "/chat" ? 0.9 : 0.7,
  }));

  return routes;
}
