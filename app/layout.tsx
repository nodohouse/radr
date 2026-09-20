import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { locales, type AppLocale } from "@/i18n/routing";
import "./globals.css";
import "./radr.css";
import "./motion.css";

const display = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Root layout owns <html>/<body> for every route.
 * Do not call next-intl getLocale() here - it can resolve the first path
 * segment as a locale and make /app match [locale]=app.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const preferred = jar.get("radr_locale")?.value;
  const locale: AppLocale =
    preferred && (locales as readonly string[]).includes(preferred)
      ? (preferred as AppLocale)
      : "en";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
