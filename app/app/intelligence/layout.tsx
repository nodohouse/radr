import type { Metadata } from "next";
import type { ReactNode } from "react";
import { appPageTitle } from "@/lib/radr/product/pageIdentity";

export const metadata: Metadata = { title: appPageTitle("/app/intelligence") };
export default function RouteLayout({ children }: { children: ReactNode }) { return children; }
