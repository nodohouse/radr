-- Auth + tenancy foundation (Phases A–E)

CREATE TYPE "org_status" AS ENUM ('active', 'suspended', 'pending');--> statement-breakpoint
CREATE TYPE "location_access_scope" AS ENUM ('all', 'group', 'locations');--> statement-breakpoint
CREATE TYPE "invitation_status" AS ENUM ('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint

ALTER TYPE "audit_action" ADD VALUE IF NOT EXISTS 'MEMBER_ROLE_CHANGED';--> statement-breakpoint
ALTER TYPE "audit_action" ADD VALUE IF NOT EXISTS 'MEMBER_REMOVED';--> statement-breakpoint
ALTER TYPE "audit_action" ADD VALUE IF NOT EXISTS 'INVITATION_CREATED';--> statement-breakpoint
ALTER TYPE "audit_action" ADD VALUE IF NOT EXISTS 'INVITATION_ACCEPTED';--> statement-breakpoint
ALTER TYPE "audit_action" ADD VALUE IF NOT EXISTS 'INVITATION_REVOKED';--> statement-breakpoint
ALTER TYPE "audit_action" ADD VALUE IF NOT EXISTS 'INVITATION_EXPIRED';--> statement-breakpoint
ALTER TYPE "audit_action" ADD VALUE IF NOT EXISTS 'LOCATION_ACCESS_CHANGED';--> statement-breakpoint
ALTER TYPE "audit_action" ADD VALUE IF NOT EXISTS 'AUTH_POLICY_UPDATED';--> statement-breakpoint
ALTER TYPE "audit_action" ADD VALUE IF NOT EXISTS 'SESSION_REVOKED';--> statement-breakpoint

ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "slug" text;--> statement-breakpoint
UPDATE "organizations" SET "slug" = lower(replace(id, '_', '-')) WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_slug_uidx" ON "organizations" ("slug");--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "status" "org_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "plan" text DEFAULT 'pilot' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "fiscal_year_start" integer;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "roles" (
  "id" text PRIMARY KEY NOT NULL,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "system" boolean DEFAULT false NOT NULL,
  "organization_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "roles_key_org_uidx" ON "roles" ("key", "organization_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "id" text PRIMARY KEY NOT NULL,
  "role_id" text NOT NULL,
  "permission" text NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_perm_uidx" ON "role_permissions" ("role_id", "permission");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permissions_role_id_idx" ON "role_permissions" ("role_id");--> statement-breakpoint

ALTER TABLE "organization_members" ADD COLUMN IF NOT EXISTS "role_id" text;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN IF NOT EXISTS "invited_by" text;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN IF NOT EXISTS "joined_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN IF NOT EXISTS "last_active_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_members_role_id_idx" ON "organization_members" ("role_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "location_groups" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_groups_organization_id_idx" ON "location_groups" ("organization_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "location_group_members" (
  "id" text PRIMARY KEY NOT NULL,
  "group_id" text NOT NULL,
  "location_id" text NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "location_group_members_uidx" ON "location_group_members" ("group_id", "location_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "location_access" (
  "id" text PRIMARY KEY NOT NULL,
  "membership_id" text NOT NULL,
  "scope" "location_access_scope" DEFAULT 'all' NOT NULL,
  "group_id" text,
  "location_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "location_access_membership_uidx" ON "location_access" ("membership_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "invitations" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "email" text NOT NULL,
  "role_id" text NOT NULL,
  "token_hash" text NOT NULL,
  "status" "invitation_status" DEFAULT 'pending' NOT NULL,
  "location_scope" "location_access_scope" DEFAULT 'all' NOT NULL,
  "location_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "group_id" text,
  "invited_by" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "accepted_at" timestamp with time zone,
  "revoked_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitations_token_hash_uidx" ON "invitations" ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_organization_id_idx" ON "invitations" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations" ("email");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "authentication_policies" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL,
  "mfa_required" boolean DEFAULT false NOT NULL,
  "sso_enforced" boolean DEFAULT false NOT NULL,
  "allowed_domains" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "authentication_policies_organization_id_uidx" ON "authentication_policies" ("organization_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "user_id" text PRIMARY KEY NOT NULL,
  "locale" text,
  "timezone" text,
  "status" text DEFAULT 'active' NOT NULL,
  "last_login_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Seed system roles
INSERT INTO "roles" ("id", "key", "name", "system", "organization_id", "created_at", "updated_at")
VALUES
  ('role_owner', 'owner', 'Owner', true, NULL, now(), now()),
  ('role_admin', 'admin', 'Admin', true, NULL, now(), now()),
  ('role_cfo', 'cfo', 'CFO', true, NULL, now(), now()),
  ('role_coo', 'coo', 'COO', true, NULL, now(), now()),
  ('role_gm', 'gm', 'General Manager', true, NULL, now(), now()),
  ('role_revenue', 'revenue', 'Revenue', true, NULL, now(), now()),
  ('role_fnb', 'fnb', 'Head Chef / F&B', true, NULL, now(), now()),
  ('role_finance', 'finance', 'Finance', true, NULL, now(), now()),
  ('role_operations', 'operations', 'Operations', true, NULL, now(), now()),
  ('role_it', 'it', 'IT / Data', true, NULL, now(), now()),
  ('role_viewer', 'viewer', 'Viewer', true, NULL, now(), now())
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint

-- Migrate legacy membership roles → role_id
UPDATE "organization_members" SET "role_id" = 'role_owner' WHERE "role" = 'OWNER' AND ("role_id" IS NULL);--> statement-breakpoint
UPDATE "organization_members" SET "role_id" = 'role_admin' WHERE "role" = 'ADMIN' AND ("role_id" IS NULL);--> statement-breakpoint
UPDATE "organization_members" SET "role_id" = 'role_viewer' WHERE "role" = 'MEMBER' AND ("role_id" IS NULL);--> statement-breakpoint

-- Default location access = all for existing memberships
INSERT INTO "location_access" ("id", "membership_id", "scope", "location_ids", "created_at", "updated_at")
SELECT 'la_' || "id", "id", 'all', '[]'::jsonb, now(), now()
FROM "organization_members"
WHERE NOT EXISTS (
  SELECT 1 FROM "location_access" la WHERE la."membership_id" = "organization_members"."id"
);--> statement-breakpoint

-- Default auth policy per org
INSERT INTO "authentication_policies" ("id", "organization_id", "mfa_required", "sso_enforced", "allowed_domains", "created_at", "updated_at")
SELECT 'apol_' || "id", "id", false, false, '[]'::jsonb, now(), now()
FROM "organizations"
WHERE NOT EXISTS (
  SELECT 1 FROM "authentication_policies" ap WHERE ap."organization_id" = "organizations"."id"
);
