/**
 * Menu Pulse — compact hospitality ranking for Control Center.
 * Top dishes with ranked editorial rows. Click → Menu Intelligence.
 * Visual composition only — same data / same links.
 */

import Image from "next/image";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { getMenuPulse } from "@/lib/radr/intelligence/menuRankings";
import {
  Metric,
  MetricLabel,
  MetricValue,
} from "@/components/product/ui/MetricBlock";
import { RadrArrowLink } from "@/components/radr/ui/RadrArrowLink";

export function MenuPulse({ limit = 3 }: { limit?: number }) {
  const rows = getMenuPulse().slice(0, limit);
  return (
    <div className="rp-menupulse" data-layout="editorial" aria-label="Menu pulse">
      <ul className="rp-menupulse-list">
        {rows.map((d, i) => (
          <li key={d.itemId} className="rp-menupulse-row">
            <em className="rp-menupulse-rank" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </em>
            <span className="rp-menupulse-img">
              {d.imageSrc ? (
                <Image
                  src={d.imageSrc}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                />
              ) : (
                <span data-empty="true" />
              )}
            </span>
            <strong className="rp-menupulse-name">{d.name}</strong>
            <Metric layout="stack" className="rp-menupulse-sold">
              <MetricValue>{d.units}</MetricValue>
              <MetricLabel>sold</MetricLabel>
            </Metric>
            <Metric layout="stack" className="rp-menupulse-contrib">
              <MetricValue>{formatDecisionMoney(d.contribution)}</MetricValue>
              <MetricLabel>contribution</MetricLabel>
            </Metric>
            <span className="rp-menupulse-ctx">
              {d.badge ? (
                <span className="rp-menupulse-badge">{d.badge}</span>
              ) : d.vsPacePct !== 0 ? (
                <span
                  className="rp-menupulse-pace"
                  data-pos={d.vsPacePct > 0 ? "true" : undefined}
                >
                  <span aria-hidden="true">{d.vsPacePct > 0 ? "↑" : "↓"}</span>
                  <span>{Math.abs(d.vsPacePct)}%</span>
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <RadrArrowLink href="/app/intelligence/menu" className="rp-cock-link rp-arrow-link">
        View Menu Intelligence
      </RadrArrowLink>
    </div>
  );
}
