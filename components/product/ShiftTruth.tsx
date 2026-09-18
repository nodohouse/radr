"use client";

import { formatMoney } from "@/lib/radr/money";
import type { ServicePhase } from "@/lib/radr/servicePhase";
import type { PreShiftBrief, PostShiftBrief } from "@/lib/radr/preShift";
import type { ShiftEconomicState } from "@/lib/radr/live";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { WhyLine } from "@/components/product/WhyLine";
import { LivePaceSpark } from "@/components/product/live/LivePaceSpark";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

export type ShiftTruthAttention = {
  needsYou: number;
  handling: number;
  handled: number;
};

export type ShiftTruthInterrupt = {
  label: string;
  detail: string;
  amount: number;
  onRecover: () => void;
  onDismiss?: () => void;
};

/** Same shift truth, different altitude. */
export type ShiftTruthLens = "floor" | "portfolio";

type Props = {
  phase: ServicePhase;
  preBrief?: PreShiftBrief | null;
  liveState?: ShiftEconomicState | null;
  postBrief?: PostShiftBrief | null;
  attention?: ShiftTruthAttention | null;
  interrupt?: ShiftTruthInterrupt | null;
  /** Floor = covers/tables; portfolio = contribution / verified / exposure. */
  lens?: ShiftTruthLens;
  illustrative?: boolean;
  pulse?: boolean;
  /** Opens the phase dig-deeper surface (plan / live panel / learning). */
  onDigDeeper: () => void;
  onOpenHandled?: () => void;
  /** Post-shift: open a money category dig-deeper. */
  onOpenMoneyLine?: (id: string) => void;
};

function phaseKicker(phase: ServicePhase, serviceLabel: string) {
  if (phase === "PRE_SHIFT") return `Pre-shift · ${serviceLabel}`;
  if (phase === "LIVE") return `Live · ${serviceLabel}`;
  if (phase === "CLOSING") return `Closing · ${serviceLabel}`;
  return `Shift complete · ${serviceLabel}`;
}

/**
 * Level 1 operating truth - one hero, one verdict, two satellites,
 * attention line, optional interrupt. Dig deeper on demand.
 */
