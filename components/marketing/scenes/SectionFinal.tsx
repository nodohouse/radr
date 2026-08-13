"use client";

import Link from "next/link";
import { useState } from "react";

export function SectionFinal() {
  const [hot, setHot] = useState(false);

  return (
    <section className="radr-final" data-nav-theme="dark">
      <div className="radr-final-geo" aria-hidden="true">
        <div className="radr-final-sweep" />
      </div>
      <div className="radr-shell radr-final-inner">
        <h2 className="radr-final-title">
          What&apos;s off
          <br />
          your RADR?
        </h2>
        <div className="radr-final-cta-wrap">
          <span
            className="radr-final-ping"
            data-on={hot ? "true" : "false"}
            aria-hidden="true"
          >
            <i />
            <span className="radr-tri">△</span>
          </span>
          <Link
            href="/signup"
            className="radr-btn radr-btn-primary"
            onMouseEnter={() => setHot(true)}
            onMouseLeave={() => setHot(false)}
            onFocus={() => setHot(true)}
            onBlur={() => setHot(false)}
          >
            Find out{" "}
            <span className="radr-btn-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
