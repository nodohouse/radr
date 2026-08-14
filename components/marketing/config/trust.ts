/**
 * Honest trust / security controls — only what exists in the product.
 * Status must stay truthful: LIVE or IN DEVELOPMENT. Never "Designed".
 */
export type TrustStatus = "LIVE" | "IN DEVELOPMENT";

export type TrustControl = {
  category: "DATA" | "ACCESS" | "INFRASTRUCTURE" | "APPLICATION" | "DOCUMENTS";
  label: string;
  detail: string;
  status: TrustStatus;
};

export const TRUST_CONTROLS: readonly TrustControl[] = [
  {
    category: "DOCUMENTS",
    label: "Private document storage",
    detail:
      "Uploaded PDFs and images are stored in private object storage (or a private local store in development), not public buckets.",
    status: "LIVE",
  },
  {
    category: "ACCESS",
    label: "Organization isolation",
    detail:
      "Document and account access is scoped to the authenticated organization membership on the server.",
    status: "LIVE",
  },
  {
    category: "APPLICATION",
    label: "Server-side authorization",
    detail:
      "Protected routes and APIs check session and membership before returning sensitive data.",
    status: "LIVE",
  },
  {
    category: "DOCUMENTS",
    label: "Controlled document access",
    detail:
      "Document reads and downloads require authentication; access paths are not publicly enumerable.",
    status: "LIVE",
  },
  {
    category: "DATA",
    label: "Session authentication",
    detail:
      "Account sessions are handled by Better Auth with server-side session validation.",
    status: "LIVE",
  },
  {
    category: "APPLICATION",
    label: "Advanced audit exports",
    detail: "Exportable audit trails for operators and finance teams.",
    status: "IN DEVELOPMENT",
  },
] as const;
