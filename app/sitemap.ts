import type { MetadataRoute } from "next";

const BASE = "https://radrup.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/how",
    "/solutions",
    "/pricing",
    "/company",
    "/security",
    "/contact",
    "/privacy",
    "/terms",
    "/imprint",
  ];

  return paths.map((path) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
