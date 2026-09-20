/**
 * EvidenceProvenance — thin contract → invoice → … chain.
 */

export type ProvenanceStep = {
  label: string;
  value?: string;
  verified?: boolean;
};

type Props = {
  steps: ProvenanceStep[];
  className?: string;
};

export function EvidenceProvenance({ steps, className = "" }: Props) {
  return (
    <ol className={`rx-ep ${className}`.trim()} aria-label="Evidence path">
      {steps.map((s, i) => (
        <li key={`${s.label}-${i}`} data-tone={s.verified ? "verified" : undefined}>
          <span>{s.label}</span>
          {s.value ? <strong>{s.value}</strong> : null}
          {i < steps.length - 1 ? (
            <span className="rx-ep-sep" aria-hidden="true">
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
