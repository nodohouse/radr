import { redirect } from "next/navigation";
import { OnboardingFunnel } from "@/components/onboarding/OnboardingFunnel";
import { getWorkspaceForUser } from "@/lib/onboarding";
import { requireSession } from "@/lib/authz";
import "./onboarding.css";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await requireSession();
  const workspace = await getWorkspaceForUser(session.user.id);

  if (workspace?.onboarding.step === "done") {
    redirect("/app?welcome=1");
  }
  if (workspace?.onboarding.step === "connect") {
    redirect("/onboarding/connect");
  }

  return (
    <OnboardingFunnel
      userName={session.user.name}
      workspace={
        workspace
          ? {
              organizationId: workspace.organizationId,
              name: workspace.name,
              onboarding: workspace.onboarding,
              primaryLocation: workspace.primaryLocation,
            }
          : null
      }
    />
  );
}
