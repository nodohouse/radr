CREATE TYPE "public"."territory" AS ENUM('BUY', 'LABOR', 'SELL', 'RECOVER');--> statement-breakpoint
CREATE TYPE "public"."finding_status" AS ENUM('DETECTED', 'OPEN', 'REVIEWED', 'ACTIONED', 'MONITORING', 'RESOLVED', 'VERIFIED', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."finding_urgency" AS ENUM('ACT_NOW', 'TODAY', 'WATCH');--> statement-breakpoint
CREATE TYPE "public"."confidence_band" AS ENUM('HIGH', 'MEDIUM', 'LOW');--> statement-breakpoint
CREATE TYPE "public"."action_status" AS ENUM('PROPOSED', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."attribution" AS ENUM('NATURAL', 'OPERATOR', 'RADR_RECOMMENDED', 'UNCERTAIN');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('confirmed', 'seated', 'completed', 'cancelled', 'no_show', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('waiting', 'notified', 'seated', 'expired', 'cancelled', 'matched');--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "brand_id" text;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "reporting_currency" text;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "seat_count" integer;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "group_booking_threshold" integer;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "cancellation_window_hours" integer;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "service_periods" jsonb;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "opening_hours" jsonb;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "expected_spend_profile" jsonb;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "operating_margin_definition" jsonb;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "labor_cost_definition" jsonb;--> statement-breakpoint
CREATE TABLE "findings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"location_id" text NOT NULL,
	"territory" "territory" NOT NULL,
	"category" text NOT NULL,
	"subtype" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"explanation" text NOT NULL,
	"status" "finding_status" DEFAULT 'OPEN' NOT NULL,
	"urgency" "finding_urgency" DEFAULT 'WATCH' NOT NULL,
	"priority_score" integer DEFAULT 0 NOT NULL,
	"confidence_score" integer DEFAULT 0 NOT NULL,
	"confidence_band" "confidence_band" DEFAULT 'MEDIUM' NOT NULL,
	"confidence_explanation" text DEFAULT '' NOT NULL,
	"timeframe_start" timestamp with time zone,
	"timeframe_end" timestamp with time zone,
	"timeframe_label" text,
	"financial_impact" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"drivers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommendation" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dedupe_key" text NOT NULL,
	"presentation" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actions" (
	"id" text PRIMARY KEY NOT NULL,
	"finding_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"location_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "action_status" DEFAULT 'PROPOSED' NOT NULL,
	"assigned_to_user_id" text,
	"expected_cost" integer,
	"expected_benefit" integer,
	"expected_net_benefit" integer,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"location_id" text NOT NULL,
	"finding_id" text NOT NULL,
	"action_id" text,
	"expected_value" integer NOT NULL,
	"observed_value" integer NOT NULL,
	"verified_value" integer NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"attribution" "attribution" DEFAULT 'UNCERTAIN' NOT NULL,
	"method" text NOT NULL,
	"notes" text,
	"evidence_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"location_id" text NOT NULL,
	"external_id" text NOT NULL,
	"provider" text NOT NULL,
	"service_time" timestamp with time zone NOT NULL,
	"party_size" integer NOT NULL,
	"status" "reservation_status" DEFAULT 'confirmed' NOT NULL,
	"booking_channel" text,
	"cancelled_at" timestamp with time zone,
	"no_show_at" timestamp with time zone,
	"table_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"section_id" text,
	"deposit_amount" integer,
	"prepaid_amount" integer,
	"currency" text,
	"group_booking" boolean DEFAULT false NOT NULL,
	"special_booking_type" text,
	"waitlist_source_id" text,
	"expected_spend_per_cover" integer,
	"expected_booking_value" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"location_id" text NOT NULL,
	"external_id" text NOT NULL,
	"provider" text,
	"requested_service_time" timestamp with time zone NOT NULL,
	"party_size" integer NOT NULL,
	"status" "waitlist_status" DEFAULT 'waiting' NOT NULL,
	"quoted_wait_minutes" integer,
	"actual_wait_minutes" integer,
	"seating_preference" text,
	"matched_reservation_id" text,
	"expected_value" integer,
	"convert_probability" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_finding_id_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."findings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_assigned_to_user_id_user_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_finding_id_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."findings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_matched_reservation_id_reservations_id_fk" FOREIGN KEY ("matched_reservation_id") REFERENCES "public"."reservations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "findings_organization_id_idx" ON "findings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "findings_location_id_idx" ON "findings" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "findings_status_idx" ON "findings" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "findings_org_dedupe_uidx" ON "findings" USING btree ("organization_id","dedupe_key");--> statement-breakpoint
CREATE INDEX "actions_finding_id_idx" ON "actions" USING btree ("finding_id");--> statement-breakpoint
CREATE INDEX "actions_organization_id_idx" ON "actions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "actions_location_id_idx" ON "actions" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "verifications_finding_id_idx" ON "verifications" USING btree ("finding_id");--> statement-breakpoint
CREATE INDEX "verifications_organization_id_idx" ON "verifications" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "reservations_location_id_idx" ON "reservations" USING btree ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_org_provider_external_uidx" ON "reservations" USING btree ("organization_id","provider","external_id");--> statement-breakpoint
CREATE INDEX "waitlist_entries_location_id_idx" ON "waitlist_entries" USING btree ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_org_external_uidx" ON "waitlist_entries" USING btree ("organization_id","external_id");
