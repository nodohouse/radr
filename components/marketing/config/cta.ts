/**
 * Canonical marketing CTA destinations.
 * One label → one destination across the site.
 */
export const CTA = {
  /** Primary commercial - product demo */
  seeInAction: { href: "/demo" as const, labelKey: "seeInAction" },
  /** Secondary commercial - sales conversation */
  bookDemo: { href: "/contact" as const, labelKey: "bookDemo" },
  /** Utility auth */
  login: { href: "/login" as const, labelKey: "login" },
  /** Paid packages only — Contact Sales (no free / self-serve start) */
  contactSales: { href: "/contact" as const, labelKey: "contactSales" },
  /** Core / Control / Pilot sales */
  contactPlan: (plan: "pilot" | "core" | "control") =>
    ({ href: `/contact?plan=${plan}` as const }),
} as const;
