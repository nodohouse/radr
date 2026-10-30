import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Trust2030 } from "@/components/marketing/v2030/Trust2030";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return {
    title: t("securityPage.metaTitle"),
    description: t("securityPage.metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/security"),
  };
}

export default async function SecurityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Trust2030 />;
}
