type BreakdownRow = {
  label: string;
  value: string;
  pct: number;
};

type Props = {
  kicker: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryValue: string;
  primaryPeriod?: string;
  meta: { label: string; value: string | number }[];
  breakdown: BreakdownRow[];
  totalLabel?: string;
  totalValue?: string;
};

export function TerritoryIntel({
  kicker,
  title,
  subtitle,
  primaryLabel,
  primaryValue,
  primaryPeriod,
  meta,
  breakdown,
  totalLabel = "Total",
  totalValue,
}: Props) {
  return (
    <div>
      <p className="rp-kicker">{kicker}</p>
      <h1 className="rp-title">{title}</h1>
      <p className="rp-sub">{subtitle}</p>

      <div className="rp-intel">
        <div className="rp-intel-top">
          <div className="rp-intel-value">
            <p className="rp-kicker">{primaryLabel}</p>
            <strong className="rp-money">
              {primaryValue}
              {primaryPeriod ? (
                <span className="rp-period">{primaryPeriod}</span>
              ) : null}
            </strong>
            <ul className="rp-intel-meta">
              {meta.map((m) => (
                <li key={m.label}>
                  <strong>{m.value}</strong> {m.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="rp-breakdown">
          {breakdown.map((row) => (
            <li key={row.label}>
              <div className="rp-breakdown-label">
                <span>{row.label}</span>
                <strong className="rp-money">{row.value}</strong>
              </div>
              <div className="rp-breakdown-bar" aria-hidden="true">
                <i style={{ width: `${Math.max(6, Math.min(100, row.pct))}%` }} />
              </div>
            </li>
          ))}
        </ul>
        {totalValue ? (
          <div className="rp-breakdown-total">
            <span>{totalLabel}</span>
            <strong className="rp-money">{totalValue}</strong>
          </div>
        ) : null}
      </div>
    </div>
  );
}
