import type { Metadata } from "next";
import type { ReactNode } from "react";
import { appPageTitle } from "@/lib/radr/product/pageIdentity";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: appPageTitle(`/app/decisions/${id}`) };
}
export default function DecisionLayout({ children }: { children: ReactNode }) { return children; }
