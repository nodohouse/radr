"use client";

import type { HiddenSignal } from "@/lib/radr/domain/hiddenSignal";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";

type Props = {
  title: string;
  signals: HiddenSignal[];
  /** cockpit = timely; insights = structural / monthly */
  tone?: "cockpit" | "insights";
};

/**
 * Compact HiddenSignal rail — meaning across systems, not vanity metrics.
 */
export function HiddenSignalStrip({
  title,
  signals,
  tone = "insights",
}: Props) {
  if (signals.length === 0) return null;

  return (
    <section
      className="rp-hidden-strip"
      data-tone={tone}
      aria-label={title}
    >
      <header className="rp-hidden-strip-head">
        <p className="rp-hidden-strip-kicker">{title}</p>
        <p className="rp-hidden-strip-note">
          Cross-system · evidence required
        </p>
      </header>
      <ul className="rp-hidden-strip-list">
        {signals.map((s) => (
          <li key={s.id}>
            <p className="rp-hidden-strip-horizon">{s.horizon.replace("_", " ")}</p>
            <h3>{s.headline}</h3>
            <p>{s.whyMatters}</p>
            {s.valueAmount != null ? (
              <p className="rp-hidden-strip-value">
                <strong
                  data-positive={s.valuePositive ? "true" : undefined}
                >
                  {formatFindingEuro(s.valueAmount)}
                </strong>
                <span>{s.valueLabel}</span>
              </p>
            ) : null}
            <p className="rp-hidden-strip-rec">{s.recommendation}</p>
            <p className="rp-hidden-strip-sys">
              {s.systemsJoined.join(" · ")}
              {" · "}
              {s.epistemic.replace(/_/g, " ").toLowerCase()}
              {s.sampleSize != null ? ` · n=${s.sampleSize}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
