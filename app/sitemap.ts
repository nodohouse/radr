import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { BLOG_POSTS } from "@/lib/marketing/blog";

const BASE = "https://radrup.com";

/** Public marketing/legal/auth-adjacent surfaces only. No /app, /home, onboarding, admin. */
const PATHS = [
  "/",
  "/blog",
  "/resources/hospitality-decision-playbook",
  ...BLOG_POSTS.filter((p) => !p.noindex).map((p) => `/blog/${p.slug}`),
  "/glossary",
  "/solutions",
  "/solutions/recover",
  "/solutions/buy",
  "/solutions/labor",
  "/solutions/sell",
  "/industries",
  "/pricing",
  "/product",
  "/product/control-center",
  "/product/findings",
  "/product/ask",
  "/product/actions",
  "/product/value",
  "/product/forecast",
  "/product/connections",
  "/product/operating-model",
  "/why",
  "/approach",
  "/company",
  "/customers",
  "/security",
  "/contact",
  "/developers",
  "/developers/api",
  "/developers/webhooks",
  "/developers/connectors",
  "/developers/quickstart",
  "/privacy",
  "/cookies",
  "/terms",
  "/imprint",
  "/demo",
  "/value-calculator",
  "/value-calculator/methodology",
  "/product/futures",
  "/product/memory",
  "/radr-explained",
] as const;

function localizedUrl(locale: string, path: string): string {
  const suffix = path === "/" ? "" : path;
  return `${BASE}/${locale}${suffix}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) => {
    const englishOnly =
      path === "/radr-explained" ||
      path === "/resources/hospitality-decision-playbook" ||
      BLOG_POSTS.some((post) => post.content && path === `/blog/${post.slug}`);
    const pageLocales = englishOnly ? ["en"] : routing.locales;
    const languages: Record<string, string> = {
      "x-default": localizedUrl(routing.defaultLocale, path),
    };
    for (const locale of pageLocales) {
      languages[locale] = localizedUrl(locale, path);
    }

    const isBlog = path === "/blog" || path.startsWith("/blog/");
    const post = BLOG_POSTS.find((post) => path === `/blog/${post.slug}`);

    return pageLocales.map((locale) => ({
      url: localizedUrl(locale, path),
      ...(post ? { lastModified: post.updated ?? post.date } : {}),
      changeFrequency:
        path === "/" || isBlog ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : isBlog ? 0.8 : 0.7,
      alternates: { languages },
    }));
  });
}
