"use client";

/**
 * Public Futures — D-1911 peak.
 * Light mineral marketing experience. Not product UI. Not /app.
 */

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { demoSignupHref } from "@/lib/marketing/demoAccess";
import { ECON_D1911 } from "@/lib/marketing/publicDecisionEconomics";
import "@/app/product-chapters.css";
import "@/app/home.css";
import "@/app/radr-public.css";
import "@/app/futures-public.css";

type FutureId = "wait" | "seat" | "throttle";

const FUTURES: {
  id: FutureId;
  label: string;
  value: string;
  note: string;
  preferred: boolean;
  span: number;
}[] = [
  {
    id: "wait",
    label: "Pace seating 12 min",
    value: "+$620",
    note: "Protect contribution · reversible",
    preferred: true,
    span: 1,
  },
  {
    id: "seat",
    label: "Seat now",
    value: "+$410",
    note: "Fills fast · kitchen risk",
    preferred: false,
    span: 0.66,
  },
  {
    id: "throttle",
    label: "Throttle delivery",
    value: "+$470",
    note: "Safer volume · less contribution",
    preferred: false,
    span: 0.76,
  },
];

const SIGNALS = [
  { label: "38 inbound", detail: "covers arriving" },
  { label: "Delivery +31%", detail: "vs plan" },
  { label: "Kitchen 92 → 97%", detail: "pressure rising" },
];

export function FuturesChapter() {
  const [selected, setSelected] = useState<FutureId>("wait");
  const pick = useMemo(
    () => FUTURES.find((f) => f.id === selected) ?? FUTURES[0]!,
    [selected],
  );

  return (
    <div className="radr radr-mineral rx-ch rx-ch-light rx-fut-pub">
      <SiteNav />
      <main>
        <section className="rx-fut-pub-hero" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-fut-pub-kicker">
              Futures · D-1911 · Soho · New York · Dinner · DEMO
            </p>
            <h1 className="rx-fut-pub-title">PACE NEXT SEATING WAVE · 12 MIN</h1>
            <p className="rx-fut-pub-econ">
              <strong>+$620</strong>
              <span>expected contribution</span>
            </p>
            <p className="rx-fut-pub-lead">
              Compare paths before you act. Same Decision architecture —
              different outcomes.
            </p>

            <ul className="rx-fut-pub-signals" aria-label="Why now">
              {SIGNALS.map((s) => (
                <li key={s.label}>
                  <strong>{s.label}</strong>
                  <span>{s.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="rx-fut-pub-compare"
          data-nav-theme="light"
          aria-labelledby="rx-fut-compare-title"
        >
          <div className="rx-shell">
            <p className="rx-fut-pub-kicker" id="rx-fut-compare-title">
              Compare Futures
            </p>
            <h2 className="rx-fut-pub-h2">Three paths. One recommendation.</h2>

            <ul className="rx-fut-pub-paths" role="listbox" aria-label="Futures">
              {FUTURES.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected === f.id}
                    data-preferred={f.preferred ? "true" : undefined}
                    data-on={selected === f.id ? "true" : undefined}
                    className="rx-fut-pub-path"
                    style={{ ["--span" as string]: String(f.span) }}
                    onClick={() => setSelected(f.id)}
                  >
                    <div className="rx-fut-pub-path-top">
                      <span className="rx-fut-pub-path-lab">
                        {f.label}
                        {f.preferred ? (
                          <em>Recommended</em>
                        ) : null}
                      </span>
                      <strong>{f.value}</strong>
                    </div>
                    <span className="rx-fut-pub-track" aria-hidden="true">
                      <svg viewBox="0 0 240 14" preserveAspectRatio="none">
                        <path d="M0 11 C 48 11, 84 3, 132 5 S 200 12, 240 4" />
                      </svg>
                    </span>
                    <p>{f.note}</p>
                  </button>
                </li>
              ))}
            </ul>

            <div className="rx-fut-pub-detail" aria-live="polite">
              <p className="rx-fut-pub-selected">
                Selected · {pick.label}
                {pick.preferred ? " · recommended" : ""}
              </p>
              <dl className="rx-fut-pub-meta">
                <div>
                  <dt>No-action baseline</dt>
                  <dd>Seat pressure · kitchen stays elevated · second turn burns</dd>
                </div>
                <div>
                  <dt>Expected effect</dt>
                  <dd>
                    {pick.value} contribution vs seat-now path
                  </dd>
                </div>
                <div>
                  <dt>Key assumption</dt>
                  <dd>
                    Holding ~12 minutes does not lose VIP / allergy exceptions
                  </dd>
                </div>
                <div>
                  <dt>What would change the recommendation</dt>
                  <dd>
                    Kitchen recovers below 85% · inbound drops · VIP hard seat
                    constraint
                  </dd>
                </div>
              </dl>
              <p className="rx-fut-pub-proof">
                After the night: observed{" "}
                {ECON_D1911.observed > 0 ? `$${ECON_D1911.observed}` : "—"} ·
                verified protected ${ECON_D1911.verified} · Memory V3.
              </p>
            </div>

            <div className="rx-he-ctas rx-fut-pub-ctas">
              <Link
                href={demoSignupHref()}
                className="rx-btn rx-btn-primary"
              >
                See the full Decision in RADR <span aria-hidden="true">→</span>
              </Link>
              <Link href="/product/value" className="rx-btn rx-btn-ghost">
                See Verified Value
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
