import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LightAuthShell } from "@/components/LightAuthShell";
import { SignupForm } from "@/components/SignupForm";
import { getPendingInvitationByToken } from "@/lib/identity/invitations";
import { safeDemoNext } from "@/lib/marketing/demoAccess";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invite?: string; intent?: string; next?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("signupTitle"),
    description: t("metaSignupDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function SignupPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { invite, intent, next } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  const token = invite?.trim() ?? "";
  if (token) {
    const invitation = await getPendingInvitationByToken(token);
    if (invitation) {
      return (
        <LightAuthShell title={t("invitedHeading")} subtitle={t("invitedSubtitle")}>
          <SignupForm
            inviteToken={token}
            inviteEmail={invitation.email}
            nextPath="/app"
          />
        </LightAuthShell>
      );
    }
  }

  const isDemo = intent === "demo" || !token;
  const dest = safeDemoNext(next, "/app/enter");

  return (
    <LightAuthShell
      title={isDemo ? t("demoSignupHeading") : t("signupHeading")}
      subtitle={isDemo ? t("demoSignupSubtitle") : t("signupSubtitle")}
    >
      <SignupForm nextPath={dest} intent={isDemo ? "demo" : undefined} />
    </LightAuthShell>
  );
}
