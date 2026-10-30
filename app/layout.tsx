import type { CSSProperties, ReactNode } from "react";
import { cookies } from "next/headers";
import { IBM_Plex_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { locales, type AppLocale } from "@/i18n/routing";
import "./globals.css";
import "./radr.css";
import "./motion.css";

/**
 * Product typography is Geist Sans only.
 * Hierarchy via size / weight / tracking / contrast — never serif.
 * --font-editorial aliases to Geist for legacy selectors.
 */
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
        className={`${GeistSans.variable} ${mono.variable} ${GeistSans.className}`}
        suppressHydrationWarning
        style={
          {
            "--font-body": "var(--font-geist-sans)",
            "--font-display": "var(--font-geist-sans)",
            "--font-editorial": "var(--font-geist-sans)",
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
