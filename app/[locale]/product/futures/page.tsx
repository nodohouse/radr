import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FuturesChapter } from "@/components/marketing/pages/FuturesChapter";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "RADR Futures — Play the Operation Forward",
    description:
      "Don’t guess the next move. Play viable responses forward before value is committed.",
    alternates: buildAlternatesForLocale(locale, "/product/futures"),
  };
}

export default async function FuturesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FuturesChapter />;
}
