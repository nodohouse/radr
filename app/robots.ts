import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/home", "/documents", "/cases", "/controls", "/sources", "/money", "/scan", "/onboarding", "/api/", "/dev"],
    },
    sitemap: "https://radrup.com/sitemap.xml",
  };
}
