import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteDocumentButton } from "@/components/DeleteDocumentButton";
import { PageHeader } from "@/components/app/PageHeader";
import { AuthzError, requireDocumentAccess, requireSession } from "@/lib/authz";
import { formatShortDate, formatStatus } from "@/lib/format";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  let document;
  try {
    ({ document } = await requireDocumentAccess(session.user.id, id));
  } catch (error) {
    if (error instanceof AuthzError) notFound();
    throw error;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Evidence"
        title={document.originalFilename}
        description="Private file for your organization."
      />

      <dl className="prep-card grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <dt className="prep-label">Status</dt>
          <dd>{formatStatus(document.status)}</dd>
        </div>
        <div>
          <dt className="prep-label">Type</dt>
          <dd>{formatStatus(document.documentType)}</dd>
        </div>
        <div>
          <dt className="prep-label">Format</dt>
          <dd>{document.mimeType}</dd>
        </div>
        <div>
          <dt className="prep-label">Size</dt>
          <dd>{formatBytes(document.fileSize)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="prep-label">Uploaded</dt>
          <dd>{formatShortDate(document.createdAt)}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={`/api/documents/${document.id}`}
          className="prep-btn prep-btn-primary"
        >
          View / download
        </a>
        <Link href="/documents" className="prep-btn prep-btn-secondary">
          Evidence library
        </Link>
        <Link href="/sources" className="prep-btn prep-btn-ghost">
          Add more
        </Link>
      </div>

      <DeleteDocumentButton documentId={document.id} />
    </div>
  );
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
