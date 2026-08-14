import type { Metadata } from "next";
import { SolutionsPage } from "@/components/marketing/pages/SolutionsPage";

export const metadata: Metadata = {
  title: "RADR Solutions — Buy, Labor, Sell, Recover",
  description:
    "RADR watches spend, labor, revenue and recovery — and surfaces the differences worth acting on.",
};

export default function SolutionsRoute() {
  return <SolutionsPage />;
}
