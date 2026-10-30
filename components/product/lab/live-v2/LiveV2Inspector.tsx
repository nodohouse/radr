"use client";

import { motion } from "motion/react";
import type { LiveV2Inspector as InspectorData } from "./liveV2Data";

type Props = {
  data: InspectorData;
  simulating: boolean;
  onClose: () => void;
  onPreview: () => void;
};

export function LiveV2Inspector({
  data,
  simulating,
  onClose,
  onPreview,
}: Props) {
  return (
    <motion.aside
      className="lv2-inspector"
      aria-label={`${data.headline} detail`}
      initial={{ x: 36, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 28, opacity: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="lv2-insp-head">
        <div>
          <h2>{data.headline}</h2>
          <p className="lv2-sev" data-sev={data.severity}>
            <i />
            {data.severityLabel}
          </p>
        </div>
        <button
          type="button"
          className="lv2-insp-close"
          onClick={onClose}
          aria-label="Close inspector"
        >
          ×
        </button>
      </header>

      <ul className="lv2-metrics">
        {data.metrics.map((m) => (
          <li key={m.label}>
            <span>{m.label}</span>
            <strong>
              {simulating && m.after ? m.after : m.value}
              {simulating && m.after ? <em>← {m.value}</em> : null}
            </strong>
          </li>
        ))}
      </ul>

      <section>
        <p className="lv2-k">Cross-system read</p>
        <p className="lv2-body">{data.radrSees}</p>
      </section>

      <section className="lv2-decision">
        {simulating ? <span className="lv2-sim-badge">Simulated fork</span> : null}
        <p className="lv2-k">Prepared Decision</p>
        <h3>{data.decision}</h3>

        <ul className="lv2-expected">
          {data.expected.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong data-sim={simulating ? "true" : undefined}>
                {row.before}
                <em> → {row.after}</em>
              </strong>
            </li>
          ))}
        </ul>

        <p className="lv2-value">{data.expectedValue}</p>
        {data.confidence ? (
          <p className="lv2-body">{data.confidence}</p>
        ) : null}

        <div className="lv2-actions">
          <button
            type="button"
            className="lv2-btn"
            data-primary="true"
            onClick={onPreview}
            disabled={simulating}
          >
            {simulating ? "Simulating…" : "Preview impact"}
          </button>
          <button type="button" className="lv2-btn">
            Review Decision
          </button>
        </div>
        <p className="lv2-insp-hint">
          Preview shows the service fork on the floor — GM lens on operations,
          CFO lens on contribution. Same throttle, different proof.
        </p>
      </section>
    </motion.aside>
  );
}
