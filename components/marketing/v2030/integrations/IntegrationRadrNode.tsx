/**
 * Connect-section central RADR — operating context, not another integration.
 */

import { RadrMarkNode } from "@/components/brand/RadrMarkNode";

const CONTEXT = ["Demand", "Labor", "Capacity", "Inventory", "Economics"] as const;
const PROCESS = ["Normalize", "Contextualize", "Compare", "Decide"] as const;

type Props = {
  className?: string;
  label?: string;
};

export function IntegrationRadrNode({
  className = "",
  label = "Operating context",
}: Props) {
  return (
    <div className={`rx-irn rx-irn--premium ${className}`.trim()} aria-hidden="true">
      <div className="rx-irn-face">
        <RadrMarkNode theme="light" priority />
      </div>
      <p className="rx-irn-label">{label}</p>
      <ul className="rx-irn-context">
        {CONTEXT.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <ol className="rx-irn-process">
        {PROCESS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <p className="rx-irn-flow">
        <span data-tone="blue">Your systems</span>
        <span aria-hidden>→</span>
        <span>RADR</span>
        <span aria-hidden>→</span>
        <span data-tone="green">Decision layer</span>
      </p>
    </div>
  );
}
