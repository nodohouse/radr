"use client";

import { Delta } from "./Delta";
import { useInView } from "./motion/useInView";

type Props = {
  expectedLabel: string;
  expected: string;
  actualLabel: string;
  actual: string;
  delta: string;
  note?: string;
};

export function DeltaReveal({
  expectedLabel,
  expected,
  actualLabel,
  actual,
  delta,
  note,
}: Props) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });

  return (
    <div
      ref={ref}
      className="radr-delta-reveal"
      data-on={inView ? "true" : "false"}
    >
      <div className="radr-delta-pair">
        <div>
          <p className="radr-mini">{expectedLabel}</p>
          <p className="radr-num">{expected}</p>
        </div>
        <div>
          <p className="radr-mini">{actualLabel}</p>
          <p className="radr-num">{actual}</p>
        </div>
      </div>
      <div className="radr-delta-result">
        <Delta value={delta} />
        {note ? <p className="radr-delta-note">{note}</p> : null}
      </div>
    </div>
  );
}
