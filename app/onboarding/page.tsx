import { redirect } from "next/navigation";
import { FirstValueFunnel } from "@/components/onboarding/FirstValueFunnel";
import { OnboardingFunnel } from "@/components/onboarding/OnboardingFunnel";
import { getWorkspaceForUser } from "@/lib/onboarding";
import { isFirstValuePath } from "@/lib/onboarding/types";
import { requireSession } from "@/lib/authz";
import "./onboarding.css";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ legacy?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const session = await requireSession();
  const workspace = await getWorkspaceForUser(session.user.id);
  const { legacy } = await searchParams;
  const useLegacy = legacy === "1" || legacy === "true";

  if (workspace?.onboarding.step === "done") {
    redirect("/app?welcome=1");
  }
  if (workspace?.onboarding.step === "connect") {
    redirect("/onboarding/connect");
  }

  const snapshot = workspace
    ? {
        organizationId: workspace.organizationId,
        name: workspace.name,
        onboarding: workspace.onboarding,
        primaryLocation: workspace.primaryLocation,
      }
    : null;

  if (
    useLegacy ||
    (workspace && !isFirstValuePath(workspace.onboarding))
  ) {
    return (
      <OnboardingFunnel
        userName={session.user.name}
        workspace={snapshot}
      />
    );
  }

  return (
    <FirstValueFunnel
      userName={session.user.name}
      userEmail={session.user.email}
      workspace={snapshot}
    />
  );
}
