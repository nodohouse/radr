/**
 * Honest trust / security controls: only what exists in the product.
 * Status must stay truthful: LIVE or IN DEVELOPMENT. Never "Designed".
 * Labels/details are localized via company.securityPage.controls.{id}.
 */
export type TrustStatus = "LIVE" | "IN DEVELOPMENT";

export type TrustControl = {
  id:
    | "privateStorage"
    | "orgIsolation"
    | "serverAuthz"
    | "controlledDocs"
    | "sessionAuth"
    | "auditExports";
  category: "DATA" | "ACCESS" | "INFRASTRUCTURE" | "APPLICATION" | "DOCUMENTS";
  status: TrustStatus;
};

export const TRUST_CONTROLS: readonly TrustControl[] = [
  { id: "privateStorage", category: "DOCUMENTS", status: "LIVE" },
  { id: "orgIsolation", category: "ACCESS", status: "LIVE" },
  { id: "serverAuthz", category: "APPLICATION", status: "LIVE" },
  { id: "controlledDocs", category: "DOCUMENTS", status: "LIVE" },
  { id: "sessionAuth", category: "DATA", status: "LIVE" },
  { id: "auditExports", category: "APPLICATION", status: "IN DEVELOPMENT" },
] as const;
