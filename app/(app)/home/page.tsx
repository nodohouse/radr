import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { getPrimaryOrganizationForUser, requireSession } from "@/lib/authz";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";

export default async function ControlPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const session = await requireSession();
  const membership = await getPrimaryOrganizationForUser(session.user.id);
  if (!membership) redirect("/onboarding");

  const params = await searchParams;
  const showWelcome = params.welcome === "1";

  const [docCount] = await db
    .select({ value: count() })
    .from(documents)
    .where(eq(documents.organizationId, membership.organization.id));

  const hasEvidence = (docCount?.value ?? 0) > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Control"
        title={showWelcome ? "Welcome to RADR." : "What needs attention"}
        description={
          showWelcome
            ? "Let's check something real."
            : "RADR surfaces exceptions. You decide."
        }
      />

      <EmptyState
        title="All clear."
        body={
          hasEvidence
            ? "RADR has nothing for you to review. Checking is still being built — when exceptions appear, they will show here."
            : "Nothing to review yet. Give RADR an invoice, credit, contract, statement, or payout file."
        }
        action={
          <Link href="/sources" className="prep-btn prep-btn-primary">
            Add evidence
          </Link>
        }
      />

      {hasEvidence ? (
        <p className="text-sm text-[var(--ink-muted)]">
          <Link href="/documents" className="font-semibold text-[var(--ink)] underline underline-offset-2">
            View evidence
          </Link>
          {" · "}
          <Link href="/cases" className="font-semibold text-[var(--ink)] underline underline-offset-2">
            Cases
          </Link>
        </p>
      ) : null}
    </div>
  );
}
