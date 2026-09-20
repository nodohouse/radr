import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ValueChapter } from "@/components/marketing/pages/ValueChapter";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Verified Value — RADR",
    description: "Can you trust the ROI? Claim only what you can prove.",
    alternates: buildAlternatesForLocale(locale, "/product/value"),
  };
}

export default async function ValuePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ValueChapter />;
}
