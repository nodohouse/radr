import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { SignOutButton } from "@/components/SignOutButton";
import { getPrimaryOrganizationForUser, requireSession } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const membership = await getPrimaryOrganizationForUser(session.user.id);

  if (!membership) {
    redirect("/onboarding");
  }

  return (
    <div className="prep-app">
      <AppNav />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3 sm:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {membership.organization.name}
            </p>
            <p className="truncate text-xs text-[var(--ink-muted)]">
              {session.user.email}
            </p>
          </div>
          <SignOutButton />
        </header>
        <div className="prep-main">{children}</div>
      </div>
    </div>
  );
}
