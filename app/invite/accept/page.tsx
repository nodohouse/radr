"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LightAuthShell } from "@/components/LightAuthShell";
import { Link } from "@/i18n/navigation";

function AcceptInviteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onAccept(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("Missing invitation token.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await fetch("/api/invitations", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json()) as { error?: string; next?: string };
    if (!res.ok) {
      setPending(false);
      if (res.status === 401) {
        router.replace(
          `/login?next=${encodeURIComponent(`/invite/accept?token=${token}`)}`,
        );
        return;
      }
      setError(data.error ?? "Could not accept invitation.");
      return;
    }
    router.push(data.next ?? "/app");
    router.refresh();
  }

  return (
    <LightAuthShell
      title="Join your operation"
      subtitle="Accept the invitation to enter RADR."
    >
      <form onSubmit={onAccept} className="ob-auth-form">
        {error ? <p className="ob-auth-error">{error}</p> : null}
        <button
          type="submit"
          className="ob-btn ob-btn-primary"
          disabled={pending || !token}
        >
          {pending ? "Joining…" : "Accept invitation"}
        </button>
        <p className="ob-meta" style={{ marginTop: "1rem" }}>
          Wrong account?{" "}
          <Link href="/login">Sign in with the invited email</Link>
        </p>
      </form>
    </LightAuthShell>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<LightAuthShell title="Join your operation"><p className="ob-meta">Loading…</p></LightAuthShell>}>
      <AcceptInviteInner />
    </Suspense>
  );
}
