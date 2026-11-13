import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { parseBasketSelection } from "@/lib/marketing/checkoutPreview";

export const metadata: Metadata = {
  title: "RADR",
  description:
    "Review your RADR plan, billing schedule and company details in the checkout preview.",
  robots: { index: false, follow: false },
};
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    plan?: string;
    billing?: string;
    locations?: string;
    vertical?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  if (query.plan === "enterprise")
    redirect(`/${locale}/contact?plan=enterprise`);
  return (
    <CheckoutPreview
      key={`${query.plan || "empty"}-${query.billing || "annual"}-${query.locations || "default"}-${query.vertical || ""}`}
      initialSelection={parseBasketSelection(query)}
      invalidSelection={Boolean(query.plan) && !parseBasketSelection(query)}
    />
  );
}
