import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ControlCenterChapter } from "@/components/marketing/pages/ControlCenterChapter";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Control Center — RADR",
    description:
      "The most important thing RADR removes is noise. Only what needs you.",
    alternates: buildAlternatesForLocale(locale, "/product/control-center"),
  };
}

export default async function ControlCenterChapterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ControlCenterChapter />;
}
