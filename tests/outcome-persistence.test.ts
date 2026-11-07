import { afterAll, beforeAll, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/lib/db/schema";
import { recordReviewedOutcome } from "@/lib/outcomes/service";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { eq } from "drizzle-orm";
let client: PGlite;
let directory: string;
let database: ReturnType<typeof drizzle<typeof schema>>;
const input = {
  id: "outcome-001",
  organizationId: "org-a",
  locationId: "loc-a",
  findingId: "finding-a",
  sourceOutcomeId: "credit-note:001",
  currency: "EUR",
  expectedValue: 100,
  observedValue: 80,
  evidenceIds: ["doc-a"],
  method: "Credit note reconciled to settlement",
  outcomeReviewed: true as const,
};
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "radr-outcomes-"));
  client = new PGlite(directory);
  database = drizzle(client, { schema });
  await migrate(database, { migrationsFolder: "drizzle" });
  await database.insert(schema.user).values({
    id: "actor-a",
    name: "Reviewer",
    email: "reviewer@example.test",
    emailVerified: true,
  });
  await database.insert(schema.organizations).values({
    id: "org-a",
    name: "A",
    slug: "a",
    country: "NL",
    currency: "EUR",
  });
  await database.insert(schema.locations).values({
    id: "loc-a",
    organizationId: "org-a",
    name: "A",
    country: "NL",
    currency: "EUR",
  });
  await database.insert(schema.findings).values({
    id: "finding-a",
    organizationId: "org-a",
    locationId: "loc-a",
    territory: "BUY",
    category: "variance",
    subtype: "invoice",
    title: "Variance",
    summary: "Variance",
    explanation: "Contract variance",
    dedupeKey: "variance-a",
    financialImpact: { currency: "EUR" },
  });
  await database.insert(schema.documents).values({
    id: "doc-a",
    organizationId: "org-a",
    locationId: "loc-a",
    uploadedBy: "actor-a",
    originalFilename: "credit.csv",
    storagePath: "private/credit.csv",
    mimeType: "text/csv",
    fileSize: 100,
    status: "PROCESSED",
  });
}, 60000);
afterAll(async () => {
  await client?.close();
  if (directory) await rm(directory, { recursive: true, force: true });
});
it("persists reviewed outcomes, replays retries and rolls back competing claims", async () => {
  const first = await recordReviewedOutcome(input, "actor-a", database);
  expect(first.replayed).toBe(false);
  const replay = await recordReviewedOutcome(
    input,
    "actor-a",
    drizzle(client, { schema }),
  );
  expect(replay.replayed).toBe(true);
  await expect(
    recordReviewedOutcome({ ...input, observedValue: 90 }, "actor-a", database),
  ).rejects.toThrow(/different contents/);
  await expect(
    recordReviewedOutcome(
      { ...input, id: "outcome-002", sourceOutcomeId: "credit-note:002" },
      "actor-a",
      database,
    ),
  ).rejects.toThrow(/already supports/);
  expect(await database.select().from(schema.outcomeRecords)).toHaveLength(1);
  await client.close();
  client = new PGlite(directory);
  database = drizzle(client, { schema });
  expect(await database.select().from(schema.outcomeRecords)).toHaveLength(1);
});
it("rejects wrong currency, tenant, unprocessed and missing evidence", async () => {
  await expect(
    recordReviewedOutcome({ ...input, currency: "USD" }, "actor-a", database),
  ).rejects.toThrow(/currency/);
  await expect(
    recordReviewedOutcome(
      { ...input, organizationId: "org-b" },
      "actor-a",
      database,
    ),
  ).rejects.toThrow(/scope/);
  await expect(
    recordReviewedOutcome(
      { ...input, evidenceIds: ["absent"] },
      "actor-a",
      database,
    ),
  ).rejects.toThrow(/processed/);
  await database
    .update(schema.documents)
    .set({ status: "FAILED" })
    .where(eq(schema.documents.id, "doc-a"));
  await expect(
    recordReviewedOutcome(input, "actor-a", database),
  ).rejects.toThrow(/processed/);
});
