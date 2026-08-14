import Link from "next/link";

/** Homepage teaser — full story lives on /how */
export function SectionHow() {
  return (
    <section
      className="rx-section rx-section-tight rx-dark"
      id="how"
      data-nav-theme="dark"
    >
      <div className="rx-shell rx-how-teaser">
        <p className="rx-kicker">How RADR works</p>
        <h2 className="rx-display rx-display-sm">
          From signal
          <br />
          to verified value.
        </h2>
        <p className="rx-lead-inv rx-lead-short">
          Detect. Explain. Act. Learn. Verify — watch one finding travel through
          the full loop.
        </p>
        <ol className="rx-how-teaser-steps" aria-label="RADR loop">
          <li>Detect</li>
          <li>Explain</li>
          <li>Act</li>
          <li>Learn</li>
          <li>Verify</li>
        </ol>
        <div className="rx-ctas">
          <Link href="/how" className="rx-btn rx-btn-primary">
            See the process <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
