"use client";

import { useState } from "react";
import Link from "next/link";
import { getIntelligenceModule } from "@/lib/radr/intelligence/moduleRegistry";
import { renderIntelModule } from "@/components/product/intelligence/renderIntelModule";
import { useIntelligencePinsOptional } from "@/components/product/intelligence/IntelligencePinContext";
import "@/app/intelligence-app.css";

/** Pinned modules below locked Control Center core. */
export function PinnedIntelligenceSection() {
  const pins = useIntelligencePinsOptional();
  const [customize, setCustomize] = useState(false);

  if (!pins) return null;

  if (pins.pins.length === 0) {
    return (
      <section className="rp-ccx-pinned rp-ccx-pinned-empty" aria-label="Your Intelligence">
        <p className="rp-ccx-k">Your Intelligence</p>
        <p className="rp-ccx-quiet">
          Pin intelligence you want to keep close.
        </p>
        <Link href="/app/intelligence" className="rp-intel-dec-link">
          Explore Intelligence →
        </Link>
      </section>
    );
  }

  return (
    <section className="rp-ccx-pinned" aria-label="Your Intelligence">
      <div className="rp-ccx-pinned-head">
        <div>
          <p className="rp-ccx-k">Your Intelligence</p>
          <h2>Pinned</h2>
        </div>
        <div className="rp-ccx-pinned-actions">
          <button
            type="button"
            onClick={() => setCustomize((v) => !v)}
            aria-pressed={customize}
          >
            {customize ? "Done" : "Customize"}
          </button>
          <Link href="/app/intelligence">Browse Intelligence →</Link>
        </div>
      </div>

      <div className="rp-ccx-pinned-grid">
        {pins.pins.map((p) => {
          const def = getIntelligenceModule(p.moduleId);
          if (!def) return null;
          return (
            <div
              key={p.moduleId}
              data-customize={customize ? "true" : undefined}
            >
              {customize ? (
                <div
                  className="rp-ccx-pinned-actions"
                  style={{ marginBottom: "0.45rem" }}
                >
                  <button
                    type="button"
                    onClick={() => pins.reorder(p.moduleId, "up")}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => pins.reorder(p.moduleId, "down")}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      pins.setSize(
                        p.moduleId,
                        p.size === "full"
                          ? "half"
                          : p.size === "half"
                            ? "compact"
                            : "full",
                      )
                    }
                  >
                    Size · {p.size}
                  </button>
                  <button
                    type="button"
                    onClick={() => pins.removePin(p.moduleId)}
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              {renderIntelModule({ ...def, defaultSize: p.size })}
            </div>
          );
        })}
      </div>

      {pins.toast ? (
        <div className="rp-intel-toast" role="status">
          {pins.toast}
        </div>
      ) : null}
    </section>
  );
}
