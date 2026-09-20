import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LightAuthShell } from "@/components/LightAuthShell";
import { LoginForm } from "@/components/LoginForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("loginTitle"),
    description: t("metaLoginDescription"),
  };
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <LightAuthShell title={t("loginHeading")}>
      <Suspense fallback={<p className="ob-meta">{t("loading")}</p>}>
        <LoginForm />
      </Suspense>
    </LightAuthShell>
  );
}