export function ShiftTruth({
  phase,
  preBrief,
  liveState,
  postBrief,
  attention,
  interrupt,
  lens = "floor",
  illustrative,
  pulse,
  onDigDeeper,
  onOpenHandled,
  onOpenMoneyLine,
}: Props) {
  const isPre = phase === "PRE_SHIFT";
  const isLiveLike = phase === "LIVE" || phase === "CLOSING";
  const isPost = phase === "POST_SHIFT";
  const portfolio = lens === "portfolio";

  const serviceLabel =
    liveState?.serviceLabel ??
    preBrief?.serviceLabel ??
    postBrief
      ? "Dinner"
      : "Service";

  let heroValue = " - ";
  let heroLabel = "net sales";
  let verdict = "";
  let verdictTone: "good" | "watch" = "good";
  let why = "Operating picture for this service";
  let satA: { value: string; label: string } | null = null;
  let satB: { value: string; label: string } | null = null;
  let digLabel = "Dig deeper";

  if (isPre && preBrief) {
    if (portfolio) {
      heroValue = eur(preBrief.expectedContribution);
      heroLabel = "contribution tonight";
      verdict = `${preBrief.expectedCovers} covers on the books`;
      verdictTone = "good";
      why =
        "Tonight’s economics, not the seating chart - contribution is the pulse";
      satA = {
        value: eur(preBrief.fnb.beverageRevenue),
        label: `drinks mix · ${preBrief.fnb.beverageSharePct}%`,
      };
      satB = {
        value: String(preBrief.expectedCovers),
        label: "covers",
      };
    } else {
      heroValue = String(preBrief.expectedCovers);
      heroLabel = "expected covers";
      const terraceOpen = preBrief.weatherImpact?.decision === "OPEN";
      verdict = terraceOpen
        ? `Terrace open · +${preBrief.weatherImpact!.historicalTerraceLiftCovers} covers`
        : `Peak ${preBrief.peakWindow.start}-${preBrief.peakWindow.end}`;
      verdictTone = terraceOpen ? "good" : "watch";
      why = terraceOpen
        ? "Warm and dry usually lifts this terrace - history, not hope"
        : "Bookings and walk-ins already set the shape of the night";
      satA = {
        value: eur(preBrief.fnb.beverageRevenue),
        label: `drinks · ${preBrief.fnb.beverageSharePct}%`,
      };
      satB = {
        value: eur(preBrief.expectedContribution),
        label: "contribution",
      };
    }
    digLabel = "Open pre-shift plan";
  } else if (isLiveLike && liveState) {
    const ahead = liveState.vsExpectedPct >= 0;
    const coversExpected = BERLIN_RESERVATION_SUMMARY.forecastCovers;
    const coversPct =
      coversExpected > 0
        ? Math.min(100, Math.round((liveState.covers / coversExpected) * 100))
        : 0;
    if (portfolio) {
      const contrib =
        liveState.estimatedContribution ??
        Math.round(liveState.netSales * 0.42);
      const verified = attention?.handled
        ? Math.max(184, attention.handled * 92)
        : 184;
      const recoverable =
        attention && attention.needsYou > 0
          ? attention.needsYou * 140
          : 0;
      heroValue = eur(contrib);
      heroLabel = "contribution so far";
      verdict = `${ahead ? "+" : "−"}${Math.abs(liveState.vsExpectedPct)}% vs expected pace`;
      verdictTone = ahead ? "good" : "watch";
      why =
        recoverable > 0
          ? `${eur(recoverable)} still recoverable - the floor is on the tables`
          : "Recovery is already proving out - seats aren’t the story here";
      satA = {
        value: eur(verified),
        label: "verified today",
      };
      satB = {
        value: eur(liveState.netSales),
        label: "net sales",
      };
    } else {
      heroValue = eur(liveState.netSales);
      heroLabel = "net sales";
      verdict = `${ahead ? "+" : "−"}${Math.abs(liveState.vsExpectedPct)}% vs expected`;
      verdictTone = ahead ? "good" : "watch";
      why = ahead
        ? "Covers and ticket mix are running hot for this hour"
        : "Pace is soft for this hour - dig only if you need the driver";
      satA = {
        value: String(liveState.covers),
        label: `covers · ${coversPct}% of plan`,
      };
      satB = {
        value: eur(liveState.fnb.beverageRevenue),
        label: `drinks · ${liveState.fnb.beverageSharePct}%`,
      };
    }
    digLabel = "Open live shift";
  } else if (isPost && postBrief) {
    const ahead = postBrief.vsExpectedPct >= 0;
    const m = postBrief.money;
    if (portfolio) {
      const contrib =
        postBrief.fnb.foodContribution + postBrief.fnb.beverageContribution;
      heroValue = eur(contrib);
      heroLabel = "contribution tonight";
      verdict = `${ahead ? "+" : "−"}${Math.abs(postBrief.vsExpectedPct)}% vs expected · ${eur(m.leakageTotal)} leakage`;
      verdictTone = ahead && m.leakageTotal < 400 ? "good" : "watch";
      why =
        "Contribution and leakage - the night in one breath, not which table dropped";
      satA = {
        value: eur(postBrief.verifiedValue),
        label: "verified tonight",
      };
      satB = {
        value: eur(postBrief.netSales),
        label: "net sales",
      };
    } else {
      heroValue = eur(postBrief.netSales);
      heroLabel = "net sales";
      verdict = `${ahead ? "+" : "−"}${Math.abs(postBrief.vsExpectedPct)}% vs expected`;
      verdictTone = ahead ? "good" : "watch";
      why = `Food ${m.in[0]?.sharePct}% · drinks ${m.in[1]?.sharePct}% · delivery ${m.in[2]?.sharePct}% · ${eur(m.leakageTotal)} slipped`;
      satA = {
        value: eur(m.food),
        label: `food · ${m.in[0]?.sharePct}%`,
      };
      satB = {
        value: eur(m.beverage),
        label: `drinks · ${m.in[1]?.sharePct}%`,
      };
    }
    digLabel = "Learn from tonight";
  }

  const showSpark = isLiveLike && liveState;
  const hasAttention =
    attention &&
    (attention.needsYou > 0 ||
      attention.handling > 0 ||
      attention.handled > 0);

  return (
    <div
      className="rp-shift-truth"
      data-phase={phase}
      data-tour-target="shift-truth"
    >
      <button
        type="button"
        className="rp-shift-truth-main"
        data-pulse={pulse ? "true" : undefined}
        onClick={onDigDeeper}
        aria-label={digLabel}
      >
        <div className="rp-shift-truth-copy">
          <p className="rp-shift-truth-kicker">
            <span className="rp-shift-truth-bead" aria-hidden="true" />
            {phaseKicker(phase, serviceLabel)}
            {illustrative ? <em>Illustrative</em> : null}
          </p>
          <p className="rp-shift-truth-hero">
            <strong>{heroValue}</strong>
            <span>{heroLabel}</span>
          </p>
          {verdict ? (
            <p className="rp-shift-truth-verdict" data-tone={verdictTone}>
              {verdict}
            </p>
          ) : null}
          {satA || satB ? (
            <ul className="rp-shift-truth-sats" aria-label="Key signals">
              {satA ? (
                <li>
                  <strong>{satA.value}</strong>
                  <span>{satA.label}</span>
                </li>
              ) : null}
              {satB ? (
                <li>
                  <strong>{satB.value}</strong>
                  <span>{satB.label}</span>
                </li>
              ) : null}
            </ul>
          ) : null}
          <WhyLine as="span" why={why} className="rp-shift-truth-why" />
          <span className="rp-shift-truth-open">{digLabel}</span>
        </div>
        {showSpark && liveState ? (
          <LivePaceSpark state={liveState} size="strip" />
        ) : null}
      </button>

      {isPost && postBrief ? (
        <div className="rp-shift-truth-money" aria-label="Tonight money in and out">
          <div className="rp-shift-truth-money-in">
            {postBrief.money.in.map((line) => (
              <button
                key={line.id}
                type="button"
                className="rp-shift-truth-money-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMoneyLine?.(line.id);
                }}
              >
                <span>{line.label}</span>
                <strong>{eur(line.amount)}</strong>
                <em>{line.sharePct}% of net · Open</em>
              </button>
            ))}
          </div>
          <div className="rp-shift-truth-money-out">
            {postBrief.money.out.map((line) => (
              <button
                key={line.id}
                type="button"
                className="rp-shift-truth-money-item"
                data-kind={line.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMoneyLine?.(line.id);
                }}
              >
                <span>{line.label}</span>
                <strong>−{eur(line.amount)}</strong>
                <em>Open</em>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {hasAttention ? (
        <p className="rp-shift-truth-attn" aria-label="Attention load">
          {portfolio ? (
            <>
              <strong>{attention!.needsYou}</strong> material open
              <span aria-hidden="true"> · </span>
              <strong>{attention!.handling}</strong> absorbed by ops
              {attention!.handled > 0 && onOpenHandled ? (
                <>
                  <span aria-hidden="true"> · </span>
                  <button
                    type="button"
                    className="rp-shift-truth-attn-link"
                    onClick={onOpenHandled}
                  >
                    <strong>{attention!.handled}</strong> verified
                  </button>
                </>
              ) : null}
            </>
          ) : (
            <>
              <strong>{attention!.needsYou}</strong> need you
              <span aria-hidden="true"> · </span>
              <strong>{attention!.handling}</strong> RADR handling
              {attention!.handled > 0 && onOpenHandled ? (
                <>
                  <span aria-hidden="true"> · </span>
                  <button
                    type="button"
                    className="rp-shift-truth-attn-link"
                    onClick={onOpenHandled}
                  >
                    <strong>{attention!.handled}</strong> handled
                  </button>
                </>
              ) : null}
            </>
          )}
        </p>
      ) : null}

      {!portfolio && interrupt ? (
        <div className="rp-shift-truth-interrupt" role="status">
          <div>
            <p className="rp-shift-truth-interrupt-label">{interrupt.label}</p>
            <p className="rp-shift-truth-interrupt-detail">{interrupt.detail}</p>
          </div>
          <strong>{eur(interrupt.amount)}</strong>
          <div className="rp-shift-truth-interrupt-actions">
            <button
              type="button"
              className="rp-shift-truth-interrupt-go"
              onClick={interrupt.onRecover}
            >
              Recover
            </button>
            {interrupt.onDismiss ? (
              <button
                type="button"
                className="rp-shift-truth-interrupt-dismiss"
                onClick={interrupt.onDismiss}
              >
                Dismiss
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
