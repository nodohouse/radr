import { RadrWordmark } from "../RadrWordmark";

const nodes = [
  "PMS",
  "POS",
  "Procurement",
  "Workforce",
  "Accounting",
  "Payments",
  "Delivery",
  "Revenue",
] as const;

export function SectionSystem() {
  return (
    <section
      className="rx-section rx-section-tight rx-dark"
      id="system"
      data-nav-theme="dark"
    >
      <div className="rx-shell rx-system">
        <div>
          <p className="rx-kicker">Architecture</p>
          <h2 className="rx-display rx-display-sm">
            Your stack.
            <br />
            On RADR.
          </h2>
          <p className="rx-lead-inv rx-lead-short">
            RADR watches the economics between the systems you already run —
            then turns differences into verified value.
          </p>
        </div>
        <div className="rx-system-board">
          <ul>
            {nodes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <div className="rx-system-hub">
            <RadrWordmark size="md" />
            <p>Detect · Explain · Act · Learn · Verify</p>
            <strong className="rx-system-hub-out">Verified value</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
