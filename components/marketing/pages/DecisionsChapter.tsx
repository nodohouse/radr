"use client";

/**
 * Decisions — one integrated Decision object. Not Act 1 / Act 2 slides.
 */

import NextLink from "next/link";
import {
  CANON_OTA,
  formatCanonVariance,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CTAS } from "@/lib/marketing/brand";
import { VerifiedStamp } from "@/components/marketing/primitives/VerifiedStamp";
import { EvidenceProvenance } from "@/components/marketing/primitives/EvidenceProvenance";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

export function DecisionsChapter() {
  const d = CANON_OTA;
  const rec = d.scenarios.find((s) => s.recommended) ?? d.scenarios[0]!;

  return (
    <main className="rx-ch-main">
      <section className="rx-ch-hero" data-nav-theme="light">
        <div className="rx-shell">
          <p className="rx-ch-kicker">
            Platform · Decisions · Historical · {d.displayId} · DEMO
          </p>
          <h1 className="rx-ch-title">
            One Decision.
            <br />
            The operating unit of RADR.
          </h1>
        </div>
      </section>

      <section className="rx-ch-body" data-nav-theme="light">
        <div className="rx-shell">
          <article className="rx-dec-record">
            <header className="rx-dec-record-head">
              <div>
                <p className="rx-pub-micro">
                  {d.displayId} · {d.property}
                </p>
                <h2 className="rx-dec-record-title">{d.title}</h2>
                <p className="rx-dec-record-class">Premium inventory</p>
              </div>
              <div className="rx-dec-record-amount" data-tone="exposure">
                <strong>{formatDecisionMoney(d.exposureEuro)}</strong>
                <em>At risk</em>
              </div>
            </header>

            <VerifiedStamp
              verified
              label="Historical · verified protected"
              pendingLabel="Recommendation ready"
            />

            <dl className="rx-dec-record-grid">
              <div>
                <dt>Why now</dt>
                <dd>{d.problemLine}</dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>
                  <EvidenceProvenance
                    steps={d.sources.slice(0, 4).map((s) => ({
                      label: s.name,
                      value: s.freshness,
                    }))}
                  />
                </dd>
              </div>
              <div>
                <dt>No-action baseline</dt>
                <dd>
                  {
                    d.scenarios.find((s) => s.isNoAction)?.note ??
                    "OTA fill · commission stands"
                  }
                </dd>
              </div>
              <div>
                <dt>Futures</dt>
                <dd>
                  <ul className="rx-dec-record-futures">
                    {d.scenarios.map((s) => (
                      <li
                        key={s.id}
                        data-rec={s.recommended ? "true" : undefined}
                      >
                        <span>{s.title}</span>
                        <strong>
                          {formatDecisionMoney(
                            s.expectedContributionEuro ?? 0,
                          )}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Recommended action</dt>
                <dd>
                  {rec.title}
                  <br />
                  <span>{rec.note}</span>
                </dd>
              </div>
              <div>
                <dt>Owner · Deadline</dt>
                <dd>
                  Revenue · {d.deadline}
                </dd>
              </div>
              <div>
                <dt>Outcome</dt>
                <dd>
                  Observed {formatDecisionMoney(d.actualProtectedEuro)} ·{" "}
                  {formatCanonVariance(d)} vs expected
                </dd>
              </div>
              <div>
                <dt>Verification</dt>
                <dd>
                  {formatDecisionMoney(d.actualProtectedEuro)} verified{" "}
                  {d.verifiedKind} · {d.attributionStrength.replaceAll("_", " ")}
                </dd>
              </div>
              <div>
                <dt>Memory</dt>
                <dd>{d.learning.lesson}</dd>
              </div>
            </dl>
          </article>

          <div className="rx-ch-ctas" style={{ marginTop: "2.5rem" }}>
            <NextLink href="/product/memory" className="rx-btn rx-btn-primary">
              Operating Memory <span aria-hidden="true">→</span>
            </NextLink>
            <NextLink href="/demo" className="rx-btn rx-btn-ghost">
              {CTAS.primaryProduct}
            </NextLink>
          </div>
        </div>
      </section>
    </main>
  );
}
