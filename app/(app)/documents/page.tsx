import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { getPrimaryOrganizationForUser, requireSession } from "@/lib/authz";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { formatShortDate, formatStatus } from "@/lib/format";

export default async function DocumentsPage() {
  const session = await requireSession();
  const membership = await getPrimaryOrganizationForUser(session.user.id);
  if (!membership) redirect("/onboarding");

  const docs = await db
    .select({
      id: documents.id,
      originalFilename: documents.originalFilename,
      documentType: documents.documentType,
      status: documents.status,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.organizationId, membership.organization.id))
    .orderBy(desc(documents.createdAt));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Evidence"
        title="Evidence library"
        description="Files RADR can use as evidence. Documents are not the product."
        actions={
          <Link href="/sources" className="prep-btn prep-btn-primary text-sm">
            Add evidence
          </Link>
        }
      />

      {docs.length === 0 ? (
        <EmptyState
          title="Nothing to check yet."
          body="Give RADR an invoice, credit, contract, statement, or payout file."
          action={
            <Link href="/sources" className="prep-btn prep-btn-primary">
              Add evidence
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="prep-card block px-4 py-3 hover:bg-[var(--accent-soft)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate font-medium">{doc.originalFilename}</p>
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                    {formatStatus(doc.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {formatStatus(doc.documentType)} ·{" "}
                  {formatShortDate(doc.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
