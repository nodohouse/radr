import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PlatformPage } from "@/components/marketing/pages/PlatformPage";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "RADR",
    description:
      "Explore RADR’s hospitality decision layer. Review source evidence, compare responses and follow expected, observed and verified outcomes.",
    alternates: buildAlternatesForLocale(locale, "/product"),
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlatformPage />;
}
