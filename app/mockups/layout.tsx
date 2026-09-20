import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Manrope, Source_Sans_3 } from "next/font/google";
import "@/app/radr.css";
import "./mockups.css";

const display = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const body = Source_Sans_3({
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

export const metadata: Metadata = {
  title: "RADR Mockups",
  description: "Internal 3840×2160 presentation compositions. Not a public product surface.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030504",
};

/**
 * Internal presentation routes - no SiteNav / SiteFooter / product chrome.
 * Does not affect production marketing or app pages.
 */
export default function MockupsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="mk-body">{children}</body>
    </html>
  );
}
