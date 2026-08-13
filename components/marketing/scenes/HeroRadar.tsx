"use client";

import { useEffect, useState } from "react";
import { Radar } from "../Radar";
import { RadrWordmark } from "../RadrWordmark";
import { Typewriter } from "../Typewriter";

const DEMO_TOTAL = "€176,740";

export function HeroRadar() {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    // Money must appear ~1.5–2s into load — do not wait for full typewriter
    const id = window.setTimeout(() => setArmed(true), 800);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section className="radr-hero" id="product" data-nav-theme="dark">
      <div className="radr-hero-grid">
        <div className="radr-hero-copy">
          <RadrWordmark size="hero" as="p" animate />
          <p className="radr-cat radr-hero-cat">Margin intelligence</p>
          <h1 className="radr-hero-title">
            Nothing off
            <br />
            the RADR.
          </h1>

          <Typewriter className="radr-hero-type" delay={450} speed={27} loop />

          <div className="radr-ctas">
            <a href="#coverage" className="radr-btn radr-btn-primary">
              See what RADR finds{" "}
              <span className="radr-btn-arrow" aria-hidden="true">
                →
              </span>
              <span className="radr-btn-delta" aria-hidden="true">
                △
              </span>
            </a>
            <a href="#how" className="radr-btn radr-btn-ghost">
              How RADR works
            </a>
          </div>

          <p className="radr-hero-live-line" aria-hidden="true">
            <span className="radr-live-dot" />
            <span>LIVE</span>
            <span className="radr-hero-live-sep">/</span>
            <span>DEMO</span>
          </p>
        </div>

        <div className="radr-hero-radar">
          <Radar armSignals={armed} />
        </div>
      </div>

      <div className="radr-hero-strip" aria-hidden="true">
        <div className="radr-shell radr-hero-strip-inner">
          <span className="radr-hero-strip-label">Demo scan</span>
          <span>
            <em>4</em> signals
          </span>
          <span className="radr-hero-strip-value">
            <span className="radr-tri">△</span>{" "}
            <strong className="radr-money">{DEMO_TOTAL}</strong>
            <i> identified</i>
          </span>
          <span>
            <em>18</em> locations
          </span>
        </div>
      </div>

      <p className="sr-only">
        Live demo: RADR finds money continuously. Illustrative total{" "}
        {DEMO_TOTAL} identified across 18 locations.
      </p>
    </section>
  );
}
