"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/radr/currency";
import {
  demoRevenueBridge,
  demoWhatChanged,
  roleLiveSummary,
  type OperatingEvent,
  type ShiftEconomicState,
} from "@/lib/radr/live";
import type { RoleView } from "@/lib/product/types";
import { LivePaceSpark } from "@/components/product/live/LivePaceSpark";
import { LiveChannelMix } from "@/components/product/channels/LiveChannelMix";
import { composeBerlinChannelEconomics } from "@/lib/radr/channels";
import { useRouter } from "next/navigation";

function eur(n: number) {
  return formatCurrency(n, "EUR", { compact: false, cents: true });
}

function clock(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));
}

function EventRow({ e }: { e: OperatingEvent }) {
  const signed =
    e.eventType === "REFUND" ||
    e.eventType === "COMP" ||
    e.eventType === "DISCOUNT" ||
    e.eventType === "FEE" ||
    e.eventType === "VOID"
      ? -Math.abs(e.amount)
      : e.eventType === "CHECK_OPENED"
        ? e.amount
        : e.amount;
  const isOpen = e.eventType === "CHECK_OPENED";
  return (
    <li className="rp-live-event">
      <span className="rp-live-event-t">{clock(e.timestamp)}</span>
      <span className="rp-live-event-l">
        {e.label}
        {e.reason ? (
          <em className="rp-live-event-why">{e.reason}</em>
        ) : null}
      </span>
      <span
        className="rp-live-event-a"
        data-neg={signed < 0 ? "true" : undefined}
        data-open={isOpen ? "true" : undefined}
      >
        {isOpen
          ? `${eur(e.amount)} open`
          : `${signed >= 0 ? "+" : "−"}${eur(Math.abs(signed))}`}
      </span>
    </li>
  );
}

type Props = {
  state: ShiftEconomicState;
  roleView?: RoleView;
  illustrative?: boolean;
  paused: boolean;
  onPause: (v: boolean) => void;
  onClose: () => void;
};

/**
 * Expanded Live Shift console - progressive disclosure from the pulse.
 * Header follows role altitude (contribution for owner/cfo, covers for floor).
 */
