"use client";

import { useTranslations } from "next-intl";

const FINDINGS = [
  {
    id: "buy",
    territory: "BUY",
    title: "Supplier invoice mismatch",
    value: "€1,184",
    label: "recoverable",
    implication: "Matched against contract pricing",
  },
  {
    id: "labor",
    territory: "LABOR",
    title: "Tuesday labor forecast",
    value: "€640",
    label: "overscheduled",
    implication: "Expected demand below rostered staffing",
  },
  {
    id: "recover",
    territory: "RECOVER",
    title: "Late cancellation",
    value: "€286",
    label: "inventory at risk",
    implication: "Table can still be released",
  },
  {
    id: "sell",
    territory: "SELL",
    title: "Delivery commission variance",
    value: "€412",
    label: "discrepancy",
    implication: "Commission exceeds expected rate",
  },
] as const;

/**
 * Operational exceptions with money attached.
 */
export function SectionFindings() {
  const t = useTranslations("homepage.findingsShow");

  return (
    <section className="rx-ed-section rx-ed-findings" data-nav-theme="light" id="findings">
      <div className="rx-shell">
        <header className="rx-ed-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <ul className="rx-ed-finding-grid">
          {FINDINGS.map((f) => (
            <li key={f.id} data-territory={f.territory}>
              <span className="rx-ed-terr">{f.territory}</span>
              <strong>{f.title}</strong>
              <p className="rx-ed-finding-money">
                <em>{f.value}</em> {f.label}
              </p>
              <p className="rx-ed-finding-why">{f.implication}</p>
            </li>
          ))}
        </ul>
        <p className="rx-ed-note">{t("note")}</p>
      </div>
    </section>
  );
}
