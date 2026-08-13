import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { getPrimaryOrganizationForUser, requireSession } from "@/lib/authz";

/**
 * MONEY answers one question: what verified financial value has RADR created?
 * No fake recovered/prevented numbers until outcomes exist in the data model.
 */
export default async function MoneyPage() {
  const session = await requireSession();
  const membership = await getPrimaryOrganizationForUser(session.user.id);
  if (!membership) redirect("/onboarding");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Money"
        title="Verified value"
        description="What RADR has verified — recovered and prevented."
      />

      <EmptyState
        title="No verified value yet."
        body="When a RADR case results in money being recovered or prevented, it will appear here. We never invent savings."
        action={
          <div className="flex flex-wrap gap-3">
            <Link href="/cases" className="prep-btn prep-btn-primary">
              View cases
            </Link>
            <Link href="/sources" className="prep-btn prep-btn-secondary">
              Add evidence
            </Link>
          </div>
        }
      />
    </div>
  );
}
