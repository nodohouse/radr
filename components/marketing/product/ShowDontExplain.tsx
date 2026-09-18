import { HOMEPAGE_DEMO } from "@/components/marketing/data/homepageDemo";

const EXAMPLES = [
  {
    key: "buy",
    territory: "BUY",
    title: "Supplier variance",
    money: HOMEPAGE_DEMO.findings.buy.moneyLabel,
    summary: HOMEPAGE_DEMO.findings.buy.summary,
    prepared: HOMEPAGE_DEMO.prepared.buy.ready,
  },
  {
    key: "labor",
    territory: "LABOR",
    title: "Labor peak",
    money: HOMEPAGE_DEMO.findings.labor.moneyLabel,
    summary: HOMEPAGE_DEMO.findings.labor.summary,
    prepared: HOMEPAGE_DEMO.prepared.labor.ready,
  },
  {
    key: "recover",
    territory: "RECOVER",
    title: "Cancellation",
    money: HOMEPAGE_DEMO.findings.recover.moneyLabel,
    summary: HOMEPAGE_DEMO.findings.recover.summary,
    prepared: HOMEPAGE_DEMO.prepared.recover.ready,
  },
] as const;

type Props = {
  /** Optional section heading override */
  title?: string;
  lead?: string;
};

/**
 * Short show-dont-explain demo strip: three operating gaps with
 * money, summary, and prepared next step. Not a capability essay.
 */
export function ShowDontExplain({
  title = "Show, don’t explain.",
  lead = "Three gaps. Evidence and a prepared next step, not a recommendation essay.",
}: Props) {
  return (
    <div className="rx-sde">
      <header className="rx-sde-head">
        <h2>{title}</h2>
        {lead ? <p>{lead}</p> : null}
      </header>
      <ul className="rx-sde-list">
        {EXAMPLES.map((ex) => (
          <li key={ex.key} className="rx-sde-item">
            <em>
              {ex.territory} · {ex.title}
            </em>
            <strong>{ex.money}</strong>
            <p>{ex.summary}</p>
            <span>{ex.prepared}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
