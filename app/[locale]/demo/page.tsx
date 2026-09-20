import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SeeHowDemo } from "@/components/marketing/pages/SeeHowDemo";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "See how RADR decides — Interactive demo",
    description:
      "Hotel, restaurant, and aparthotel Decisions — system evidence, constraints, futures. No login.",
    alternates: buildAlternatesForLocale(locale, "/demo"),
  };
}

export default async function DemoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SeeHowDemo />;
}
