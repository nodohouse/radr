import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { DecisionsChapter } from "@/components/marketing/pages/DecisionsChapter";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Decisions — RADR",
    description:
      "One decision can change the night — with exposure, futures, and verified outcome.",
    alternates: buildAlternatesForLocale(locale, "/product/decisions"),
  };
}

export default async function DecisionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <DecisionsChapter />
      <SiteFooter />
    </div>
  );
}
