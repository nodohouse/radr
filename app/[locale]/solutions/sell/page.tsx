import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SolutionsPage } from "@/components/marketing/pages/SolutionsPage";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solutions" });
  return {
    title: `${t("sell.title")} · Intelligence — RADR`,
    description: t("sell.lead"),
    alternates: buildAlternatesForLocale(locale, "/solutions/sell"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SolutionsPage lens="sell" />;
}
