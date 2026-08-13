"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    });
    setPending(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? "Delete failed");
      return;
    }

    router.push("/documents");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className="prep-btn prep-btn-ghost text-sm"
        onClick={() => setConfirming(true)}
      >
        Delete document
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--danger)]/30 bg-[#fff7f7] p-4">
      <p className="text-sm font-semibold text-[var(--danger)]">
        Delete this document permanently?
      </p>
      <p className="text-sm text-[var(--ink-muted)]">
        The file will be removed from private storage. This cannot be undone.
      </p>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="prep-btn prep-btn-primary text-sm"
          style={{ background: "var(--danger)" }}
          disabled={pending}
          onClick={() => void onDelete()}
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          className="prep-btn prep-btn-ghost text-sm"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
