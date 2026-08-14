import type { Metadata } from "next";
import { CompanyPage } from "@/components/marketing/pages/CompanyPage";

export const metadata: Metadata = {
  title: "Company — Why RADR exists",
  description:
    "The problem is bigger than one industry. RADR watches the difference between systems — built first for hospitality.",
};

export default function CompanyRoute() {
  return <CompanyPage />;
}
