import { isDeepStrictEqual } from "node:util";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, type PrepDb } from "@/lib/db";
import {
  documents,
  findings,
  outcomeRecords,
  outcomeEvidenceClaims,
} from "@/lib/db/schema";
import { buildVerification } from "@/lib/radr/domain/verification";

export const outcomeInput = z
  .object({
    id: z.string().min(8).max(128),
    organizationId: z.string().min(1).max(200),
    locationId: z.string().min(1).max(200),
    findingId: z.string().min(1).max(200),
    sourceOutcomeId: z.string().trim().min(3).max(200),
    expectedValue: z.number().finite().nonnegative().max(1e12),
    observedValue: z.number().finite().nonnegative().max(1e12),
    currency: z.string().regex(/^[A-Z]{3}$/),
    evidenceIds: z
      .array(z.string().trim().min(1).max(200))
      .min(1)
      .max(30)
      .transform((ids) => [...new Set(ids)].sort()),
    method: z.string().trim().min(10).max(2000),
    outcomeReviewed: z.literal(true),
  })
  .strict();

export class OutcomeConflict extends Error {}

/** An operator-reviewed claim, never an assertion of provider-confirmed causation. */
export async function recordReviewedOutcome(
  raw: z.input<typeof outcomeInput>,
  actorId: string,
  database: PrepDb = db,
) {
  const input = outcomeInput.parse(raw);
  return database.transaction(async (tx) => {
    const [finding] = await tx
      .select()
      .from(findings)
      .where(
        and(
          eq(findings.id, input.findingId),
          eq(findings.organizationId, input.organizationId),
          eq(findings.locationId, input.locationId),
        ),
      )
      .limit(1);
    if (!finding)
      throw new OutcomeConflict(
        "Finding does not belong to the selected scope.",
      );
    const evidence = await tx
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.organizationId, input.organizationId),
          inArray(documents.id, input.evidenceIds),
        ),
      );
    if (
      evidence.length !== input.evidenceIds.length ||
      evidence.some(
        (d) =>
          d.status !== "PROCESSED" ||
          (d.locationId !== null && d.locationId !== input.locationId),
      )
    )
      throw new OutcomeConflict(
        "Evidence must be processed and accessible in the selected scope.",
      );
    const findingCurrency = finding.financialImpact.currency;
    if (
      typeof findingCurrency !== "string" ||
      findingCurrency !== input.currency
    )
      throw new OutcomeConflict(
        "Outcome currency must match the finding's source currency.",
      );
    const verification = buildVerification({
      ...input,
      attribution: "RADR_RECOMMENDED",
      strength: "SUPPORTED",
    });
    const [inserted] = await tx
      .insert(outcomeRecords)
      .values({
        id: input.id,
        organizationId: input.organizationId,
        locationId: input.locationId,
        findingId: input.findingId,
        sourceOutcomeId: input.sourceOutcomeId,
        recordedBy: actorId,
        payload: { request: input, verification },
      })
      .onConflictDoNothing()
      .returning();
    if (inserted) {
      const claimed = await tx
        .insert(outcomeEvidenceClaims)
        .values(
          input.evidenceIds.map((evidenceId) => ({
            outcomeId: input.id,
            organizationId: input.organizationId,
            findingId: input.findingId,
            evidenceId,
          })),
        )
        .onConflictDoNothing()
        .returning();
      if (claimed.length !== input.evidenceIds.length)
        throw new OutcomeConflict(
          "Evidence already supports a recorded outcome for this finding.",
        );
      return { record: inserted, replayed: false };
    }
    const [prior] = await tx
      .select()
      .from(outcomeRecords)
      .where(
        and(
          eq(outcomeRecords.organizationId, input.organizationId),
          eq(outcomeRecords.sourceOutcomeId, input.sourceOutcomeId),
        ),
      )
      .limit(1);
    if (!prior || !isDeepStrictEqual(prior.payload.request, input))
      throw new OutcomeConflict(
        "Outcome identity already exists with different contents.",
      );
    return { record: prior, replayed: true };
  });
}
