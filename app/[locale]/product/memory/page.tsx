import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MemoryCalibrationChapter } from "@/components/marketing/pages/MemoryCalibrationChapter";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Operating Memory — RADR",
    description:
      "Your best managers learn. RADR makes sure the operation does too.",
    alternates: buildAlternatesForLocale(locale, "/product/memory"),
  };
}

export default async function MemoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MemoryCalibrationChapter />;
}
