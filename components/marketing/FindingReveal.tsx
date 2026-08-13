"use client";

import { Delta } from "./Delta";
import { useInView } from "./motion/useInView";

type Row = { label: string; value: string };

type Props = {
  id: string;
  headline: string;
  rows: readonly Row[];
  impact: string;
  cta?: string;
};

export function FindingReveal({
  id,
  headline,
  rows,
  impact,
  cta = "Review",
}: Props) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.35 });

  return (
    <article
      ref={ref}
      className="radr-finding"
      data-on={inView ? "true" : "false"}
    >
      <p className="radr-finding-type">Signal {id}</p>
      <h3 className="radr-finding-headline">{headline}</h3>
      <div className="radr-finding-rows">
        {rows.map((row) => (
          <div key={row.label}>
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
      <p className="radr-finding-impact">
        <Delta value={impact} tone="ink" />
      </p>
      <p className="radr-finding-cta">
        {cta} <span aria-hidden="true">→</span>
      </p>
    </article>
  );
}
