"use client";

/**
 * SourceDisagreement — never silently pick the convenient value.
 */

import type { TraceSourceDisagreement } from "@/lib/marketing/decisionTrace/types";
import "@/app/radr-public.css";

export function SourceDisagreement({ data }: { data: TraceSourceDisagreement }) {
  return (
    <div className="rx-src-dis" aria-label={data.title}>
      <p className="rx-dt-k">{data.title}</p>
      <ul className="rx-dt-fields">
        {data.rows.map((r) => (
          <li key={r.source}>
            <span>{r.source}</span>
            <strong>{r.value}</strong>
          </li>
        ))}
        <li data-result="true">
          <span>Difference</span>
          <strong>{data.differenceLabel}</strong>
        </li>
      </ul>
      <p className="rx-dt-prov">Next: {data.nextStep}</p>
    </div>
  );
}
