import { IntegrationNode } from "../IntegrationNode";
import { RadrLogo } from "../RadrLogo";

const nodes = [
  "PMS",
  "POS",
  "Procurement",
  "Workforce",
  "Accounting",
  "Payments",
  "Delivery",
  "Revenue Management",
] as const;

export function SectionSystem() {
  return (
    <section className="radr-section radr-section-light" id="system">
      <div className="radr-shell">
        <p className="radr-cat radr-cat-ink">System</p>
        <h2 className="radr-h2">
          Don&apos;t replace
          <br />
          your stack.
        </h2>
        <div className="radr-system">
          <div className="radr-system-hub" aria-label="Connected systems">
            {nodes.map((n) => (
              <IntegrationNode key={n}>{n}</IntegrationNode>
            ))}
          </div>
          <div className="radr-system-center">
            <RadrLogo size="md" />
            <p>
              RADR connects fragmented operational and financial systems — then
              watches the economics between them.
            </p>
            <p className="line">Don&apos;t replace your stack. Put it on RADR.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
