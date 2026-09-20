"use client";

/**
 * Quiet breath between hero and pain — one line, no metrics.
 */
export function SectionBreath() {
  return (
    <section className="rx-cinema-breath" data-nav-theme="light">
      <div className="rx-shell rx-cinema-breath-shell">
        <p className="rx-cinema-breath-line">
          One decision.{" "}
          <span className="rx-cinema-breath-tail">
            While it can still change.
          </span>
        </p>
      </div>
    </section>
  );
}
