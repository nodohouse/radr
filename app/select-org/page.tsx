"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LightAuthShell } from "@/components/LightAuthShell";

type OrgRow = { id: string; name: string; slug: string };

export default function SelectOrgPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orgs");
      if (res.status === 401) {
        router.replace("/login?next=/select-org");
        return;
      }
      const data = (await res.json()) as {
        organizations: OrgRow[];
        destination?: { kind: string; path: string };
      };
      if (data.organizations.length === 0) {
        router.replace("/onboarding");
        return;
      }
      if (data.organizations.length === 1) {
        await fetch("/api/orgs", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ organizationId: data.organizations[0]!.id }),
        });
        router.replace("/app");
        return;
      }
      setOrgs(data.organizations);
    })();
  }, [router]);

  async function select(id: string) {
    setPending(id);
    setError(null);
    const res = await fetch("/api/orgs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationId: id }),
    });
    if (!res.ok) {
      setError("Could not switch organization.");
      setPending(null);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <LightAuthShell
      title="Choose your operation"
      subtitle="You belong to more than one organization."
    >
      {error ? <p className="ob-auth-error">{error}</p> : null}
      <ul className="ob-auth-org-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {orgs.map((org) => (
          <li key={org.id} style={{ marginBottom: "0.75rem" }}>
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              style={{ width: "100%" }}
              disabled={pending !== null}
              onClick={() => void select(org.id)}
            >
              {pending === org.id ? "Entering…" : org.name}
            </button>
          </li>
        ))}
      </ul>
    </LightAuthShell>
  );
}
