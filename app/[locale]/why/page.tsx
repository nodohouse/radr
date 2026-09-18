import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { WhyPage } from "@/components/marketing/pages/WhyPage";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Why RADR — The Decision Gap in Hospitality",
    description:
      "The gap between what your systems know and what your operation decides. RADR is the adaptive decision system for hospitality.",
    alternates: buildAlternatesForLocale(locale, "/why"),
  };
}

export default async function WhyRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WhyPage />;
}
