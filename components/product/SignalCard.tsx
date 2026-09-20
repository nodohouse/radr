import Link from "next/link";
import {
  formatEuro,
  locationById,
  statusLabel,
} from "@/lib/product/demo/catalog";
import type { Signal } from "@/lib/product/types";
import { DeltaMark } from "@/components/radr/DeltaMark";
import { TextSep } from "@/components/TextSep";

function periodLabel(period: string) {
  const cleaned = period.trim();
  if (!cleaned) return null;
  if (cleaned.startsWith("/")) return cleaned;
  return cleaned;
}

type Props = {
  signal: Signal;
  index?: number;
  /** Always show compare + why (e.g. dense territory lists) */
  expanded?: boolean;
};

export function SignalCard({ signal, index, expanded }: Props) {
  const loc = locationById(signal.locationId);
  const period = periodLabel(signal.period);
  const where = [signal.subject, loc?.name].filter(Boolean).join(" · ");

  return (
    <Link href={`/app/findings/${signal.id}`} className="rp-signal-card">
      <div className="rp-signal-card-top">
        <span className="rp-signal-card-meta">
          {index != null
            ? `${String(index + 1).padStart(2, "0")} / ${signal.area.toUpperCase()}`
            : signal.area.toUpperCase()}
        </span>
        <strong className="rp-money">
          <DeltaMark size="sm" tone="positive" className="rp-tri" />{" "}
          {signal.impactLabel}
          {period ? <span className="rp-period">{period}</span> : null}
        </strong>
      </div>
      <h3>{signal.title}</h3>
      {where ? <p className="rp-signal-card-meta">{where}</p> : null}

      <div
        className={
          expanded ? "rp-signal-detail rp-signal-detail-open" : "rp-signal-detail"
        }
      >
        <div className="rp-signal-compare">
          <div>
            <em>{signal.actual.label}</em>
            <TextSep>: </TextSep>
            <strong>{signal.actual.value}</strong>
          </div>
          <div>
            <em>{signal.expected.label}</em>
            <TextSep>: </TextSep>
            <strong>{signal.expected.value}</strong>
          </div>
          <div>
            <em>Delta</em>
            <TextSep>: </TextSep>
            <strong>
              <DeltaMark size="sm" tone="positive" className="rp-tri" />{" "}
              {signal.delta}
            </strong>
          </div>
        </div>
        <p className="rp-signal-why">{signal.why}</p>
      </div>

      <div className="rp-signal-card-foot">
        <span className="rp-status">{statusLabel(signal.status)}</span>
        <TextSep />
        <span>{signal.detectedAt}</span>
        <TextSep />
        <span>Owner · {signal.ownerName}</span>
        <TextSep />
        <span className="rp-signal-cta">Review →</span>
      </div>
    </Link>
  );
}

export function MoneyLabel({
  amount,
  period,
}: {
  amount: string | number;
  period?: string;
}) {
  const value = typeof amount === "number" ? formatEuro(amount) : amount;
  return (
    <strong className="rp-money">
      {value}
      {period ? <span className="rp-period">{period}</span> : null}
    </strong>
  );
}
