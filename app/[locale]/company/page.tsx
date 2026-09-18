import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CompanyPage } from "@/components/marketing/pages/CompanyPage";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/company"),
  };
}

export default async function CompanyRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CompanyPage />;
}
