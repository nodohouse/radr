import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type AppLocale } from "./routing";

const namespaces = [
  "common",
  "navigation",
  "homepage",
  "product",
  "solutions",
  "industries",
  "how",
  "pricing",
  "company",
  "developers",
  "auth",
  "onboarding",
  "legal",
  "errors",
  "meta",
  "blog",
  "glossary",
] as const;

async function loadMessages(locale: AppLocale) {
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      try {
        const mod = await import(`../locales/${locale}/${ns}.json`);
        return [ns, mod.default] as const;
      } catch {
        const fallback = await import(`../locales/en/${ns}.json`);
        return [ns, fallback.default] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale as AppLocale),
  };
});
