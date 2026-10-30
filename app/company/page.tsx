import type { Metadata } from "next";
import { CompanyPage } from "@/components/marketing/pages/CompanyPage";

export const metadata: Metadata = {
  title: "Company. A more intelligent, more human hospitality industry",
  description:
    "RADR exists to give hospitality operators the clarity to make better decisions and create better experiences for guests and teams.",
};

export default function CompanyRoute() {
  return <CompanyPage />;
}
