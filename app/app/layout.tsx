import type { Metadata } from "next";
import { Manrope } from "next/font/google";
const productFont = Manrope({ subsets: ["latin"], variable: "--font-product", display: "swap" });
import { ProductShell } from "@/components/product/ProductShell";
import "@/app/product.css";
import "@/app/radr-product-tokens.css";
import "@/app/radr.css";
import "@/app/app-shell.css";
import "@/app/intelligence-app.css";
import "@/app/cockpit.css";
import "@/app/cinema-product.css";
import "@/app/ask-radr.css";
import "@/app/product-density.css";
import "@/app/product-art.css";
import "@/app/product-command.css";
import "@/app/dashboard-modules.css";
import "@/app/radr-visual-system-3.css";
import "@/components/product/control-center/control-center-4.css";
import "@/app/visual-polish.css";
import "@/app/visibility-release.css";
import "@/app/visual-recomposition.css";
import "@/app/control-center-northstar.css";
import "@/app/visual-system-reboot.css";
import "@/app/product-design-system.css";
import "@/app/instrument-shell.css";
import "@/app/instrument-pages.css";
import "@/app/radr-vision.css";
import "@/components/product/control-center/control-center-instrument.css";
import "@/app/radr-daylight.css";
import "@/app/product-premium.css";
import "@/app/control-center-tablet.css";
import "@/app/backend-reference.css";
import "@/app/reference-workspace.css";
import "@/app/surface-polish.css";
import "@/app/utility-polish.css";
import "@/app/radr-app-system.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RADR · Control Center",
  description: "Verified Decision Intelligence for hospitality.",
  robots: { index: false, follow: false },
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={productFont.variable}><ProductShell>{children}</ProductShell></div>;
}
