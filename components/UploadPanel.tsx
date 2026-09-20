"use client";

import Link from "next/link";
import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";

type UploadPanelProps = {
  organizationId: string;
  locationId?: string | null;
};

type UploadResult = {
  documents: Array<{ id: string; originalFilename: string }>;
};

export function UploadPanel({ organizationId, locationId }: UploadPanelProps) {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function uploadFiles(fileList: FileList | File[] | null | undefined) {
    if (!fileList || (fileList instanceof FileList && fileList.length === 0)) {
      return;
    }

    const files = Array.from(fileList);
    if (files.length === 0) return;

    setPending(true);
    setError(null);
    setResult(null);

    const body = new FormData();
    for (const file of files) {
      body.append("files", file);
    }
    body.set("organizationId", organizationId);
    if (locationId) body.set("locationId", locationId);
    body.set("documentType", "UNKNOWN");

    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body,
    });

    const data = (await response.json().catch(() => null)) as
      | {
          error?: string;
          documents?: Array<{ id: string; originalFilename: string }>;
          document?: { id: string; originalFilename: string };
        }
      | null;

    setPending(false);

    const docs =
      data?.documents ??
      (data?.document ? [data.document] : null);

    if (!response.ok || !docs?.length) {
      setError(data?.error ?? "Upload failed");
      return;
    }

    setResult({ documents: docs });
    router.refresh();
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    void uploadFiles(event.dataTransfer.files);
  }

  if (result) {
    const first = result.documents[0];
    const extra = result.documents.length - 1;

    return (
      <div className="space-y-5">
        <div className="prep-card space-y-3 p-6">
          <p className="prep-display text-3xl font-800">Got it.</p>
          <p className="break-all font-medium">{first.originalFilename}</p>
          {extra > 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">
              +{extra} more document{extra === 1 ? "" : "s"}
            </p>
          ) : null}
          <p className="text-[var(--ink-muted)]">
            RADR received your evidence
            {result.documents.length > 1 ? " files" : ""}.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="prep-btn prep-btn-primary w-full sm:w-auto"
            onClick={() => setResult(null)}
          >
            Upload another
          </button>
          <Link href="/app" className="prep-btn prep-btn-secondary w-full sm:w-auto">
            Back to Control
          </Link>
          <Link href="/documents" className="prep-btn prep-btn-ghost w-full sm:w-auto">
            View evidence
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          void uploadFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={(event) => {
          void uploadFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        className="prep-btn prep-btn-primary prep-btn-camera w-full"
        disabled={pending}
        onClick={() => cameraRef.current?.click()}
      >
        Take photo
      </button>

      <button
        type="button"
        className="prep-btn prep-btn-secondary w-full"
        disabled={pending}
        onClick={() => fileRef.current?.click()}
      >
        Upload
      </button>

      <p className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
        PDF · JPG · PNG
      </p>

      <div
        className="prep-dropzone hidden sm:block"
        data-active={dragActive}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
      >
        or drop it here
      </div>

      {pending ? (
        <p className="text-center text-sm text-[var(--ink-muted)]">
          Uploading securely…
        </p>
      ) : null}
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
