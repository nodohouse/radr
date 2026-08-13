import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";
import { SignOutButton } from "@/components/SignOutButton";
import { RadrLogo } from "@/components/marketing/RadrLogo";
import { getPrimaryOrganizationForUser, requireSession } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await requireSession();
  const existing = await getPrimaryOrganizationForUser(session.user.id);
  if (existing) {
    redirect("/home");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-5 py-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <RadrLogo size="lg" as="p" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Quick setup
          </h1>
          <p className="mt-2 text-[var(--ink-muted)]">
            Four fields. Then give RADR something to check.
          </p>
        </div>
        <SignOutButton />
      </div>
      <div className="prep-card p-5 sm:p-6">
        <OnboardingForm />
      </div>
    </main>
  );
}
