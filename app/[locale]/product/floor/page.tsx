import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FloorPage } from "@/components/marketing/pages/FloorPage";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "RADR Floor — RADR",
    description:
      "The Decision layer reaches the floor — without replacing the POS. Context, recommendation, and service intelligence for FOH.",
    alternates: buildAlternatesForLocale(locale, "/product/floor"),
  };
}

export default async function ProductFloorRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FloorPage />;
}
