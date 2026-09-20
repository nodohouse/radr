"use server";

import { z } from "zod";
import { COMPANY, contactEmail } from "@/components/marketing/config/company";

const schema = z.object({
  email: z.string().email().max(200),
  company: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(60),
  locations: z.string().trim().max(40).optional().or(z.literal("")),
  industry: z.string().trim().max(60).optional().or(z.literal("")),
  interest: z.string().trim().min(1).max(60),
  plan: z.enum(["pilot", "core", "control"]).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ContactResult =
  | { ok: true; mode: "webhook" }
  | { ok: true; mode: "mailto"; mailto: string }
  | { ok: false; error: string };

/**
 * Contact inquiry: never silently drops.
 * Prefer CONTACT_WEBHOOK_URL; otherwise build a mailto to the configured inbox.
 */
export async function submitContactInquiry(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  const website = String(formData.get("website") ?? "").trim();
  if (website) {
    return { ok: false, error: "Please complete the required fields before submitting." };
  }

  const planRaw = String(formData.get("plan") ?? "").trim();
  const plan =
    planRaw === "pilot" || planRaw === "core" || planRaw === "control"
      ? planRaw
      : "";
  const parsed = schema.safeParse({
    email: formData.get("email"),
    company: formData.get("company"),
    role: formData.get("role") ?? "",
    locations: formData.get("locations") ?? "",
    industry: formData.get("industry") ?? "",
    interest: formData.get("interest") ?? "",
    plan,
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please complete the required fields before submitting.",
    };
  }

  const payload = {
    ...parsed.data,
    plan: parsed.data.plan || undefined,
    source: "radr-marketing-contact",
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.CONTACT_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return {
          ok: false,
          error: "Could not deliver your message. Please try again shortly.",
        };
      }
      return { ok: true, mode: "webhook" };
    } catch {
      return {
        ok: false,
        error: "Could not deliver your message. Please try again shortly.",
      };
    }
  }

  const inbox = contactEmail();
  if (inbox) {
    const planLabel =
      payload.plan === "pilot"
        ? "Recovery Pilot"
        : payload.plan === "core"
          ? "Expand"
          : payload.plan === "control"
            ? "Enterprise"
            : null;
    const subject = encodeURIComponent(
      planLabel
        ? `RADR sales (${planLabel}): ${payload.company}`
        : `RADR sales: ${payload.company}`,
    );
    const body = encodeURIComponent(
      [
        `Work email: ${payload.email}`,
        `Company: ${payload.company}`,
        `Role: ${payload.role}`,
        `Locations / units: ${payload.locations || "—"}`,
        `Industry: ${payload.industry || "—"}`,
        `Interest: ${payload.interest}`,
        planLabel ? `Package: ${planLabel}` : null,
        "",
        payload.message || "(no message)",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return {
      ok: true,
      mode: "mailto",
      mailto: `mailto:${inbox}?subject=${subject}&body=${body}`,
    };
  }

  return {
    ok: false,
    error:
      COMPANY.brandName +
      " contact delivery is not configured yet. Please check back shortly. We will not silently discard your message.",
  };
}
