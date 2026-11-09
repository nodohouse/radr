import { z } from "zod";

const placeholders = new Set([
  "test",
  "testing",
  "test test",
  "asdf",
  "asdfgh",
  "qwerty",
  "abc",
  "abcd",
  "demo",
  "fake",
  "none",
  "n/a",
  "unknown",
  "your name",
  "full name",
  "company name",
  "your company",
  "first last",
  "firstname lastname",
]);
const clean = (value: string) =>
  value.normalize("NFC").trim().replace(/\s+/gu, " ");

/** Conservative quality checks. These do not prove identity or company legitimacy. */
export function meaningfulRegistrationText(
  value: string,
  kind: "name" | "company",
) {
  const text = clean(value);
  if (text.length < 2 || text.length > (kind === "name" ? 120 : 200))
    return false;
  if (
    placeholders.has(text.toLocaleLowerCase()) ||
    /https?:\/\/|www\.|@|[<>\p{Cc}]/u.test(text)
  )
    return false;
  if (
    /(.)\1{4,}/u.test(text) ||
    /^(?:asdf|qwerty|zxcvbn)[\d\W_]*$/iu.test(text)
  )
    return false;
  return kind === "name"
    ? /^[\p{L}\p{M}\s.'’\-]+$/u.test(text) && /\p{L}/u.test(text)
    : /\p{L}/u.test(text);
}

const disposableDomains = new Set([
  "mailinator.com",
  "yopmail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "10minutemail.com",
  "temp-mail.org",
  "tempmail.com",
  "throwawaymail.com",
]);
const exampleDomains = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
]);
export function plausibleRegistrationEmail(value: string) {
  if (!z.string().email().max(254).safeParse(value.trim()).success)
    return false;
  const domain = value.trim().split("@")[1]?.toLowerCase() || "";
  return (
    !disposableDomains.has(domain) &&
    !exampleDomains.has(domain) &&
    !/\.(invalid|test|example|localhost)$/i.test(domain)
  );
}
const commonPasswords = new Set([
  "password123",
  "password123!",
  "1234567890",
  "12345678901",
  "qwerty12345",
  "admin123456",
  "letmein12345",
  "abcdefghij",
]);
export function acceptableRegistrationPassword(value: string) {
  return (
    value.length >= 10 &&
    value.length <= 128 &&
    value.trim().length >= 10 &&
    !commonPasswords.has(value.toLowerCase()) &&
    !/^(.)\1+$/u.test(value)
  );
}

export const registrationDetailsSchema = z
  .object({
    fullName: z
      .string()
      .transform(clean)
      .refine((v) => meaningfulRegistrationText(v, "name"), "nameQuality"),
    email: z
      .string()
      .trim()
      .max(254)
      .refine(plausibleRegistrationEmail, "emailQuality"),
    company: z
      .string()
      .transform(clean)
      .refine(
        (v) => meaningfulRegistrationText(v, "company"),
        "companyQuality",
      ),
    role: z.enum([
      "owner",
      "finance",
      "operations",
      "general-manager",
      "other",
    ]),
    locations: z.enum(["1", "2-5", "6-20", "21-50", "50+"]),
    vertical: z.enum(["restaurant", "hotel"]),
    termsAccepted: z.literal(true),
    website: z
      .string()
      .max(200)
      .default("")
      .refine((v) => !v, "invalid"),
  })
  .strict();

export const registrationFormSchema = registrationDetailsSchema
  .extend({
    password: z
      .string()
      .refine(acceptableRegistrationPassword, "passwordQuality"),
    confirmPassword: z.string(),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword)
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "passwordMismatch",
      });
  });
