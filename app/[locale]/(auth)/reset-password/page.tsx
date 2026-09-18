import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LightAuthShell } from "@/components/LightAuthShell";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("resetTitle"),
    description: t("metaResetDescription"),
  };
}

export default async function ResetPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <LightAuthShell title={t("resetHeading")} subtitle={t("resetSubtitle")}>
      <Suspense fallback={<p className="ob-meta">{t("loading")}</p>}>
        <ResetPasswordForm />
      </Suspense>
    </LightAuthShell>
  );
}
