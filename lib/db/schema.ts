import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

/** Auth tables (Better Auth) */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Domain enums */

export const membershipRoleEnum = pgEnum("membership_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "UNKNOWN",
  "INVOICE",
  "CREDIT_NOTE",
  "CONTRACT",
  "DELIVERY_NOTE",
  "STATEMENT",
  "RECEIPT",
  "OTHER",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "UPLOADED",
  "PROCESSING",
  "PROCESSED",
  "FAILED",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "ORGANIZATION_CREATED",
  "LOCATION_CREATED",
  "DOCUMENT_UPLOADED",
  "DOCUMENT_DELETED",
  "MEMBER_ADDED",
  "MEMBER_ROLE_CHANGED",
  "MEMBER_REMOVED",
  "INVITATION_CREATED",
  "INVITATION_ACCEPTED",
  "INVITATION_REVOKED",
  "INVITATION_EXPIRED",
  "LOCATION_ACCESS_CHANGED",
  "AUTH_POLICY_UPDATED",
  "SESSION_REVOKED",
]);

export const orgStatusEnum = pgEnum("org_status", [
  "active",
  "suspended",
  "pending",
]);

export const locationAccessScopeEnum = pgEnum("location_access_scope", [
  "all",
  "group",
  "locations",
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

export const territoryEnum = pgEnum("territory", [
  "BUY",
  "LABOR",
  "SELL",
  "RECOVER",
]);

export const findingStatusEnum = pgEnum("finding_status", [
  "DETECTED",
  "OPEN",
  "REVIEWED",
  "ACTIONED",
  "MONITORING",
  "RESOLVED",
  "VERIFIED",
  "DISMISSED",
]);

export const findingUrgencyEnum = pgEnum("finding_urgency", [
  "ACT_NOW",
  "TODAY",
  "WATCH",
]);

export const confidenceBandEnum = pgEnum("confidence_band", [
  "HIGH",
  "MEDIUM",
  "LOW",
]);

export const actionStatusEnum = pgEnum("action_status", [
  "PROPOSED",
  "ACCEPTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const attributionEnum = pgEnum("attribution", [
  "NATURAL",
  "OPERATOR",
  "RADR_RECOMMENDED",
  "UNCERTAIN",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
  "unknown",
]);

export const waitlistStatusEnum = pgEnum("waitlist_status", [
  "waiting",
  "notified",
  "seated",
  "expired",
  "cancelled",
  "matched",
]);

/** Domain tables */

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  country: text("country").notNull(),
  currency: text("currency").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  status: orgStatusEnum("status").notNull().default("active"),
  plan: text("plan").notNull().default("pilot"),
  fiscalYearStart: integer("fiscal_year_start"),
  /**
   * Onboarding progress / UI state only — not settings SSOT.
   * Shape: { schemaVersion, flowVersion, completedStepIds, skippedStepIds, currentStepId, … }
   */
  onboarding: jsonb("onboarding")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("organizations_slug_uidx").on(table.slug)]);

/** System + custom roles. System roles seeded from lib/platform/rbac.ts */
export const roles = pgTable(
  "roles",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    system: boolean("system").notNull().default(false),
    organizationId: text("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("roles_key_org_uidx").on(table.key, table.organizationId),
  ],
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: text("id").primaryKey(),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permission: text("permission").notNull(),
  },
  (table) => [
    uniqueIndex("role_permissions_role_perm_uidx").on(
      table.roleId,
      table.permission,
    ),
    index("role_permissions_role_id_idx").on(table.roleId),
  ],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** @deprecated Prefer roleId. Kept for migration compat. */
    role: membershipRoleEnum("role").notNull().default("MEMBER"),
    roleId: text("role_id").references(() => roles.id, {
      onDelete: "restrict",
    }),
    status: text("status").notNull().default("active"),
    invitedBy: text("invited_by").references(() => user.id, {
      onDelete: "set null",
    }),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("organization_members_org_user_uidx").on(
      table.organizationId,
      table.userId,
    ),
    index("organization_members_user_id_idx").on(table.userId),
    index("organization_members_role_id_idx").on(table.roleId),
  ],
);

/** Org-scoped location groups (hierarchy stub — not SCIM). */
export const locationGroups = pgTable(
  "location_groups",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("location_groups_organization_id_idx").on(table.organizationId),
  ],
);