export function LiveShiftPanel({
  state,
  roleView = "gm",
  illustrative,
  paused,
  onPause,
  onClose,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "money" | "leakage">("all");
  const changed = useMemo(() => demoWhatChanged(state, 15), [state]);
  const bridge = useMemo(() => demoRevenueBridge(state), [state]);
  const channelState = useMemo(
    () => composeBerlinChannelEconomics(state.netSales),
    [state.netSales],
  );
  const roleSummary = useMemo(
    () => roleLiveSummary(roleView, state),
    [roleView, state],
  );
  const ahead = state.vsExpectedPct >= 0;

  const events = state.recentEvents.filter((e) => {
    if (filter === "all") return e.eventType !== "COVERS";
    if (filter === "leakage") {
      return (
        e.eventType === "REFUND" ||
        e.eventType === "COMP" ||
        e.eventType === "DISCOUNT" ||
        e.eventType === "VOID"
      );
    }
    return (
      e.eventType === "SALE" ||
      e.eventType === "DELIVERY_ORDER" ||
      e.eventType === "PAYMENT" ||
      e.eventType === "CHECK_OPENED"
    );
  });

  return (
    <div className="rp-live-panel" role="dialog" aria-label="Live shift">
      <div className="rp-live-panel-scrim" onClick={onClose} aria-hidden="true" />
      <div className="rp-live-panel-card">
        <header className="rp-live-panel-head">
          <div>
            <p className="rp-live-pulse-kicker">
              <span className="rp-live-pulse-dot" aria-hidden="true" />
              {roleSummary.kicker}
              {illustrative ? " · ILLUSTRATIVE" : ""}
            </p>
            <h2 className="rp-live-panel-title">
              {roleSummary.primary.amount}
              <span>{roleSummary.primary.label}</span>
            </h2>
            <p
              className="rp-live-pulse-pace"
              data-tone={ahead ? "good" : "watch"}
            >
              {roleSummary.narrative}
            </p>
          </div>
          <div className="rp-live-panel-tools">
            <button
              type="button"
              className="rp-btn-secondary"
              onClick={() => onPause(!paused)}
            >
              {paused ? "Resume" : "Pause"}
            </button>
            <button type="button" className="rp-btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        <ul className="rp-live-stat-list" aria-label="Role metrics">
          {roleSummary.lines.map((line) => (
            <li key={line.label}>
              <span>{line.label}</span>
              <strong data-tone={line.tone}>{line.value}</strong>
            </li>
          ))}
        </ul>

        <LivePaceSpark state={state} size="panel" />

        <LiveChannelMix
          state={channelState}
          onOpenFinance={() => {
            onClose();
            router.push("/app/finance");
          }}
        />

        <section className="rp-live-panel-grid">
          <div>
            <p className="rp-today-section-label">Pace</p>
            <ul className="rp-live-stat-list">
              <li>
                <span>Expected by now</span>
                <strong>{eur(state.expectedByNow)}</strong>
              </li>
              <li>
                <span>Actual</span>
                <strong>{eur(state.netSales)}</strong>
              </li>
              <li>
                <span>Velocity</span>
                <strong>{eur(state.velocityPerMinute)} / min</strong>
              </li>
            </ul>
            <p className="rp-live-narrative">
              Dinner is running {Math.abs(state.vsExpectedPct)}%{" "}
              {ahead ? "ahead" : "behind"} of expected pace.
            </p>
          </div>

          <div>
            <p className="rp-today-section-label">Money movement</p>
            <ul className="rp-live-stat-list">
              <li>
                <span>Gross sales</span>
                <strong>{eur(state.grossSales)}</strong>
              </li>
              <li>
                <span>Discounts</span>
                <strong>{eur(state.discounts)}</strong>
              </li>
              <li>
                <span>Comps</span>
                <strong>{eur(state.comps)}</strong>
              </li>
              <li>
                <span>Refunds</span>
                <strong>{eur(state.refunds)}</strong>
              </li>
              <li>
                <span>Open checks</span>
                <strong>
                  {eur(state.openCheckValue)} · {state.openCheckCount}
                </strong>
              </li>
            </ul>
          </div>

          <div>
            <p className="rp-today-section-label">What moved it</p>
            <ul className="rp-live-bridge">
              <li>
                <span>Expected</span>
                <strong>{eur(bridge.expected)}</strong>
              </li>
              {bridge.steps.map((s) => (
                <li key={s.label} data-neg={s.amount < 0 ? "true" : undefined}>
                  <span>{s.label}</span>
                  <strong>
                    {s.amount >= 0 ? "+" : "−"}
                    {eur(Math.abs(s.amount))}
                  </strong>
                </li>
              ))}
              <li data-total="true">
                <span>Actual</span>
                <strong>{eur(bridge.actual)}</strong>
              </li>
            </ul>
          </div>
        </section>

        <section className="rp-live-changed">
          <p className="rp-today-section-label">
            What changed · last {changed.minutes} min
          </p>
          <ul>
            {changed.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="rp-live-changed-net">
            Net economic movement{" "}
            <strong>
              {changed.netMovement >= 0 ? "+" : "−"}
              {eur(Math.abs(changed.netMovement))}
            </strong>
          </p>
        </section>

        <section className="rp-live-ticker">
          <div className="rp-live-ticker-head">
            <p className="rp-today-section-label">Events</p>
            <div className="rp-live-filters">
              {(
                [
                  ["all", "All"],
                  ["money", "Sales"],
                  ["leakage", "Leakage"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  data-active={filter === id ? "true" : undefined}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ol className="rp-live-event-list">
            {events.slice(0, 14).map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </ol>
        </section>

        <footer className="rp-live-sources">
          {state.sources.map((s) => (
            <span key={s.source}>
              {s.source} · {s.status === "ILLUSTRATIVE" ? "Illustrative" : s.status}
            </span>
          ))}
        </footer>
      </div>
    </div>
  );
}
