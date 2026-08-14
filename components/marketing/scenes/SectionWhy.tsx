import { BRAND } from "../config/brand";

const ROWS = [
  {
    who: "Traditional BI",
    what: "Shows what happened",
  },
  {
    who: "Alerts",
    what: "Tell you something changed",
  },
  {
    who: "Consultants",
    what: "Find issues periodically",
  },
  {
    who: "RADR",
    what: "Continuously finds the difference, explains the financial impact, drives action, learns and verifies",
    win: true,
  },
] as const;

/**
 * Category differentiation — not another dashboard.
 */
export function SectionWhy() {
  return (
    <section
      className="rx-section rx-dark rx-why"
      id="why"
      data-nav-theme="dark"
    >
      <div className="rx-shell rx-why-grid">
        <div>
          <p className="rx-kicker">Category</p>
          <h2 className="rx-display rx-display-sm">
            Not another
            <br />
            dashboard.
          </h2>
          <p className="rx-lead-inv rx-lead-short">{BRAND.explanation}</p>
        </div>
        <ul className="rx-why-list">
          {ROWS.map((r) => (
            <li key={r.who} data-win={"win" in r && r.win ? "true" : "false"}>
              <em>{r.who}</em>
              <span>{r.what}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rx-shell rx-why-not">
        <p className="rx-kicker">Clarity</p>
        <h3>RADR is not</h3>
        <ul>
          <li>another dashboard</li>
          <li>another alert feed</li>
          <li>another reconciliation project</li>
          <li>another consultant report</li>
        </ul>
        <p>RADR watches the operation continuously.</p>
      </div>
    </section>
  );
}
