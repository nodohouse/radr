import { Metric } from "../Metric";

const metrics = [
  { value: "€4.2M", label: "Verified value · illustrative" },
  { value: "3.8×", label: "ROI model · illustrative" },
  { value: "14 days", label: "To first verified finding · target" },
] as const;

export function SectionProof() {
  return (
    <section className="radr-section" id="proof">
      <div className="radr-shell">
        <p className="radr-kicker">Proof</p>
        <h2 className="radr-h2">
          Economic outcomes,
          <br />
          not vanity metrics.
        </h2>
        <div className="radr-proof">
          {metrics.map((m) => (
            <Metric key={m.value} value={m.value} label={m.label} />
          ))}
        </div>
        <p className="radr-proof-note">
          Placeholders until customer-verified metrics ship. No fabricated claims.
        </p>
      </div>
    </section>
  );
}
