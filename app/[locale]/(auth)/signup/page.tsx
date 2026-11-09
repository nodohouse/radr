import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LightAuthShell } from "@/components/LightAuthShell";
import { SignupForm } from "@/components/SignupForm";
import { DemoAccessForm } from "@/components/DemoAccessForm";
import { Link } from "@/i18n/navigation";
import { getPendingInvitationByToken } from "@/lib/identity/invitations";
import { safeDemoNext } from "@/lib/marketing/demoAccess";
import { accountStorageReady } from "@/lib/identity/accountAvailability";

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
      <nav className="ob-entry-options" aria-label={t("entryPaths")}>
        <Link
          href={`/signup?intent=demo&next=${encodeURIComponent(isDemo ? dest : "/app/enter")}`}
          aria-current={isDemo ? "page" : undefined}
        >
          <span aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M6 18 18 6M6 6h12v12" />
            </svg>
          </span>
          <strong>{t("demoForm.optionDemo")}</strong>
          <small>{t("demoForm.optionDemoDetail")}</small>
        </Link>
        <Link
          href="/signup?intent=workspace"
          aria-current={!isDemo ? "page" : undefined}
        >
          <span aria-hidden="true">＋</span>
          <strong>{t("demoForm.optionAccount")}</strong>
          <small>{t("demoForm.optionAccountDetail")}</small>
        </Link>
      </nav>
      {isDemo ? (
        <DemoAccessForm key={vertical || "choose"} vertical={vertical} />
      ) : (
        <SignupForm available={accountStorageReady()} nextPath={dest} />
      )}
    </LightAuthShell>
  );
}
