import { z } from "zod";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  CURRENCIES,
  MAX_UPLOAD_BYTES,
  ONBOARDING_COUNTRIES,
} from "@/lib/constants";

const countryCodes = ONBOARDING_COUNTRIES.map((c) => c.code) as [
  string,
  ...string[],
];

export const onboardingSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  locationName: z.string().trim().min(2).max(120),
  country: z.enum(countryCodes),
  currency: z.enum(CURRENCIES),
  locationBand: z.enum(["1", "2-5", "6-20", "21-50", "50+"]).optional(),
  hqCity: z.string().trim().max(120).optional(),
  locationCity: z.string().trim().max(120).optional(),
  venueType: z
    .enum([
      "restaurant",
      "bar",
      "hotel",
      "cafe",
      "other",
      "boutique_hotel",
      "serviced_apartments",
      "vacation_rental",
      "spa",
    ])
    .optional(),
  timezone: z.string().trim().max(80).optional(),
  operateFamilies: z.array(z.string()).optional(),
  operateSubtypes: z.array(z.string()).optional(),
  operatingUnits: z.array(z.string()).optional(),
  roomCount: z.number().int().positive().optional(),
  role: z.string().optional(),
  helpFocus: z.array(z.string()).optional(),
  selectedKpis: z.array(z.string()).optional(),
  operatingProfileId: z.string().optional(),
  pendingSystem: z.string().trim().max(40).optional(),
  pendingSystemLabel: z.string().trim().max(80).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const onboardingPatchSchema = z.object({
  step: z
    .enum([
      "welcome",
      "organization",
      "operate",
      "units",
      "role",
      "kpis",
      "system",
      "insight",
      "operation",
      "location",
      "building",
      "choose",
      "connect",
      "done",
    ])
    .optional(),
  demoEnabled: z.boolean().optional(),
  tourDismissed: z.boolean().optional(),
  checklistDismissed: z.boolean().optional(),
  firstWelcomeSeen: z.boolean().optional(),
  pendingSystem: z.string().trim().max(40).optional(),
  pendingSystemLabel: z.string().trim().max(80).optional(),
  completedAt: z.string().optional(),
  operateFamilies: z.array(z.string()).optional(),
  operateSubtypes: z.array(z.string()).optional(),
  operatingUnits: z.array(z.string()).optional(),
  roomCount: z.number().int().positive().optional(),
  role: z.string().optional(),
  helpFocus: z.array(z.string()).optional(),
  selectedKpis: z.array(z.string()).optional(),
  operatingProfileId: z.string().optional(),
  venueType: z.string().optional(),
  organizationName: z.string().optional(),
  locationName: z.string().optional(),
});


export const uploadMetaSchema = z.object({
  organizationId: z.string().uuid(),
  locationId: z.string().uuid().optional().nullable(),
  documentType: z
    .enum([
      "UNKNOWN",
      "INVOICE",
      "CREDIT_NOTE",
      "CONTRACT",
      "DELIVERY_NOTE",
      "STATEMENT",
      "RECEIPT",
      "OTHER",
    ])
    .default("UNKNOWN"),
});

export function extensionOf(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx < 0) return "";
  return filename.slice(idx).toLowerCase();
}

function mimeMatchesExtension(mime: string, ext: string): boolean {
  if (mime === "application/pdf") return ext === ".pdf";
  if (mime === "image/jpeg") return ext === ".jpg" || ext === ".jpeg";
  if (mime === "image/png") return ext === ".png";
  return false;
}

export function defaultFilenameForMime(mime: string): string {
  if (mime === "application/pdf") return "document.pdf";
  if (mime === "image/png") return "photo.png";
  return "photo.jpg";
}

/** Detect format from magic bytes. Returns null if unrecognized/corrupt. */
export function detectMimeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length < 4) return null;

  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return "application/pdf";
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  return null;
}

export function assertAllowedUpload(file: {
  type: string;
  size: number;
  name: string;
}): void {
  if (!file.name || file.name.length > 255) {
    throw new Error("Invalid filename");
  }

  if (file.size <= 0) {
    throw new Error("Empty file");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File exceeds size limit");
  }

  const ext = extensionOf(file.name);
  if (
    !ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])
  ) {
    throw new Error("Unsupported file extension");
  }

  if (
    file.type &&
    !ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])
  ) {
    throw new Error("Unsupported file type");
  }

  if (file.type && !mimeMatchesExtension(file.type, ext)) {
    throw new Error("File type does not match extension");
  }
}

/**
 * Full server-side upload check including content sniffing.
 * Prefer this after reading file bytes.
 */
export function assertAllowedUploadBytes(params: {
  claimedMime: string;
  size: number;
  name: string;
  bytes: Uint8Array;
}): { mimeType: string; filename: string } {
  if (params.bytes.length === 0 || params.size <= 0) {
    throw new Error("Empty or corrupt upload");
  }

  if (params.size > MAX_UPLOAD_BYTES || params.bytes.length > MAX_UPLOAD_BYTES) {
    throw new Error("File exceeds size limit");
  }

  const detected = detectMimeFromBytes(params.bytes);
  if (!detected) {
    throw new Error("Unrecognized or corrupt file content");
  }

  if (
    !ALLOWED_MIME_TYPES.includes(detected as (typeof ALLOWED_MIME_TYPES)[number])
  ) {
    throw new Error("Unsupported file type");
  }

  let filename = params.name?.trim() || "";
  if (!filename || filename.length > 255) {
    filename = defaultFilenameForMime(detected);
  }

  // Camera captures sometimes omit an extension. Attach one from sniffed type.
  if (!extensionOf(filename)) {
    const base = filename.replace(/\.+$/, "") || "photo";
    filename = `${base}${
      detected === "application/pdf"
        ? ".pdf"
        : detected === "image/png"
          ? ".png"
          : ".jpg"
    }`;
  }

  const ext = extensionOf(filename);
  if (
    !ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])
  ) {
    throw new Error("Unsupported file extension");
  }

  if (!mimeMatchesExtension(detected, ext)) {
    throw new Error("File content does not match extension");
  }

  if (
    params.claimedMime &&
    ALLOWED_MIME_TYPES.includes(
      params.claimedMime as (typeof ALLOWED_MIME_TYPES)[number],
    ) &&
    params.claimedMime !== detected
  ) {
    throw new Error("File content does not match declared type");
  }

  return { mimeType: detected, filename };
}
