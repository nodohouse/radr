/**
 * Integration-style authorization tests for document intake.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import path from "node:path";
import * as schema from "@/lib/db/schema";
import {
  AuthzError,
  assertMembershipRole,
  canAccessOrganization,
} from "@/lib/authz";

const migrationsFolder = path.join(process.cwd(), "drizzle");

describe("organization document isolation (db)", () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;

  beforeAll(async () => {
    const client = new PGlite();
    db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder });

    const now = new Date();

    await db.insert(schema.user).values([
      {
        id: "user_a",
        name: "Alice",
        email: "alice@example.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user_b",
        name: "Bob",
        email: "bob@example.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await db.insert(schema.organizations).values([
      {
        id: "org_a",
        name: "Restaurant A",
        country: "NL",
        currency: "EUR",
        timezone: "Europe/Amsterdam",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "org_b",
        name: "Restaurant B",
        country: "NL",
        currency: "EUR",
        timezone: "Europe/Amsterdam",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await db.insert(schema.organizationMembers).values([
      {
        id: "mem_a",
        organizationId: "org_a",
        userId: "user_a",
        role: "OWNER",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mem_b",
        organizationId: "org_b",
        userId: "user_b",
        role: "OWNER",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await db.insert(schema.documents).values({
      id: "doc_a",
      organizationId: "org_a",
      locationId: null,
      supplierId: null,
      uploadedBy: "user_a",
      documentType: "INVOICE",
      originalFilename: "a.pdf",
      storagePath: "organizations/org_a/documents/doc_a/a.pdf",
      mimeType: "application/pdf",
      fileSize: 123,
      status: "UPLOADED",
      createdAt: now,
      updatedAt: now,
    });
  });

  async function getMembership(userId: string, organizationId: string) {
    const rows = await db.select().from(schema.organizationMembers);
    return (
      rows.find(
        (m) => m.userId === userId && m.organizationId === organizationId,
      ) ?? null
    );
  }

  async function requireDocumentAccess(userId: string, documentId: string) {
    const [document] = await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, documentId))
      .limit(1);
    if (!document) throw new AuthzError("Document not found", 404);
    const membership = await getMembership(userId, document.organizationId);
    assertMembershipRole(membership);
    if (
      !canAccessOrganization(membership!.organizationId, document.organizationId)
    ) {
      throw new AuthzError("Forbidden", 403);
    }
    return { document, membership: membership! };
  }

  async function requireUploadAuthorization(
    userId: string,
    organizationId: string,
  ) {
    const membership = await getMembership(userId, organizationId);
    return assertMembershipRole(membership);
  }

  async function deleteDocument(userId: string, documentId: string) {
    const { document } = await requireDocumentAccess(userId, documentId);
    await db.delete(schema.documents).where(eq(schema.documents.id, documentId));
    return document;
  }

  it("allows a member to access their organization document", async () => {
    const result = await requireDocumentAccess("user_a", "doc_a");
    expect(result.document.id).toBe("doc_a");
  });

  it("blocks another organization's user from document access", async () => {
    await expect(requireDocumentAccess("user_b", "doc_a")).rejects.toBeInstanceOf(
      AuthzError,
    );
  });

  it("blocks upload into another organization", async () => {
    await expect(
      requireUploadAuthorization("user_b", "org_a"),
    ).rejects.toBeInstanceOf(AuthzError);
  });

  it("allows upload into own organization", async () => {
    const membership = await requireUploadAuthorization("user_a", "org_a");
    expect(membership.organizationId).toBe("org_a");
  });

  it("enforces membership for signed/private document access path", async () => {
    await expect(requireDocumentAccess("user_b", "doc_a")).rejects.toThrow(
      /Not a member|Forbidden/,
    );
  });

  it("deleted documents cannot subsequently be accessed", async () => {
    await db.insert(schema.documents).values({
      id: "doc_delete",
      organizationId: "org_a",
      locationId: null,
      supplierId: null,
      uploadedBy: "user_a",
      documentType: "RECEIPT",
      originalFilename: "tmp.pdf",
      storagePath: "organizations/org_a/documents/doc_delete/tmp.pdf",
      mimeType: "application/pdf",
      fileSize: 10,
      status: "UPLOADED",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await deleteDocument("user_a", "doc_delete");
    await expect(
      requireDocumentAccess("user_a", "doc_delete"),
    ).rejects.toMatchObject({ status: 404 });
  });
});
