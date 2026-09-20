import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PlatformPage } from "@/components/marketing/pages/PlatformPage";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Platform — RADR",
    description:
      "One Decision. From first signal to lasting memory. Systems record what happened — RADR decides what matters and proves what came back.",
    alternates: buildAlternatesForLocale(locale, "/product"),
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlatformPage />;
}
