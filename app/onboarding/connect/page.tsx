import { redirect } from "next/navigation";
import { ConnectOperation } from "@/components/onboarding/ConnectOperation";
import { getWorkspaceForUser } from "@/lib/onboarding";
import { requireSession } from "@/lib/authz";
import "../onboarding.css";

export const dynamic = "force-dynamic";

export default async function ConnectPage() {
  const session = await requireSession();
  const workspace = await getWorkspaceForUser(session.user.id);
  if (!workspace) redirect("/onboarding");

  return (
    <ConnectOperation
      orgName={workspace.name}
      locationName={workspace.primaryLocation?.name ?? "First location"}
    />
  );
}
