/**
 * Linear provenance sequence — evidence → calculation → Decision → proof.
 * Horizontal on desktop, vertical on mobile.
 */

import "@/app/radr-public.css";

type Step = {
  label: string;
  detail: string;
  verified?: boolean;
};

export function ProvenanceSequence({ steps }: { steps: Step[] }) {
  return (
    <ol className="rx-prov-seq" aria-label="Evidence to verification">
      {steps.map((s, i) => (
        <li key={`${s.label}-${i}`} data-verified={s.verified ? "true" : undefined}>
          {i > 0 ? (
            <span className="rx-prov-seq-arrow" aria-hidden="true">
              →
            </span>
          ) : null}
          <div className="rx-prov-seq-body">
            <strong>{s.label}</strong>
            <em>{s.detail}</em>
          </div>
        </li>
      ))}
    </ol>
  );
}
