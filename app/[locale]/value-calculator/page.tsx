import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ValueCalculatorApp } from "@/components/marketing/value-calculator/ValueCalculatorApp";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "RADR Value Map | Hospitality Operating Value Calculator",
    description:
      "Explore modeled hospitality exposure with exact or range inputs, transparent assumptions, capture scenarios, evidence checks and an optional budget. No guaranteed savings.",
    alternates: buildAlternatesForLocale(locale, "/value-calculator"),
  };
}

export default async function ValueCalculatorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ValueCalculatorApp />;
}
