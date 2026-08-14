import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "./radr.css";

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://radrup.com"),
  title: {
    default: "RADR — Continuous Margin Intelligence",
    template: "%s · RADR",
  },
  description:
    "RADR continuously finds money you're losing, missing or leaving behind. Built first for hospitality — designed for complex operations.",
  applicationName: "RADR",
  authors: [{ name: "RADR" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://radrup.com",
    siteName: "RADR",
    title: "RADR — Continuous Margin Intelligence",
    description:
      "RADR continuously finds money you're losing, missing or leaving behind. Built first for hospitality.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RADR — Continuous Margin Intelligence",
    description:
      "RADR continuously finds money you're losing, missing or leaving behind. Built first for hospitality.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070807",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
