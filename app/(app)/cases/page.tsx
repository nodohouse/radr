import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { getPrimaryOrganizationForUser, requireSession } from "@/lib/authz";

export default async function CasesPage() {
  const session = await requireSession();
  const membership = await getPrimaryOrganizationForUser(session.user.id);
  if (!membership) redirect("/onboarding");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cases"
        title="Cases"
        description="Exceptions between expected and actual — review, decide, resolve."
      />

      <EmptyState
        title="No cases yet."
        body="When RADR finds something that needs your attention, it will appear here. No fake cases."
        action={
          <Link href="/sources" className="prep-btn prep-btn-primary">
            Add evidence
          </Link>
        }
      />
    </div>
  );
}
