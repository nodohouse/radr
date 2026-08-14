import type { Metadata } from "next";
import { HowPage } from "@/components/marketing/pages/HowPage";

export const metadata: Metadata = {
  title: "How RADR works — From signal to verified value",
  description:
    "Follow one finding through Detect, Explain, Act, Learn and Verify — from △ €3.60 / case to €18,620 verified value.",
};

export default function HowRoute() {
  return <HowPage />;
}
