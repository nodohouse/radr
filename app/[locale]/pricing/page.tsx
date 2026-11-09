import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Pricing2030 } from "@/components/marketing/v2030/Pricing2030";
import { buildAlternatesForLocale } from "@/i18n/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; vertical?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternatesForLocale(locale, "/pricing"),
    openGraph: {
      type: "website",
      images: ["/opengraph-image"],
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `https://radrup.com/${locale}/pricing`,
    },
  };
}

export default async function PricingPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const search = await searchParams;
  return (
    <Pricing2030
      fromDemo={search.from === "demo"}
      vertical={search.vertical === "hotel" ? "hotel" : "restaurant"}
    />
  );
}
