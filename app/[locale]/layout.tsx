import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070807",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../locales/${locale}/meta.json`)).default;
  return {
    metadataBase: new URL("https://radrup.com"),
    title: {
      default: messages.siteTitle,
      template: "%s",
    },
    description: messages.siteDescription,
    applicationName: "RADR",
    authors: [{ name: "RADR" }],
    openGraph: {
      type: "website",
      locale:
        locale === "en"
          ? "en_GB"
          : locale === "de"
            ? "de_DE"
            : locale === "nl"
              ? "nl_NL"
              : locale === "fr"
                ? "fr_FR"
                : "es_ES",
      siteName: "RADR",
      title: messages.siteTitle,
      description: messages.siteDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: messages.siteTitle,
      description: messages.siteDescription,
    },
    robots: { index: true, follow: true },
    alternates: {
      languages: {
        en: "https://radrup.com/en",
        de: "https://radrup.com/de",
        nl: "https://radrup.com/nl",
        fr: "https://radrup.com/fr",
        es: "https://radrup.com/es",
        "x-default": "https://radrup.com/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