export const locationAccess = pgTable(
  "location_access",
  {
    id: text("id").primaryKey(),
    membershipId: text("membership_id")
      .notNull()
      .references(() => organizationMembers.id, { onDelete: "cascade" }),
    scope: locationAccessScopeEnum("scope").notNull().default("all"),
    groupId: text("group_id").references(() => locationGroups.id, {
      onDelete: "set null",
    }),
    locationIds: jsonb("location_ids").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("location_access_membership_uidx").on(table.membershipId),
  ],
);

export const invitations = pgTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    /** SHA-256 hex of raw token — never store raw token. */
    tokenHash: text("token_hash").notNull(),
    status: invitationStatusEnum("status").notNull().default("pending"),
    locationScope: locationAccessScopeEnum("location_scope")
      .notNull()
      .default("all"),
    locationIds: jsonb("location_ids").$type<string[]>().notNull().default([]),
    groupId: text("group_id").references(() => locationGroups.id, {
      onDelete: "set null",
    }),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("invitations_token_hash_uidx").on(table.tokenHash),
    index("invitations_organization_id_idx").on(table.organizationId),
    index("invitations_email_idx").on(table.email),
  ],
);

/** Org auth policy stub — columns only; WorkOS not wired. */
export const authenticationPolicies = pgTable("authentication_policies", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" })
    .unique(),
  mfaRequired: boolean("mfa_required").notNull().default(false),
  ssoEnforced: boolean("sso_enforced").notNull().default(false),
  allowedDomains: jsonb("allowed_domains").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** RADR profile fields beyond better-auth user table. */
export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  locale: text("locale"),
  timezone: text("timezone"),
  status: text("status").notNull().default("active"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const locations = pgTable(
  "locations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    brandId: text("brand_id"),
    name: text("name").notNull(),
    address: text("address"),
    city: text("city"),
    country: text("country").notNull(),
    currency: text("currency").notNull(),
    reportingCurrency: text("reporting_currency"),
    timezone: text("timezone").notNull().default("UTC"),
    seatCount: integer("seat_count"),
    groupBookingThreshold: integer("group_booking_threshold"),
    cancellationWindowHours: integer("cancellation_window_hours"),
    servicePeriods: jsonb("service_periods").$type<unknown>(),
    openingHours: jsonb("opening_hours").$type<unknown>(),
    expectedSpendProfile: jsonb("expected_spend_profile").$type<unknown>(),
    operatingMarginDefinition: jsonb(
      "operating_margin_definition",
    ).$type<unknown>(),
    laborCostDefinition: jsonb("labor_cost_definition").$type<unknown>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("locations_organization_id_idx").on(table.organizationId)],
);

export const locationGroupMembers = pgTable(
  "location_group_members",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => locationGroups.id, { onDelete: "cascade" }),
    locationId: text("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("location_group_members_uidx").on(
      table.groupId,
      table.locationId,
    ),
  ],
);

/** Intelligence + hospitality domain (Phase 2). Rows optional until ingest/engine wire. */

export const findings = pgTable(
  "findings",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    locationId: text("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    territory: territoryEnum("territory").notNull(),
    category: text("category").notNull(),
    subtype: text("subtype").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    explanation: text("explanation").notNull(),
    status: findingStatusEnum("status").notNull().default("OPEN"),
    urgency: findingUrgencyEnum("urgency").notNull().default("WATCH"),
    priorityScore: integer("priority_score").notNull().default(0),
    confidenceScore: integer("confidence_score").notNull().default(0),
    confidenceBand: confidenceBandEnum("confidence_band").notNull().default("MEDIUM"),
    confidenceExplanation: text("confidence_explanation").notNull().default(""),
    timeframeStart: timestamp("timeframe_start", { withTimezone: true }),
    timeframeEnd: timestamp("timeframe_end", { withTimezone: true }),
    timeframeLabel: text("timeframe_label"),
    financialImpact: jsonb("financial_impact")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    drivers: jsonb("drivers").$type<unknown[]>().notNull().default([]),
    recommendation: jsonb("recommendation")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    evidence: jsonb("evidence").$type<unknown[]>().notNull().default([]),
    sourceIds: jsonb("source_ids").$type<string[]>().notNull().default([]),
    dedupeKey: text("dedupe_key").notNull(),
    presentation: jsonb("presentation").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("findings_organization_id_idx").on(table.organizationId),
    index("findings_location_id_idx").on(table.locationId),
    index("findings_status_idx").on(table.status),
    uniqueIndex("findings_org_dedupe_uidx").on(
      table.organizationId,
      table.dedupeKey,
    ),
  ],
);

