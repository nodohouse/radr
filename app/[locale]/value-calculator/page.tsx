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
      "Guided diagnosis of where value may be leaking across your hospitality operation — modeled ranges, evidence readiness, not guaranteed savings.",
    alternates: buildAlternatesForLocale(locale, "/value-calculator"),
  };
}

export default async function ValueCalculatorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ValueCalculatorApp />;
}
