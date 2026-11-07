ALTER TABLE "organizations" ADD COLUMN "trial_ends_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "plan" SET DEFAULT 'trial';
--> statement-breakpoint
CREATE TABLE "outcome_records" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "location_id" text NOT NULL REFERENCES "locations"("id"),
  "finding_id" text NOT NULL REFERENCES "findings"("id"),
  "source_outcome_id" text NOT NULL,
  "recorded_by" text NOT NULL REFERENCES "user"("id"),
  "payload" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "outcome_records_source_uidx" ON "outcome_records" ("organization_id", "source_outcome_id");
--> statement-breakpoint
CREATE INDEX "outcome_records_scope_idx" ON "outcome_records" ("organization_id", "location_id");

--> statement-breakpoint
CREATE TABLE "outcome_evidence_claims" (
  "outcome_id" text NOT NULL REFERENCES "outcome_records"("id"),
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "finding_id" text NOT NULL REFERENCES "findings"("id"),
  "evidence_id" text NOT NULL REFERENCES "documents"("id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "outcome_evidence_claims_uidx" ON "outcome_evidence_claims" ("organization_id", "finding_id", "evidence_id");
