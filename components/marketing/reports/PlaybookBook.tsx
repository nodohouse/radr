"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { HOSPITALITY_REPORT as report } from "@/lib/marketing/report";
import "./playbook-book.css";

/** Real published pages in a decorative CSS 3D book. No fabricated report content. */
export function PlaybookBook({ href = report.path }: { href?: string }) {
  const stage = useRef<HTMLElement>(null);
  const inView = useInView(stage, { amount: 0.15 });
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    setReady(true);
    const sync = () => setVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  const running = ready && inView && visible && !paused && !reduced;
  return (
    <figure
      ref={stage}
      className="rpb-figure"
      data-running={running ? "true" : "false"}
      data-ready={ready ? "true" : undefined}
    >
      <Link
        href={href}
        className="rpb-stage"
        aria-label="Preview the Hospitality Decision Playbook and request the PDF"
      >
        <div className="rpb-halo" aria-hidden="true" />
        <div className="rpb-shadow" aria-hidden="true" />
        <div className="rpb-book" aria-hidden="true">
          <div className="rpb-back-cover" />
          <div className="rpb-page-block" />
          <div className="rpb-page rpb-worksheet">
            <Image
              src="/marketing/reports/playbook-worksheet-preview.png"
              alt=""
              fill
              loading="eager"
              sizes="250px"
            />
            <span className="rpb-page-edge" />
          </div>
          <div className="rpb-cover">
            <div className="rpb-cover-outside">
              <Image
                src="/marketing/reports/playbook-cover-preview.png"
                alt=""
                fill
                loading="eager"
                sizes="(max-width:760px) 210px, 280px"
              />
              <i />
            </div>
            <div className="rpb-cover-inside">
              <Image
                src="/marketing/reports/playbook-research-preview.png"
                alt=""
                fill
                loading="eager"
                sizes="250px"
              />
              <span className="rpb-page-edge" />
            </div>
          </div>
          <div className="rpb-spine" />
        </div>
      </Link>
      <span className="rpb-edition" aria-hidden="true">
        RADR EDITORIAL <i /> {report.edition}
      </span>
      <figcaption>
        <span>Actual pages. A closer look inside.</span>
        {ready && !reduced ? (
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            aria-label={
              paused ? "Resume book animation" : "Pause book animation"
            }
          >
            {paused ? "Resume motion" : "Pause motion"}
            <span
              aria-hidden="true"
              className={paused ? "rpb-resume-icon" : "rpb-pause-icon"}
            />
          </button>
        ) : (
          <span>Research · decision worksheet</span>
        )}
      </figcaption>
    </figure>
  );
}
