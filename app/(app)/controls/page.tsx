import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { getPrimaryOrganizationForUser, requireSession } from "@/lib/authz";

/**
 * CONTROLS = rules RADR keeps checking.
 * Empty until cases can create real controls.
 */
export default async function ControlsPage() {
  const session = await requireSession();
  const membership = await getPrimaryOrganizationForUser(session.user.id);
  if (!membership) redirect("/onboarding");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Controls"
        title="Rules RADR keeps checking"
        description="Confirmed problems can become permanent rules — so the same leak doesn’t repeat."
      />

      <EmptyState
        title="No controls yet."
        body="When you confirm a problem, RADR can turn it into a rule to watch next time. Controls appear here after that workflow ships."
        action={
          <Link href="/cases" className="prep-btn prep-btn-primary">
            View cases
          </Link>
        }
      />
    </div>
  );
}
