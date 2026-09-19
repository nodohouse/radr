"use client";

import { CANON_OTA, CANON_ORPHAN } from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { DEDGE_DIRECT_COST_2025 } from "@/lib/radr/decision/economics";
import { PhotoOverlay } from "@/components/marketing/PhotoOverlay";

/**
 * Hotel + apartment pain — photo scenes, equal weight to restaurant.
 */
export function SectionHospitalityProof() {
  return (
    <section
      className="rx-spine-section rx-scene rx-hosp-pain"
      data-nav-theme="light"
      id="hospitality"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">Same loop</p>
          <h2 className="rx-spine-title">
            Different operations.
            <br />
            Same decision pressure.
          </h2>
        </header>

        <div className="rx-hosp-pain-grid">
          <div>
            <h3 className="rx-hosp-pain-h">A full hotel can still leak profit.</h3>
            <PhotoOverlay
              src=""
              position="62% 40%"
              kicker={`${CANON_OTA.displayId} · ${CANON_OTA.property}`}
              title="89% occupancy looks good."
              lines={[
                { label: "OTA share", value: "+11 pts", tone: "mute" },
                {
                  label: "Distribution drag",
                  value: formatDecisionMoney(CANON_OTA.exposureEuro),
                  tone: "risk",
                },
                { label: "Contribution", value: "−2.1%", tone: "risk" },
                {
                  label: "Verified avoided",
                  value: formatDecisionMoney(CANON_OTA.actualProtectedEuro),
                  tone: "verified",
                },
              ]}
            />
            <p className="rx-pain-punch">
              Occupancy is not the same as economic quality.
            </p>
            <p className="rx-one-source" title={DEDGE_DIRECT_COST_2025.footnote}>
              [3] {DEDGE_DIRECT_COST_2025.footnote}
            </p>
          </div>

          <div>
            <h3 className="rx-hosp-pain-h">Empty nights expire.</h3>
            <PhotoOverlay
              src=""
              position="55% 45%"
              kicker={`${CANON_ORPHAN.displayId} · Chiado`}
              title="One-night orphan gap."
              lines={[
                {
                  label: "72 hours",
                  value: formatDecisionMoney(CANON_ORPHAN.exposureEuro),
                  tone: "risk",
                },
                { label: "48 hours", value: "€98", tone: "mute" },
                { label: "Check-in", value: "€0", tone: "mute" },
                {
                  label: "Recovered",
                  value: formatDecisionMoney(CANON_ORPHAN.actualProtectedEuro),
                  tone: "verified",
                },
              ]}
            />
            <p className="rx-pain-punch">
              Perishable inventory does not wait for the weekly report.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
