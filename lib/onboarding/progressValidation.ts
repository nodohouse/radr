import { validName, validTimezone } from "./requiredFields";
import { onboardingSchema } from "@/lib/validation";
import type { OnboardingState } from "./types";

/** UI progress is untrusted; prerequisites are checked against merged workspace state. */
export function progressError(
  state: Partial<OnboardingState>,
  step: string | undefined,
  hasVerifiedAnalysis: boolean,
) {
  const order = [
    "who",
    "organization",
    "location",
    "goal",
    "evidence",
    "upload",
    "mapping",
    "data_health",
    "analyzing",
    "reveal",
    "complete",
    "done",
  ];
  const index = order.indexOf(step || "");
  if (index < 1) return null;
  if (!validName(state.fullName || "") || !state.roleLens)
    return "Add your full name and role before continuing.";
  if (index < 2) return null;
  if (
    !validName(state.organizationName || "") ||
    !state.industry ||
    !state.locationBand ||
    (!state.reportingCurrency && !state.currency)
  )
    return "Complete your organization, industry, location count, and reporting currency.";
  if (index < 3) return null;
  const parsed = onboardingSchema.safeParse({
    path: "first_value",
    fullName: state.fullName,
    roleLens: state.roleLens,
    industry: state.industry,
    organizationName: state.organizationName,
    locationBand: state.locationBand,
    locationName: state.locationName,
    locationCity: state.locationCity,
    country: state.locationCountry || state.hqCountry,
    currency: state.reportingCurrency || state.currency,
    timezone: state.locationTimezone || state.timezone,
  });
  if (
    !parsed.success ||
    !validTimezone(state.locationTimezone || state.timezone || "")
  )
    return "Complete the first location, city, country, currency, and timezone.";
  if (index < 4) return null;
  if (state.decisionClass !== "supplier_ap")
    return "Choose an available first Decision class.";
  if (index >= 5 && !state.evidenceMethod)
    return "Choose how to provide evidence.";
  if (
    index >= 9 &&
    !hasVerifiedAnalysis &&
    !(state.demoEnabled && state.evidenceMethod === "demo")
  )
    return "Analyze your evidence or explicitly choose the demo before finishing setup.";
  return null;
}
