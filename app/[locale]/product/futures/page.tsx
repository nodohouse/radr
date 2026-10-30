import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FuturesChapter } from "@/components/marketing/pages/FuturesChapter";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "RADR Futures — Compare paths before you act",
    description:
      "D-1911 Wait 12 minutes: compare Wait · Seat now · Throttle delivery with expected contribution before you commit.",
    alternates: buildAlternatesForLocale(locale, "/product/futures"),
  };
}

export default async function FuturesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FuturesChapter />;
}
