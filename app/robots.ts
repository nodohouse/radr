import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

/** Public content is available to search and AI crawlers; private routes stay excluded. */
export default function robots(): MetadataRoute.Robots {
  const paths = [
    "app",
    "home",
    "documents",
    "cases",
    "controls",
    "sources",
    "money",
    "scan",
    "onboarding",
    "login",
    "signup",
    "forgot-password",
    "reset-password",
    "select-org",
    "invite",
    "brand-test",
    "dev",
    "mockups",
  ];
  const privatePaths = [
    "",
    ...routing.locales.map((locale) => `/${locale}`),
  ].flatMap((prefix) =>
    paths.flatMap((path) => [`${prefix}/${path}$`, `${prefix}/${path}/`]),
  );
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...privatePaths, "/api/"] },
    sitemap: "https://radrup.com/sitemap.xml",
  };
}
