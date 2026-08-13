"use client";

import { useEffect, useState } from "react";
import { DeltaOutline } from "../DeltaOutline";
import { useInView } from "../motion/useInView";

const FINDS = [
  { label: "€84", at: 0.12 },
  { label: "€420", at: 0.28 },
  { label: "€1,240", at: 0.48 },
  { label: "€18,620", at: 0.68 },
  { label: "€142k", at: 0.86 },
] as const;

const TOTALS = [84, 504, 1744, 20364, 162364, 4_200_000] as const;

function formatEuro(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  return `€${n.toLocaleString("en-IE")}`;
}

export function SectionDelta() {
  const { ref, inView, reduced } = useInView<HTMLElement>({ threshold: 0.25 });
  const [demo, setDemo] = useState(0);
  const [findIdx, setFindIdx] = useState(-1);
  const [totalIdx, setTotalIdx] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDemo(3);
      setFindIdx(FINDS.length - 1);
      setTotalIdx(TOTALS.length - 1);
      setVerified(true);
      return;
    }
    setDemo(0);
    setFindIdx(-1);
    setTotalIdx(0);
    setVerified(false);

    const timers = [
      window.setTimeout(() => setDemo(1), 500),
      window.setTimeout(() => setDemo(2), 1200),
      window.setTimeout(() => setDemo(3), 1900),
    ];

    FINDS.forEach((f, i) => {
      timers.push(
        window.setTimeout(() => {
          setFindIdx(i);
          setTotalIdx(i);
        }, 2800 + f.at * 3200),
      );
    });

    timers.push(
      window.setTimeout(() => {
        setTotalIdx(TOTALS.length - 1);
        setVerified(true);
      }, 7200),
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [inView, reduced]);

  const activeFind = findIdx >= 0 ? FINDS[findIdx] : null;
  const total = TOTALS[Math.min(totalIdx, TOTALS.length - 1)]!;

  return (
    <section
      className="radr-section radr-section-light"
      id="difference"
      ref={ref}
    >
      <div className="radr-shell">
        <p className="radr-cat radr-cat-ink">The delta</p>
        <h2 className="radr-h2">
          △ is the
          <br />
          difference.
        </h2>
        <p className="radr-lead">
          Between what happened and what should have happened.
        </p>

        <div className="radr-delta-example" data-phase={demo}>
          <div className="radr-delta-pair">
            <div className="radr-delta-col">
              <span>You agreed to pay</span>
              <strong className="radr-money">€31.20</strong>
            </div>
            <div
              className="radr-delta-col"
              data-shift={demo >= 1 ? "true" : "false"}
            >
              <span>But you paid</span>
              <strong className="radr-money">€34.80</strong>
            </div>
          </div>
          <div
            className="radr-delta-bridge"
            data-on={demo >= 2 ? "true" : "false"}
            aria-hidden="true"
          />
          <div
            className="radr-delta-result"
            data-on={demo >= 2 ? "true" : "false"}
          >
            <span className="radr-tri">△</span>
            <strong className="radr-money">€3.60</strong>
            <em>/ case</em>
          </div>
          <p data-on={demo >= 3 ? "true" : "false"}>
            Across thousands of transactions, small deltas become serious money.
          </p>
        </div>

        <div
          className="radr-delta-accumulate"
          data-on={inView ? "true" : "false"}
        >
          <div className="radr-delta-stage">
            <DeltaOutline
              className="radr-delta-giant"
              animate={!reduced && inView}
              tone="ink"
            />
            {activeFind ? (
              <span
                key={activeFind.label}
                className="radr-delta-find"
                data-on="true"
              >
                {activeFind.label}
              </span>
            ) : null}
            <div
              className="radr-delta-center"
              data-verified={verified ? "true" : "false"}
            >
              <span className="radr-tri">△</span>
              <strong className="radr-money">{formatEuro(total)}</strong>
              {verified ? <em>Verified value</em> : <em>Accumulating</em>}
              <small>Illustrative example</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
