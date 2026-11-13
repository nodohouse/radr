import { z } from "zod";
import {
  meaningfulRegistrationText,
  plausibleRegistrationEmail,
} from "./registration";
import { billingChoice, type BillingChoice } from "./publicPricing";
import type { DemoWorld, PublicPlanId } from "./conversionJourney";

export type CheckoutPlan = Exclude<PublicPlanId, "enterprise">;
export type BasketSelection = {
  plan: CheckoutPlan;
  billing: BillingChoice;
  locations: number;
  vertical?: DemoWorld;
};

/** Only a plan, payment schedule and location count travel in URLs. Never contact or card data. */
export function planCheckoutHref(
  plan: PublicPlanId,
  billing: BillingChoice = "annual",
  locations = plan === "start" ? 1 : 2,
  vertical?: DemoWorld,
) {
  if (plan === "enterprise") return "/contact?plan=enterprise";
  const query = new URLSearchParams({
    plan,
    billing,
    locations: String(locations),
  });
  if (vertical) query.set("vertical", vertical);
  return `/checkout?${query.toString()}`;
}

export function parseBasketSelection(query: {
  plan?: string;
  billing?: string;
  locations?: string;
  vertical?: string;
}): BasketSelection | null {
  if (query.plan !== "start" && query.plan !== "expand") return null;
  if (
    query.billing &&
    query.billing !== "annual" &&
    query.billing !== "monthly"
  )
    return null;
  const raw = query.locations ?? (query.plan === "start" ? "1" : "2");
  if (!/^\d$/.test(raw)) return null;
  const locations = Number(raw);
  if (query.plan === "start" ? locations !== 1 : locations < 2 || locations > 5)
    return null;
  return {
    plan: query.plan,
    billing: billingChoice(query.billing),
    locations,
    ...(query.vertical === "hotel" || query.vertical === "restaurant"
      ? { vertical: query.vertical }
      : {}),
  };
}

export const COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );
const countries = new Set(COUNTRY_CODES);
const noPostcode = new Set(["AE", "HK", "MO", "QA"]);
const placeholderText = new Set([
  "test",
  "testing",
  "test company",
  "test business",
  "test person",
  "example",
  "example company",
  "sample",
  "sample company",
  "dummy",
  "fake",
  "none",
  "unknown",
  "n a",
  "your name",
  "full name",
  "first last",
  "company name",
  "business name",
  "your company",
  "your business",
  "address",
  "your address",
  "test address",
  "street address",
  "city",
  "asdf",
  "asdfgh",
  "qwerty",
  "lorem ipsum",
]);
const blockedCheckoutDomains = [
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "mailinator.com",
  "yopmail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "10minutemail.com",
  "10minutemail.net",
  "temp-mail.org",
  "temp-mail.io",
  "tempmail.com",
  "throwawaymail.com",
  "sharklasers.com",
  "maildrop.cc",
  "getnada.com",
  "tempail.com",
  "mohmal.com",
  "dispostable.com",
  "mailnesia.com",
  "trashmail.com",
];

/** Conservative format checks, never evidence of identity or company ownership. */
function credibleCheckoutText(value: string) {
  if (
    /[<>\p{Cc}\p{Cf}]/u.test(value) ||
    /https?:\/\/|www\.|@/i.test(value) ||
    /(.)\1{4,}/u.test(value)
  )
    return false;
  const base = value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[.'’/_-]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  const withoutLegalSuffix = base.replace(
    /\s+(?:gmbh|ug|ltd|limited|llc|inc|incorporated|bv|ag|sarl|sas|oy)$/u,
    "",
  );
  return !placeholderText.has(base) && !placeholderText.has(withoutLegalSuffix);
}
export function credibleCheckoutEmail(value: string) {
  if (!plausibleRegistrationEmail(value) || /[\p{Cc}\p{Cf}]/u.test(value))
    return false;
  const domain = value.trim().split("@")[1]?.toLowerCase() || "";
  return !blockedCheckoutDomains.some(
    (blocked) => domain === blocked || domain.endsWith(`.${blocked}`),
  );
}
const text = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .min(min, message)
    .max(max, message)
    .refine(credibleCheckoutText, message);
export const checkoutCompanySchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .refine(
        (v) => meaningfulRegistrationText(v, "name") && credibleCheckoutText(v),
        "Enter your full name.",
      ),
    email: z
      .string()
      .trim()
      .refine(
        credibleCheckoutEmail,
        "Enter a valid business email. Temporary and example addresses are not accepted.",
      ),
    company: z
      .string()
      .trim()
      .refine(
        (v) =>
          meaningfulRegistrationText(v, "company") && credibleCheckoutText(v),
        "Enter your legal business name.",
      ),
    registrationNumber: text(
      3,
      80,
      "Enter your business registration or tax reference.",
    ).refine((v) => {
      const compact = v.replace(/[\s./-]/g, "");
      return (
        /^[\p{L}\p{N}\s./-]+$/u.test(v) &&
        /\p{N}/u.test(v) &&
        !/^(.)\1{3,}$/u.test(compact) &&
        !/^0+$/u.test(compact)
      );
    }, "Use the registration or tax reference issued to your business."),
    country: z
      .string()
      .refine((v) => countries.has(v), "Select your business country."),
    address: text(5, 200, "Enter your billing street address.").refine(
      (v) => /\p{L}/u.test(v),
      "Enter your billing street address.",
    ),
    city: text(2, 100, "Enter your billing city.").refine(
      (v) => /\p{L}/u.test(v),
      "Enter your billing city.",
    ),
    postalCode: z.string().trim().max(20, "Check the postal code."),
    vatId: z
      .string()
      .trim()
      .max(30, "Check the VAT ID.")
      .refine(
        (v) => !v || /^[A-Za-z0-9 .-]{3,30}$/.test(v),
        "Check the VAT ID format.",
      ),
    authorized: z
      .boolean()
      .refine(Boolean, "Confirm you are authorized to act for this business."),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.postalCode && !noPostcode.has(data.country))
      ctx.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: "Enter your billing postal code.",
      });
    const patterns: Record<string, RegExp> = {
      DE: /^\d{5}$/,
      FR: /^\d{5}$/,
      ES: /^\d{5}$/,
      NL: /^\d{4}\s?[A-Z]{2}$/i,
      US: /^\d{5}(?:-\d{4})?$/,
      CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    };
    if (
      data.postalCode &&
      (patterns[data.country]
        ? !patterns[data.country].test(data.postalCode)
        : !/^[\p{L}\p{N}\s-]{2,20}$/u.test(data.postalCode))
    )
      ctx.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: "Check the postal code for this country.",
      });
  });
export type CheckoutCompany = z.infer<typeof checkoutCompanySchema>;
export const emptyCheckoutCompany: CheckoutCompany = {
  fullName: "",
  email: "",
  company: "",
  registrationNumber: "",
  country: "",
  address: "",
  city: "",
  postalCode: "",
  vatId: "",
  authorized: false,
};
