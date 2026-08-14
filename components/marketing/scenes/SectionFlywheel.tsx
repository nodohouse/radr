const STEPS = [
  { t: "Detect", d: "Difference found" },
  { t: "Resolve", d: "Human takes action" },
  { t: "Learn", d: "Pattern retained" },
  { t: "Control", d: "Reusable rule" },
  { t: "Catch earlier", d: "Next time, automatic" },
  { t: "Verified value", d: "Proof of impact" },
] as const;

/**
 * Product flywheel — every resolution becomes institutional knowledge.
 */
export function SectionFlywheel() {
  return (
    <section
      className="rx-section rx-dark rx-fly"
      id="flywheel"
      data-nav-theme="dark"
    >
      <div className="rx-shell rx-fly-grid">
        <div>
          <p className="rx-kicker">Flywheel</p>
          <h2 className="rx-display rx-display-sm">
            RADR gets smarter
            <br />
            every time you fix something.
          </h2>
          <p className="rx-lead-inv rx-lead-short">
            Every resolution becomes a reusable control, making the operating
            model stronger over time.
          </p>
        </div>
        <ol className="rx-fly-list">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{s.t}</strong>
                <em>{s.d}</em>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
