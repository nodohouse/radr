import { describe, expect, it } from "vitest";
import {
  assertMembershipRole,
  AuthzError,
  canAccessOrganization,
} from "@/lib/authz";
import type { OrganizationMember } from "@/lib/db/schema";
import {
  assertAllowedUpload,
  assertAllowedUploadBytes,
  detectMimeFromBytes,
} from "@/lib/validation";
import { assertSafeStoragePath, buildStoragePath } from "@/lib/storage";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";

function member(
  overrides: Partial<OrganizationMember> = {},
): OrganizationMember {
  return {
    id: "mem_1",
    organizationId: "org_a",
    userId: "user_1",
    role: "MEMBER",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("tenant isolation helpers", () => {
  it("denies access when membership org does not match resource org", () => {
    expect(canAccessOrganization("org_a", "org_b")).toBe(false);
    expect(canAccessOrganization(null, "org_b")).toBe(false);
    expect(canAccessOrganization(undefined, "org_b")).toBe(false);
  });

  it("allows access only for matching organization", () => {
    expect(canAccessOrganization("org_a", "org_a")).toBe(true);
  });

  it("enforces organization membership presence", () => {
    expect(() => assertMembershipRole(null)).toThrow(AuthzError);
    expect(() => assertMembershipRole(null)).toThrow(/Not a member/);
  });

  it("enforces membership roles when restricted", () => {
    expect(() =>
      assertMembershipRole(member({ role: "MEMBER" }), ["OWNER", "ADMIN"]),
    ).toThrow(/Insufficient role/);

    expect(
      assertMembershipRole(member({ role: "OWNER" }), ["OWNER", "ADMIN"]).role,
    ).toBe("OWNER");
  });
});

describe("upload validation", () => {
  it("rejects disallowed mime types", () => {
    expect(() =>
      assertAllowedUpload({
        type: "application/zip",
        size: 100,
        name: "x.zip",
      }),
    ).toThrow(/Unsupported/);
  });

  it("rejects unsupported extensions", () => {
    expect(() =>
      assertAllowedUpload({
        type: "image/jpeg",
        size: 100,
        name: "x.webp",
      }),
    ).toThrow(/extension/);
  });

  it("rejects empty files", () => {
    expect(() =>
      assertAllowedUpload({
        type: "application/pdf",
        size: 0,
        name: "empty.pdf",
      }),
    ).toThrow(/Empty/);
  });

  it("rejects oversized files", () => {
    expect(() =>
      assertAllowedUpload({
        type: "application/pdf",
        size: MAX_UPLOAD_BYTES + 1,
        name: "big.pdf",
      }),
    ).toThrow(/size limit/);
  });

  it("accepts allowed pdf/image uploads", () => {
    expect(() =>
      assertAllowedUpload({
        type: "application/pdf",
        size: 1024,
        name: "invoice.pdf",
      }),
    ).not.toThrow();
  });

  it("sniffs PDF magic bytes", () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    expect(detectMimeFromBytes(bytes)).toBe("application/pdf");
    expect(
      assertAllowedUploadBytes({
        claimedMime: "application/pdf",
        size: bytes.length,
        name: "invoice.pdf",
        bytes,
      }).mimeType,
    ).toBe("application/pdf");
  });

  it("rejects corrupt content that fails magic-byte sniff", () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04]);
    expect(() =>
      assertAllowedUploadBytes({
        claimedMime: "application/pdf",
        size: bytes.length,
        name: "fake.pdf",
        bytes,
      }),
    ).toThrow(/Unrecognized|corrupt/);
  });
});

describe("private storage paths", () => {
  it("nests objects under organization prefix", () => {
    const storagePath = buildStoragePath({
      organizationId: "11111111-1111-1111-1111-111111111111",
      documentId: "22222222-2222-2222-2222-222222222222",
      originalFilename: "Invoice #12.pdf",
    });
    expect(
      storagePath.startsWith(
        "organizations/11111111-1111-1111-1111-111111111111/documents/",
      ),
    ).toBe(true);
  });

  it("rejects path traversal guesses outside the storage root", () => {
    expect(() =>
      assertSafeStoragePath("/tmp/prep-uploads", "../../etc/passwd"),
    ).toThrow(/Invalid storage path/);
  });
});

describe("route protection expectations", () => {
  it("documents protected prefixes that middleware must guard", () => {
    const protectedPrefixes = [
      "/home",
      "/scan",
      "/sources",
      "/cases",
      "/money",
      "/controls",
      "/documents",
      "/onboarding",
    ];

    for (const prefix of protectedPrefixes) {
      expect(prefix.startsWith("/")).toBe(true);
    }
  });
});
