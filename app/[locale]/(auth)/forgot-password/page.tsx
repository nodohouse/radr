import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LightAuthShell } from "@/components/LightAuthShell";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("forgotTitle"),
    description: t("metaForgotDescription"),
  };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <LightAuthShell
      title={t("forgotHeading")}
      subtitle={t("forgotSubtitle")}
    >
      <ForgotPasswordForm />
    </LightAuthShell>
  );
}
