import type { Metadata } from "next";
import { HowPage } from "@/components/marketing/pages/HowPage";

export const metadata: Metadata = {
  title: "Platform — One operating picture",
  description:
    "Connect evidence, understand the difference, and keep the whole decision lifecycle in view. Explore the RADR platform.",
};

export default function HowRoute() {
  return <HowPage />;
}
