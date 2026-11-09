import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LightAuthShell } from "@/components/LightAuthShell";
import { SignupForm } from "@/components/SignupForm";
import { RegistrationPreviewForm } from "@/components/RegistrationPreviewForm";
import { publicPlan } from "@/lib/marketing/conversionJourney";
import { getPendingInvitationByToken } from "@/lib/identity/invitations";
import { safeDemoNext } from "@/lib/marketing/demoAccess";
import { accountStorageReady } from "@/lib/identity/accountAvailability";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    invite?: string;
    intent?: string;
    next?: string;
    plan?: string;
  }>;
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
  const { invite, intent, next, plan: requestedPlan } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  const token = invite?.trim() ?? "";
  if (token && accountStorageReady()) {
    const invitation = await getPendingInvitationByToken(token);
    if (invitation) {
      return (
        <LightAuthShell
          title={t("invitedHeading")}
          subtitle={t("invitedSubtitle")}
        >
          <SignupForm
            available={accountStorageReady()}
            inviteToken={token}
            inviteEmail={invitation.email}
            nextPath="/app"
          />
        </LightAuthShell>
      );
    }
  }

  const isDemo = intent !== "workspace";
  const dest = safeDemoNext(next, isDemo ? "/app/enter" : "/onboarding");
  const requestedWorld = new URL(dest, "https://radr.invalid").searchParams.get(
    "vertical",
  );
  const vertical =
    requestedWorld === "hotel" || requestedWorld === "restaurant"
      ? requestedWorld
      : null;

  return (
    <LightAuthShell
      showPaths={false}
      title={isDemo ? t("demoSignupHeading") : t("signupHeading")}
      subtitle={isDemo ? t("demoSignupSubtitle") : t("signupSubtitle")}
    >
      <RegistrationPreviewForm
        key={`${vertical || "choose"}-${intent || "demo"}`}
        vertical={vertical}
        purpose={isDemo ? "demo" : "workspace"}
        plan={publicPlan(requestedPlan)}
      />
    </LightAuthShell>
  );
}
