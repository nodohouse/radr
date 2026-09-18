import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LightAuthShell } from "@/components/LightAuthShell";
import { SignupForm } from "@/components/SignupForm";
import { redirect } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invite?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("signupTitle"),
    description: t("metaSignupDescription"),
  };
}

export default async function SignupPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { invite } = await searchParams;
  setRequestLocale(locale);

  // Sales-led GTM: public self-serve signup is closed. Invites only.
  if (!invite?.trim()) {
    redirect({ href: "/contact", locale });
  }

  const t = await getTranslations("auth");

  return (
    <LightAuthShell title={t("invitedHeading")} subtitle={t("invitedSubtitle")}>
      <SignupForm />
    </LightAuthShell>
  );
}
