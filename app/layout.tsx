import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "./radr.css";
import "@/components/marketing/professional.css";
import "@/components/marketing/vibrant.css";
import "@/components/marketing/editorial.css";
import "@/components/marketing/premium.css";
import "@/components/marketing/energy.css";
import { SiteExperience } from "@/components/marketing/SiteExperience";

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://radrup.com"),
  title: {
    default: "RADR. Hospitality Operating Intelligence",
    template: "%s · RADR",
  },
  description:
    "Turn hospitality data into better decisions across restaurants, hotels and multi-site groups.",
  applicationName: "RADR",
  authors: [{ name: "RADR" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://radrup.com",
    siteName: "RADR",
    title: "RADR. Hospitality Operating Intelligence",
    description:
      "Hospitality operating intelligence. Connect signals, create decisions and verify outcomes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RADR. Hospitality Operating Intelligence",
    description:
      "Hospitality operating intelligence. Connect signals, create decisions and verify outcomes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101223",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={display.variable}>
        <SiteExperience />
        {children}
      </body>
    </html>
  );
}