export const actions = pgTable(
  "actions",
  {
    id: text("id").primaryKey(),
    findingId: text("finding_id")
      .notNull()
      .references(() => findings.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    locationId: text("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: actionStatusEnum("status").notNull().default("PROPOSED"),
    assignedToUserId: text("assigned_to_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    expectedCost: integer("expected_cost"),
    expectedBenefit: integer("expected_benefit"),
    expectedNetBenefit: integer("expected_net_benefit"),
    currency: text("currency").notNull().default("EUR"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("actions_finding_id_idx").on(table.findingId),
    index("actions_organization_id_idx").on(table.organizationId),
    index("actions_location_id_idx").on(table.locationId),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    locationId: text("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    findingId: text("finding_id")
      .notNull()
      .references(() => findings.id, { onDelete: "cascade" }),
    actionId: text("action_id").references(() => actions.id, {
      onDelete: "set null",
    }),
    expectedValue: integer("expected_value").notNull(),
    observedValue: integer("observed_value").notNull(),
    verifiedValue: integer("verified_value").notNull(),
    currency: text("currency").notNull().default("EUR"),
    attribution: attributionEnum("attribution").notNull().default("UNCERTAIN"),
    method: text("method").notNull(),
    notes: text("notes"),
    evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("verifications_finding_id_idx").on(table.findingId),
    index("verifications_organization_id_idx").on(table.organizationId),
  ],
);

export const reservations = pgTable(
  "reservations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    locationId: text("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    provider: text("provider").notNull(),
    serviceTime: timestamp("service_time", { withTimezone: true }).notNull(),
    partySize: integer("party_size").notNull(),
    status: reservationStatusEnum("status").notNull().default("confirmed"),
    bookingChannel: text("booking_channel"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    noShowAt: timestamp("no_show_at", { withTimezone: true }),
    tableIds: jsonb("table_ids").$type<string[]>().notNull().default([]),
    sectionId: text("section_id"),
    depositAmount: integer("deposit_amount"),
    prepaidAmount: integer("prepaid_amount"),
    currency: text("currency"),
    groupBooking: boolean("group_booking").notNull().default(false),
    specialBookingType: text("special_booking_type"),
    waitlistSourceId: text("waitlist_source_id"),
    expectedSpendPerCover: integer("expected_spend_per_cover"),
    expectedBookingValue: integer("expected_booking_value"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reservations_location_id_idx").on(table.locationId),
    uniqueIndex("reservations_org_provider_external_uidx").on(
      table.organizationId,
      table.provider,
      table.externalId,
    ),
  ],
);

export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    locationId: text("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    provider: text("provider"),
    requestedServiceTime: timestamp("requested_service_time", {
      withTimezone: true,
    }).notNull(),
    partySize: integer("party_size").notNull(),
    status: waitlistStatusEnum("status").notNull().default("waiting"),
    quotedWaitMinutes: integer("quoted_wait_minutes"),
    actualWaitMinutes: integer("actual_wait_minutes"),
    seatingPreference: text("seating_preference"),
    matchedReservationId: text("matched_reservation_id").references(
      () => reservations.id,
      { onDelete: "set null" },
    ),
    expectedValue: integer("expected_value"),
    convertProbability: integer("convert_probability"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("waitlist_entries_location_id_idx").on(table.locationId),
    uniqueIndex("waitlist_entries_org_external_uidx").on(
      table.organizationId,
      table.externalId,
    ),
  ],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    externalReference: text("external_reference"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("suppliers_organization_id_idx").on(table.organizationId)],
);

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    locationId: text("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    supplierId: text("supplier_id").references(() => suppliers.id, {
      onDelete: "set null",
    }),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    documentType: documentTypeEnum("document_type").notNull().default("UNKNOWN"),
    originalFilename: text("original_filename").notNull(),
    storagePath: text("storage_path").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    status: documentStatusEnum("status").notNull().default("UPLOADED"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("documents_organization_id_idx").on(table.organizationId),
    index("documents_uploaded_by_idx").on(table.uploadedBy),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: auditActionEnum("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_organization_id_idx").on(table.organizationId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

/** Relations */

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  locations: many(locations),
  suppliers: many(suppliers),
  documents: many(documents),
  auditLogs: many(auditLogs),
  findings: many(findings),
  reservations: many(reservations),
  waitlistEntries: many(waitlistEntries),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(user, {
      fields: [organizationMembers.userId],
      references: [user.id],
    }),
  }),
);

export const documentsRelations = relations(documents, ({ one }) => ({
  organization: one(organizations, {
    fields: [documents.organizationId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [documents.locationId],
    references: [locations.id],
  }),
  supplier: one(suppliers, {
    fields: [documents.supplierId],
    references: [suppliers.id],
  }),
  uploader: one(user, {
    fields: [documents.uploadedBy],
    references: [user.id],
  }),
}));

export const findingsRelations = relations(findings, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [findings.organizationId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [findings.locationId],
    references: [locations.id],
  }),
  actions: many(actions),
  verifications: many(verifications),
}));

export const actionsRelations = relations(actions, ({ one }) => ({
  finding: one(findings, {
    fields: [actions.findingId],
    references: [findings.id],
  }),
  organization: one(organizations, {
    fields: [actions.organizationId],
    references: [organizations.id],
  }),
  location: one(locations, {
    fields: [actions.locationId],
    references: [locations.id],
  }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  finding: one(findings, {
    fields: [verifications.findingId],
    references: [findings.id],
  }),
  action: one(actions, {
    fields: [verifications.actionId],
    references: [actions.id],
  }),
}));

export type User = typeof user.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type FindingRow = typeof findings.$inferSelect;
export type ActionRow = typeof actions.$inferSelect;
export type VerificationRow = typeof verifications.$inferSelect;
export type ReservationRow = typeof reservations.$inferSelect;
export type WaitlistEntryRow = typeof waitlistEntries.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type LocationAccess = typeof locationAccess.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type AuthenticationPolicy = typeof authenticationPolicies.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type MembershipRole = (typeof membershipRoleEnum.enumValues)[number];
export type DocumentType = (typeof documentTypeEnum.enumValues)[number];
export type DocumentStatus = (typeof documentStatusEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];
export type DbFindingStatus = (typeof findingStatusEnum.enumValues)[number];
export type DbActionStatus = (typeof actionStatusEnum.enumValues)[number];

/** Custom dashboards (signed-in persistence — demo uses localStorage) */
export const dashboardVisibilityEnum = pgEnum("dashboard_visibility", [
  "PRIVATE",
  "SHARED",
  "ROLE",
  "ORGANIZATION",
]);

export const dashboards = pgTable(
  "dashboards",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    visibility: dashboardVisibilityEnum("visibility").default("PRIVATE").notNull(),
    roleTemplate: text("role_template"),
    defaultPeriod: text("default_period"),
    layout: jsonb("layout").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("dashboards_org_idx").on(table.organizationId),
    index("dashboards_owner_idx").on(table.ownerUserId),
  ],
);

export const dashboardWidgets = pgTable(
  "dashboard_widgets",
  {
    id: text("id").primaryKey(),
    dashboardId: text("dashboard_id")
      .notNull()
      .references(() => dashboards.id, { onDelete: "cascade" }),
    intelligenceModuleId: text("intelligence_module_id").notNull(),
    x: integer("x").notNull().default(0),
    y: integer("y").notNull().default(0),
    width: integer("width").notNull().default(6),
    height: integer("height").notNull().default(2),
    configuration: jsonb("configuration").$type<Record<string, unknown>>().default({}),
    scopeOverride: text("scope_override"),
    periodOverride: text("period_override"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("dashboard_widgets_dash_idx").on(table.dashboardId)],
);

export const userDashboardPins = pgTable(
  "user_dashboard_pins",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    dashboardId: text("dashboard_id")
      .notNull()
      .references(() => dashboards.id, { onDelete: "cascade" }),
    pinOrder: integer("pin_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("user_dashboard_pins_uniq").on(table.userId, table.dashboardId),
  ],
);

export type DashboardRow = typeof dashboards.$inferSelect;
export type DashboardWidgetRow = typeof dashboardWidgets.$inferSelect;
