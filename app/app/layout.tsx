import type { Metadata } from "next";
import { ProductShell } from "@/components/product/ProductShell";
import "@/app/product.css";
import "@/app/radr.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RADR · Control Center",
  description: "Margin intelligence: product vision prototype (demo data).",
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProductShell>{children}</ProductShell>;
}
