import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getAuthIdentity } from "@/lib/identity/provider";
import { AuthzError, requireUploadAuthorization } from "@/lib/authz";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import {
  getWorkspaceForUser,
  patchOnboardingState,
} from "@/lib/onboarding";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import type { FirstDecisionOutcome } from "@/lib/onboarding/firstValue";
import {
  analyzeSupplierApVariance,
  formatMoneyMajor,
} from "@/lib/onboarding/supplierApAnalysis";
import { ensureMilestone, withStep } from "@/lib/onboarding/types";
import { getPrivateObjectBuffer } from "@/lib/storage";
import { CLIENT_ERRORS } from "@/lib/security/errors";
import {
  clientKeyFromRequest,
  rateLimit,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";

/**
 * Run Supplier/AP analysis on the org's latest CONTRACT + INVOICE uploads.
 * Deterministic — no LLM economics.
 */
export async function POST(request: Request) {
  const rl = rateLimit({
    key: clientKeyFromRequest(request, "onboarding-analyze"),
    limit: 12,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.rateLimited },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.unauthorized },
      { status: 401 },
    );
  }

  const workspace = await getWorkspaceForUser(identity.userId);
  if (!workspace) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.notFound },
      { status: 404 },
    );
  }

  try {
    await requireUploadAuthorization(
      identity.userId,
      workspace.organizationId,
    );
  } catch (error) {
    if (error instanceof AuthzError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }

  const [contractDoc] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.organizationId, workspace.organizationId),
        eq(documents.documentType, "CONTRACT"),
      ),
    )
    .orderBy(desc(documents.createdAt))
    .limit(1);

  const [invoiceDoc] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.organizationId, workspace.organizationId),
        eq(documents.documentType, "INVOICE"),
      ),
    )
    .orderBy(desc(documents.createdAt))
    .limit(1);

  if (!contractDoc || !invoiceDoc) {
    const missing = [
      !contractDoc ? "contract file" : null,
      !invoiceDoc ? "invoice file" : null,
    ].filter(Boolean) as string[];
    return NextResponse.json(
      {
        ok: false,
        outcome: {
          kind: "insufficient_evidence",
          missing,
          message: "Upload both contract and invoice data before analysis.",
        } satisfies FirstDecisionOutcome,
      },
      { status: 400 },
    );
  }

  let contractCsv: string;
  let invoiceCsv: string;
  try {
    const cBuf = await getPrivateObjectBuffer(contractDoc.storagePath);
    const iBuf = await getPrivateObjectBuffer(invoiceDoc.storagePath);
    contractCsv = cBuf.toString("utf8");
    invoiceCsv = iBuf.toString("utf8");
  } catch {
    return NextResponse.json(
      { error: "Could not read uploaded files" },
      { status: 500 },
    );
  }

  const thresholdMajor =
    (workspace.onboarding.materialityThresholdMinor ?? 10000) / 100;

  const result = analyzeSupplierApVariance({
    contractCsv,
    invoiceCsv,
    thresholdMajor,
  });

  trackOnboarding(
    "analysis_started",
    { status: result.status },
    workspace.organizationId,
  );

  const locationName =
    workspace.primaryLocation?.name ??
    workspace.onboarding.locationName ??
    "Location";

  let outcome: FirstDecisionOutcome;

  if (result.status === "decision") {
    outcome = {
      kind: "decision",
      displayId: "D-4102",
      locationName,
      classLabel: "Supplier / AP",
      amountMinor: Math.round(result.economicVariance * 100),
      currency: result.currency,
      headline: `${formatMoneyMajor(result.economicVariance, result.currency)} at risk`,
      rationale: `Invoice unit price is ${formatMoneyMajor(result.rateVariance, result.currency)}/${result.invoice.unit} above the active contract rate across ${result.quantity} ${result.invoice.unit}.`,
    };
    trackOnboarding(
      "first_finding_created",
      { variance: result.economicVariance },
      workspace.organizationId,
    );
    trackOnboarding(
      "first_decision_created",
      { variance: result.economicVariance },
      workspace.organizationId,
    );
  } else if (
    result.status === "no_variance" ||
    result.status === "below_materiality"
  ) {
    outcome = {
      kind: "nothing_needs_you",
      invoiceLines: result.invoiceLines,
      contracts: result.contracts,
      thresholdMinor: Math.round(result.threshold * 100),
      currency: result.currency,
    };
    trackOnboarding(
      "first_finding_created",
      { status: result.status },
      workspace.organizationId,
    );
  } else if (result.status === "insufficient_evidence") {
    outcome = {
      kind: "insufficient_evidence",
      missing: result.missing,
      message: result.message,
    };
  } else {
    outcome = {
      kind: "insufficient_evidence",
      missing: ["readable mapped data"],
      message: result.message,
    };
  }

  let next = withStep(
    {
      ...workspace.onboarding,
      contractDocumentId: contractDoc.id,
      invoiceDocumentId: invoiceDoc.id,
      firstDecision: outcome,
    },
    "reveal",
  );
  next = ensureMilestone(next, "analysis_ready");
  if (outcome.kind === "decision") {
    next = ensureMilestone(next, "first_finding_created");
    next = ensureMilestone(next, "first_decision_created");
  }

  await patchOnboardingState(workspace.organizationId, next);

  void request;

  return NextResponse.json({
    ok: true,
    analysis: result,
    outcome,
    milestones: next.milestones,
  });
}
