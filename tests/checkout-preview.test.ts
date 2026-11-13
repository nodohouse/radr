import { describe, expect, it } from "vitest";
import {
  checkoutCompanySchema,
  parseBasketSelection,
  planCheckoutHref,
} from "@/lib/marketing/checkoutPreview";
import { standardPlanQuote } from "@/lib/marketing/publicPricing";

const company = {
  fullName: "Elena Nord",
  email: "elena@northstar-hospitality.com",
  company: "Northstar Hospitality GmbH",
  registrationNumber: "HRB 45123",
  country: "DE",
  address: "Seestrasse 24",
  city: "Berlin",
  postalCode: "10115",
  vatId: "",
  authorized: true,
};
describe("Checkout preview boundaries", () => {
  it("allows complete international business details without claiming registry verification", () => {
    expect(checkoutCompanySchema.safeParse(company).success).toBe(true);
    expect(
      checkoutCompanySchema.safeParse({
        ...company,
        fullName: "李 明",
        company: "北京酒店有限公司",
        country: "CN",
        city: "北京",
        address: "朝阳路88号",
        postalCode: "100000",
      }).success,
    ).toBe(true);
  });
  it.each([
    "fullName",
    "email",
    "company",
    "registrationNumber",
    "country",
    "address",
    "city",
    "postalCode",
  ])("blocks missing %s", (field) => {
    expect(
      checkoutCompanySchema.safeParse({ ...company, [field]: "" }).success,
    ).toBe(false);
  });
  it("rejects placeholders, invalid email, invalid country/postcode and missing authority", () => {
    for (const changes of [
      { company: "test" },
      { email: "hello@mailinator.com" },
      { email: "hello@example.com" },
      { country: "ZZ" },
      { postalCode: "Berlin" },
      { registrationNumber: "asdf" },
      { authorized: false },
    ])
      expect(
        checkoutCompanySchema.safeParse({ ...company, ...changes }).success,
      ).toBe(false);
    expect(
      checkoutCompanySchema.safeParse({
        ...company,
        country: "NL",
        postalCode: "1012 AB",
      }).success,
    ).toBe(true);
    expect(
      checkoutCompanySchema.safeParse({
        ...company,
        country: "AE",
        postalCode: "",
      }).success,
    ).toBe(true);
  });
  it("never accepts passwords or card data in company details", () => {
    for (const field of ["password", "cardNumber", "cvc", "price"])
      expect(
        checkoutCompanySchema.safeParse({ ...company, [field]: "sensitive" })
          .success,
      ).toBe(false);
  });
  it.each([
    { company: "Test Company GmbH" },
    { company: "Example Ltd" },
    { company: "Northstar\u200b Hospitality" },
    { fullName: "Elena\u202e Nord" },
    { address: "aaaaaa" },
    { address: "https://billing.example" },
    { city: "www.fake-city.com" },
    { registrationNumber: "000-000" },
    { registrationNumber: "11111111" },
    { email: "buyer@sub.mailinator.com" },
    { email: "buyer@sub.example.com" },
    { email: "buyer@sharklasers.com" },
  ])(
    "rejects an obvious placeholder or obscured identity field: %j",
    (changes) => {
      expect(
        checkoutCompanySchema.safeParse({ ...company, ...changes }).success,
      ).toBe(false);
    },
  );
  it("does not mistake a plausible format for proof or reject legitimate names containing test", () => {
    expect(
      checkoutCompanySchema.safeParse({
        ...company,
        company: "Test Kitchen Ltd",
        email: "director@ops.northstar-hospitality.com",
      }).success,
    ).toBe(true);
    // A small operator may legitimately use a public email service. Ownership still needs verification.
    expect(
      checkoutCompanySchema.safeParse({
        ...company,
        email: "elena.nord@gmail.com",
      }).success,
    ).toBe(true);
  });
  it("requires a coherent allowlisted basket rather than repairing a tampered plan silently", () => {
    expect(parseBasketSelection({ plan: "start" })).toEqual({
      plan: "start",
      billing: "annual",
      locations: 1,
    });
    expect(
      parseBasketSelection({
        plan: "expand",
        billing: "monthly",
        locations: "5",
        vertical: "hotel",
      }),
    ).toEqual({
      plan: "expand",
      billing: "monthly",
      locations: 5,
      vertical: "hotel",
    });
    for (const query of [
      {},
      { plan: "unknown" },
      { plan: "start", locations: "2" },
      { plan: "expand", locations: "1" },
      { plan: "expand", locations: "6" },
      { plan: "expand", locations: "2.5" },
      { plan: "start", billing: "weekly" },
    ])
      expect(parseBasketSelection(query)).toBeNull();
    expect(planCheckoutHref("enterprise")).toBe("/contact?plan=enterprise");
    expect(planCheckoutHref("expand", "monthly", 4, "hotel")).toBe(
      "/checkout?plan=expand&billing=monthly&locations=4&vertical=hotel",
    );
  });
  it.each([
    [1, 299, 3588, 2988, 600],
    [2, 478, 5736, 4776, 960],
    [5, 1195, 14340, 11940, 2400],
  ])(
    "prices both 12-month payment options for %i locations",
    (count, monthly, monthlyAnnual, annual, saving) => {
      const yearly = standardPlanQuote(count, "annual")!;
      const instalments = standardPlanQuote(count, "monthly")!;
      expect(yearly.dueOnActivation).toBe(annual);
      expect(yearly.annualSaving).toBe(saving);
      expect(instalments.monthlyTotal).toBe(monthly);
      expect(instalments.dueOnActivation).toBe(monthly);
      expect(instalments.commitmentTotal).toBe(monthlyAnnual);
      expect(instalments.annualSaving).toBe(0);
      expect(instalments.commitmentMonths).toBe(12);
    },
  );
});
