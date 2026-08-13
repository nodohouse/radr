import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { UploadPanel } from "@/components/UploadPanel";
import { PageHeader } from "@/components/app/PageHeader";
import { getPrimaryOrganizationForUser, requireSession } from "@/lib/authz";
import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";

const building = [
  { name: "Email forwarding", note: "Forward invoices and credits" },
  { name: "Accounting", note: "Invoices, credits, payments" },
  { name: "Ordering / POS", note: "What was expected" },
  { name: "Delivery platforms", note: "Payout statements" },
  { name: "Bank", note: "Read-only settlement" },
] as const;

export default async function SourcesPage() {
  const session = await requireSession();
  const membership = await getPrimaryOrganizationForUser(session.user.id);
  if (!membership) redirect("/onboarding");

  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.organizationId, membership.organization.id))
    .limit(1);

  return (
    <div className="mx-auto w-full max-w-lg space-y-10">
      <PageHeader
        eyebrow="Sources"
        title="What RADR can currently check"
        description="Start with a file. Connect systems when they’re ready — we don’t fake connections."
      />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          Working
        </h2>
        <div className="prep-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Upload file</p>
              <p className="text-sm text-[var(--ink-muted)]">
                PDF, JPG, PNG
              </p>
            </div>
            <span className="prep-status-live">Live</span>
          </div>
          <UploadPanel
            organizationId={membership.organization.id}
            locationId={location?.id ?? null}
          />
        </div>
        <p className="text-sm text-[var(--ink-muted)]">
          <Link
            href="/documents"
            className="font-semibold text-[var(--ink)] underline underline-offset-2"
          >
            View evidence library
          </Link>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          Building
        </h2>
        <ul className="prep-source-list">
          {building.map((item) => (
            <li key={item.name}>
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-[var(--ink-muted)]">{item.note}</p>
              </div>
              <span className="prep-status-building">Building</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="prep-card space-y-3 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          Coverage
        </h2>
        <p className="text-lg font-semibold tracking-tight">Basic</p>
        <p className="text-sm text-[var(--ink-muted)]">
          RADR can currently receive uploaded documents. Orders, payments,
          payouts, and bank data are not connected yet. The more RADR can see,
          the more RADR can check.
        </p>
      </section>
    </div>
  );
}
