"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/radr/money";
import type { FnBMixItem } from "@/lib/radr/fnb";
import {
  findPostShiftMoneyLine,
  type PostShiftBrief,
} from "@/lib/radr/preShift";
import { PostShiftMoneySheet } from "@/components/product/preShift/PostShiftMoneySheet";

type Props = {
  brief: PostShiftBrief;
  /** When true, open learning sections immediately (from ShiftTruth dig-deeper). */
  forceExpanded?: boolean;
  /** Open a money category from ShiftTruth. */
  openMoneyId?: string | null;
  onOpenMoneyId?: (id: string | null) => void;
};

function eur(amount: number) {
  return formatMoney({ amount, currency: "EUR", locale: "de-DE" });
}

function signed(n: number | null, suffix = "") {
  if (n == null) return " - ";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}${suffix}`;
}

function dishTagLabel(tag: FnBMixItem["tag"]) {
  if (tag === "bestseller") return "Best seller";
  if (tag === "signature") return "Signature";
  if (tag === "surprise") return "Above typical";
  if (tag === "soft") return "Soft tonight";
  return null;
}

function unitLabel(item: FnBMixItem) {
  return `${item.units} ${item.unitLabel}`;
}

function nextModeLabel(mode: "prepared" | "watching" | "decide") {
  if (mode === "prepared") return "Prepared for next shift";
  if (mode === "watching") return "RADR is watching";
  return "Needs a decision";
}

function MixList({ items, label }: { items: FnBMixItem[]; label: string }) {
  return (
    <ul className="rp-postshift-dishes" aria-label={label}>
      {items.map((d) => {
        const tag = dishTagLabel(d.tag);
        return (
          <li key={d.id} data-tag={d.tag ?? undefined} data-category={d.category}>
            <div className="rp-postshift-dish-main">
              <strong>{d.name}</strong>
              {tag ? <span className="rp-postshift-dish-tag">{tag}</span> : null}
            </div>
            <div className="rp-postshift-dish-meta">
              <span>{unitLabel(d)}</span>
              <span>{d.categoryMixPct}% of {d.category}</span>
              <span>{d.totalMixPct}% of F&B</span>
              <span>{eur(d.contributionEur)} contrib.</span>
              <span data-dir={d.vsTypicalPct >= 0 ? "up" : "down"}>
                {signed(d.vsTypicalPct, "%")} vs typical
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Post-shift Level 2+ - next-shift carry by default; mix/learning on demand.
 * Level 1 truth lives in ShiftTruth.
 */
export function PostShiftSummary({
  brief,
  forceExpanded,
  openMoneyId,
  onOpenMoneyId,
}: Props) {
  const { learning, fnb } = brief;
  const [deep, setDeep] = useState(Boolean(forceExpanded));
  const [localMoneyId, setLocalMoneyId] = useState<string | null>(null);
  const nextVisible = brief.nextShift.slice(0, 3);

  const moneyId = openMoneyId ?? localMoneyId;
  const openMoney = (id: string) => {
    if (onOpenMoneyId) onOpenMoneyId(id);
    else setLocalMoneyId(id);
  };
  const closeMoney = () => {
    if (onOpenMoneyId) onOpenMoneyId(null);
    else setLocalMoneyId(null);
  };
  const moneyLine = moneyId
    ? findPostShiftMoneyLine(brief.money, moneyId)
    : null;

  useEffect(() => {
    if (forceExpanded) setDeep(true);
  }, [forceExpanded]);

  return (
    <section className="rp-postshift" aria-label="Shift learning">
      <p className="rp-cc3-zone-label">Tonight’s money</p>
      <div className="rp-postshift-money" aria-label="Money in and out">
        <div className="rp-postshift-money-col" data-side="in">
          <p className="rp-postshift-money-head">In</p>
          <ul>
            {brief.money.in.map((line) => (
              <li key={line.id}>
                <button
                  type="button"
                  className="rp-postshift-money-row"
                  onClick={() => openMoney(line.id)}
                >
                  <div>
                    <strong>{line.label}</strong>
                    <span>{line.detail}</span>
                  </div>
                  <em>
                    {eur(line.amount)}
                    {line.sharePct != null ? (
                      <small>{line.sharePct}% · Open</small>
                    ) : (
                      <small>Open</small>
                    )}
                  </em>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="rp-postshift-money-col" data-side="out">
          <p className="rp-postshift-money-head">Out</p>
          <ul>
            {brief.money.out.map((line) => (
              <li key={line.id}>
                <button
                  type="button"
                  className="rp-postshift-money-row"
                  onClick={() => openMoney(line.id)}
                >
                  <div>
                    <strong>{line.label}</strong>
                    <span>{line.detail}</span>
                  </div>
                  <em>
                    −{eur(line.amount)}
                    <small>Open</small>
                  </em>
                </button>
              </li>
            ))}
          </ul>
          <p className="rp-postshift-money-note">
            Leakage {eur(brief.money.leakageTotal)} already in net · delivery
            fees are contribution drag, not a second net cut. Click any line for
            evidence and what we do next.
          </p>
        </div>
      </div>
      <p className="rp-postshift-money-net">
        <span>Net sales</span>
        <strong>{eur(brief.netSales)}</strong>
        <em>
          {brief.covers} covers · {brief.walkIns} walk-ins ·{" "}
          {eur(brief.verifiedValue)} verified
        </em>
      </p>

      <p className="rp-cc3-zone-label">For the next shift</p>
      <ul className="rp-postshift-next">
        {nextVisible.map((a) => (
          <li key={a.id} data-mode={a.mode}>
            <div>
              <strong>{a.label}</strong>
              <span>{a.reason}</span>
            </div>
            <em>{nextModeLabel(a.mode)}</em>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="rp-postshift-deep-toggle"
        aria-expanded={deep}
        onClick={() => setDeep((v) => !v)}
      >
        {deep ? "Hide tonight’s detail" : "Learn from tonight"}
      </button>

      {deep ? (
        <div className="rp-postshift-deep">
          <p className="rp-cc3-zone-label">What went well</p>
          <ul className="rp-postshift-highlights">
            {brief.highlights.map((h) => (
              <li key={h.id}>
                <div>
                  <strong>{h.label}</strong>
                  <span>{h.detail}</span>
                </div>
                {h.contributionEur != null ? (
                  <em>+{eur(h.contributionEur)}</em>
                ) : null}
              </li>
            ))}
          </ul>

          <p className="rp-cc3-zone-label">Food mix</p>
          <MixList items={brief.dishes} label="Food performance" />

          <p className="rp-cc3-zone-label">Drinks mix</p>
          <MixList items={brief.drinks} label="Beverage performance" />

          <p className="rp-cc3-zone-label">Forecast learning</p>
          <div className="rp-postshift-learn" aria-label="Predicted versus actual">
            <div>
              <span>Walk-ins</span>
              <strong>
                {learning.predicted.walkIns} → {learning.actual.walkIns ?? "-"}
              </strong>
              <em>{signed(learning.errors.walkIns)}</em>
            </div>
            <div>
              <span>Covers</span>
              <strong>
                {learning.predicted.covers} → {learning.actual.covers ?? "-"}
              </strong>
              <em>{signed(learning.errors.covers)}</em>
            </div>
            <div>
              <span>Revenue</span>
              <strong>
                {eur(learning.predicted.revenue)} →{" "}
                {learning.actual.revenue != null
                  ? eur(learning.actual.revenue)
                  : " - "}
              </strong>
              <em>
                {learning.errors.revenue != null
                  ? signed(Math.round(learning.errors.revenue))
                  : " - "}
              </em>
            </div>
          </div>
          <p className="rp-postshift-learn-note">
            Filed for this location - beverage share {fnb.beverageSharePct}%
            informs attach expectations.
          </p>

          <p className="rp-cc3-zone-label">What RADR changed</p>
          <ul className="rp-postshift-changes">
            {brief.changes.map((c) => (
              <li key={c.label}>
                {c.label}
                <strong>+{eur(c.contribution)}</strong>
              </li>
            ))}
          </ul>

          {brief.watchPoints.length > 0 ? (
            <>
              <p className="rp-cc3-zone-label">Worth watching</p>
              <ul className="rp-postshift-watch">
                {brief.watchPoints.map((w) => (
                  <li key={w.id}>
                    <strong>{w.label}</strong>
                    <span>{w.detail}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {brief.nextShift.length > nextVisible.length ? (
            <>
              <p className="rp-cc3-zone-label">More for next shift</p>
              <ul className="rp-postshift-next">
                {brief.nextShift.slice(3).map((a) => (
                  <li key={a.id} data-mode={a.mode}>
                    <div>
                      <strong>{a.label}</strong>
                      <span>{a.reason}</span>
                    </div>
                    <em>{nextModeLabel(a.mode)}</em>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}

      {moneyLine ? (
        <PostShiftMoneySheet line={moneyLine} onClose={closeMoney} />
      ) : null}
    </section>
  );
}
