import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { RadrGateway } from "@/components/product/enter/RadrGateway";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "RADR",
    description:
      "Choose the RADR hotel or restaurant demo. Explore fictional hospitality operations, decisions and evidence without a login.",
    alternates: buildAlternatesForLocale(locale, "/demo"),
  };
}

export default async function DemoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RadrGateway preselect={null} autoEnter={false} />;
}
