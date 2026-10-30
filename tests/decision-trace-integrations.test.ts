import { describe, expect, it } from "vitest";
import {
  homepageFeaturedSystems,
  CATALOG_COUNT,
  exampleDecisionHrefForSystem,
} from "@/lib/integrations/homepagePresentation";
import { getProvider, INTEGRATION_PROVIDERS } from "@/lib/integrations/registry";
import {
  TRACE_D4102,
  TRACE_D4188,
  getDecisionTrace,
} from "@/lib/marketing/decisionTrace";
import { euro, euroCents, euroRate } from "@/lib/marketing/publicDecisionEconomics";
import { CANON_SUPPLIER, verifiedEuro } from "@/lib/radr/decision/demo/canonical";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("homepage featured integrations", () => {
  it("resolves every featured system from the canonical registry", () => {
    const featured = homepageFeaturedSystems();
    expect(featured.length).toBeGreaterThanOrEqual(12);
    expect(featured.length).toBeLessThanOrEqual(18);
    for (const s of featured) {
      const p = getProvider(s.id);
      expect(p).toBeDefined();
      expect(s.status).toBe(p!.status);
      expect(s.brandColor).toMatch(/^#/);
      expect(s.possibleEvidence.length).toBeGreaterThan(0);
      expect(s.radrUses.length).toBeGreaterThan(0);
    }
  });

  it("does not mark commercial systems available on homepage", () => {
    const commercial = homepageFeaturedSystems().filter(
      (s) => s.id !== "files-csv" && s.id !== "radr-demo-reservations",
    );
    for (const s of commercial) {
      expect(s.status).not.toBe("available");
    }
  });

  it("catalog count matches registry length", () => {
    expect(CATALOG_COUNT).toBe(INTEGRATION_PROVIDERS.length);
  });

  it("finance systems deep-link to D-4102 Trace route", () => {
    expect(exampleDecisionHrefForSystem("xero")).toBe(
      "/product/decisions/D-4102/trace",
    );
  });
});

describe("Decision Trace D-4102", () => {
  it("reproduces variance from contract vs invoice arithmetic", () => {
    const steps = TRACE_D4102.calculation;
    expect(steps.result.amountEuro).toBe(273);
    expect(steps.result.amountEuro).toBe(CANON_SUPPLIER.exposureEuro);
    expect(TRACE_D4102.verification.verifiedEuro).toBe(
      verifiedEuro(CANON_SUPPLIER),
    );
    expect(TRACE_D4102.outcome.differenceEuro).toBe(0);
    expect(TRACE_D4102.outcome.kind).toBe("FULL_SUCCESS");
  });

  it("displays unit rates with cents — never rounds €6.80 to €7", () => {
    expect(euroRate(6.8)).toBe("€6.80/L");
    expect(euroRate(7.45)).toBe("€7.45/L");
    expect(euroRate(0.65)).toBe("€0.65/L");
    expect(euroCents(6.8)).toBe("€6.80");
    expect(euroCents(7.45)).toBe("€7.45");
    expect(euro(273)).toBe("€273");
    expect(420 * 0.65).toBe(273);

    expect(TRACE_D4102.calculation.formulaHuman).toContain("€7.45");
    expect(TRACE_D4102.calculation.formulaHuman).toContain("€6.80");
    expect(TRACE_D4102.calculation.formulaHuman).toContain("€273");
    expect(TRACE_D4102.calculation.formulaHuman).not.toMatch(/€7\/L|€1\/L/);
    expect(TRACE_D4102.calculation.steps.map((s) => s.value).join(" ")).toContain(
      "€6.80/L",
    );
    expect(TRACE_D4102.calculation.steps.map((s) => s.value).join(" ")).toContain(
      "€7.45/L",
    );
    expect(TRACE_D4102.calculation.steps.map((s) => s.value).join(" ")).toContain(
      "€0.65/L",
    );
  });

  it("keeps epistemic grades and no generative economics", () => {
    expect(TRACE_D4102.method.predictiveModelUsed).toBe(false);
    expect(TRACE_D4102.method.generativeEconomicsUsed).toBe(false);
    expect(TRACE_D4102.evidence.every((e) => e.provenance.grade === "OBSERVED")).toBe(
      true,
    );
    expect(TRACE_D4102.calculation.result.grade).toBe("DERIVED");
    expect(TRACE_D4102.verification.strength).toBe("STRONG");
  });

  it("exposes baseline, futures, materiality, and what-could-change", () => {
    expect(TRACE_D4102.baseline.type).toBe("contractual");
    expect(TRACE_D4102.futures.some((f) => f.selected)).toBe(true);
    expect(TRACE_D4102.futures.some((f) => f.id === "do_nothing")).toBe(true);
    expect(TRACE_D4102.whatCouldChange.length).toBeGreaterThan(2);
    expect(TRACE_D4102.materiality?.triggered).toBe(true);
    expect(TRACE_D4102.provenanceSequence.length).toBeGreaterThan(4);
    expect(getDecisionTrace("D-4102")?.displayId).toBe("D-4102");
  });
});

describe("Decision Trace D-4188 miss case", () => {
  it("records expected vs zero verified without claiming success", () => {
    expect(TRACE_D4188.outcome.kind).toBe("RECOMMENDATION_MISSED");
    expect(TRACE_D4188.outcome.expectedEuro).toBe(420);
    expect(TRACE_D4188.outcome.observedEuro).toBe(0);
    expect(TRACE_D4188.verification.verifiedEuro).toBe(0);
    expect(TRACE_D4188.verification.strength).toBe("UNVERIFIED");
    expect(TRACE_D4188.method.generativeEconomicsUsed).toBe(false);
  });
});

describe("Operating Pulse accessibility", () => {
  it("keeps one semantic copy and hides marquee clones", () => {
    const pulse = readFileSync(
      join(process.cwd(), "components/marketing/OperatingPulse.tsx"),
      "utf8",
    );
    expect(pulse).toContain('className="sr-only"');
    expect(pulse).toContain('aria-hidden="true"');
    expect(pulse).toContain("inert");
    expect(pulse).toContain("rx-opulse-track");
    expect(pulse).toContain("usePrefersReducedMotion");
    // Visual loop may duplicate items; semantic list is a single sr-only paragraph.
    expect(pulse.match(/className="sr-only"/g)?.length).toBeGreaterThanOrEqual(
      1,
    );
    expect(pulse).not.toMatch(/rx-opulse-track[^>]*>[\s\S]*?<a\s/);
    expect(pulse).not.toMatch(/rx-opulse-track[^>]*>[\s\S]*?<button/);
  });

  it("respects reduced motion with a static non-animated surface", () => {
    const pulse = readFileSync(
      join(process.cwd(), "components/marketing/OperatingPulse.tsx"),
      "utf8",
    );
    const css = readFileSync(join(process.cwd(), "app/radr.css"), "utf8");
    expect(pulse).toContain('data-reduced="true"');
    expect(pulse).toContain("rx-opulse-static");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(
      /prefers-reduced-motion:\s*reduce[\s\S]*?\.rx-opulse-track[\s\S]*?animation:\s*none/,
    );
  });
});

describe("Futures signature visual", () => {
  it("keeps three trajectories and reserves green for verified only", () => {
    const src = readFileSync(
      join(process.cwd(), "components/marketing/pages/FuturesChapter.tsx"),
      "utf8",
    );
    expect(src).toContain("fut_orphan_wait");
    expect(src).toContain("fut_orphan_discount");
    expect(src).toContain("fut_orphan_ota");
    expect(src).toContain("RADR plan");
    expect(src).toContain("OBSERVED");
    expect(src).toContain("Verified recovered value");
    expect(src).toContain("Model updated");
    expect(src).toContain("setHovered");
    // Qualitative confidence — no pseudo-precise percentage in the detail panel
    expect(src).toContain('"Medium"');
    expect(src).not.toMatch(/\{pick\.confidence\}%/);
    // Selected path must not use verified green stroke.
    expect(src).not.toMatch(/stroke=\{\s*\n?\s*on\s*\n?\s*\?\s*"#00d978"/);
    expect(src).not.toMatch(/fill="#00d978"/);
  });
});

describe("Company environment marquee", () => {
  it("uses uniform photo tiles with now vs next scope and one semantic list", () => {
    const src = readFileSync(
      join(process.cwd(), "components/marketing/pages/CompanyEnvMarquee.tsx"),
      "utf8",
    );
    expect(src).toContain('scope: "now"');
    expect(src).toContain('scope: "next"');
    expect(src).toContain("Supporting now");
    expect(src).toContain("On the map");
    expect(src).toContain("Restaurants & F&B");
    expect(src).toContain("Hospitality groups");
    expect(src).toContain("companyEnvBar");
    expect(src).toContain('aria-hidden="true"');
    expect(src).toContain("inert");
    expect(src).toContain('className="sr-only"');
    // Outer wrapper must NOT also aria-label — only the single semantic <ul>
    expect(src).not.toMatch(
      /className="rx-co2-env-marquee"\s+aria-label=/,
    );
    const nowCount = (src.match(/scope: "now",/g) ?? []).length;
    expect(nowCount).toBe(4);
  });
});

describe("Contact honeypot accessibility", () => {
  it("keeps honeypot inert, off-tab, and out of the accessibility tree", () => {
    const src = readFileSync(
      join(process.cwd(), "components/marketing/ContactForm.tsx"),
      "utf8",
    );
    const css = readFileSync(join(process.cwd(), "app/radr.css"), "utf8");
    expect(src).toContain("rx-contact-honeypot");
    expect(src).toContain('aria-hidden="true"');
    expect(src).toContain("inert");
    expect(src).toContain("tabIndex={-1}");
    expect(src).toContain('name="website"');
    expect(css).toContain(".rx-contact-honeypot");
  });
});

describe("Memory calibration visual", () => {
  it("shows converging uncertainty and Playbook v3 from fixture", () => {
    const src = readFileSync(
      join(
        process.cwd(),
        "components/marketing/pages/MemoryCalibrationChapter.tsx",
      ),
      "utf8",
    );
    expect(src).toContain("14.2%");
    expect(src).toContain("6.8%");
    expect(src).toContain("forecast error");
    expect(src).toContain("envelopePath");
    expect(src).toContain("Playbook v3");
    expect(src).toContain("18 comparable nights");
    expect(src).toContain("CANON_PEAK");
    expect(src).not.toContain("rx-mem-calibrate");
  });
});

describe("Decision Trace route surface", () => {
  it("ships a localized Trace page and View Trace wiring", () => {
    const page = readFileSync(
      join(process.cwd(), "app/[locale]/product/decisions/[id]/trace/page.tsx"),
      "utf8",
    );
    expect(page).toContain("DecisionTrace");
    expect(page).toContain("getDecisionTrace");

    const origin = readFileSync(
      join(
        process.cwd(),
        "components/marketing/kinetic/ConnectionOriginSection.tsx",
      ),
      "utf8",
    );
    expect(origin).toContain("rx-origin-inspector-below");
    expect(origin).toContain("rx-origin-arch");
    expect(origin).not.toContain("rx-origin-inspector-mobile");
    expect(origin).not.toContain("rx-origin-inspector-desk");
    expect(origin).not.toContain("rx-origin-inspector-slot");
    expect(origin).not.toContain("rx-origin-triad");

    const recovery = readFileSync(
      join(
        process.cwd(),
        "components/marketing/scenes/home/RecoveryStoryObject.tsx",
      ),
      "utf8",
    );
    expect(recovery).toContain("DecisionTraceToggle");
  });
});
