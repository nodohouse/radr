"use client";

/**
 * DecisionPeek — portal drawer. Never reflows Control Center.
 * Desktop: fixed right ~460px. Mobile: full-sheet.
 */

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { resolveCanonicalDecisionId } from "@/lib/radr/decision/aliases";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  CANON_BY_ID,
  CANON_PEAK,
  type CanonDecision,
} from "@/lib/radr/decision/demo/canonical";
import { peakDecisionWindowMinutes } from "@/lib/radr/decision/demos/peakClock";
import { liveDecisionWindowMinutes } from "@/lib/radr/demoClock";
import {
  hotelNeedsYouDecisions,
  hotelHandlingDecisions,
} from "@/lib/radr/demo/hotelDecisions";
import { getDecisionRecord } from "@/lib/radr/decision/store";

type Props = {
  decisionId: string | null;
  row?: NeedsYouRow | null;
  onClose: () => void;
  /** Element that opened the peek — focus restored on close */
  triggerRef?: RefObject<HTMLElement | null>;
};

/** Public / demo Futures — Wait · Seat · Throttle (marketing-aligned). */
const PEAK_FUTURES = peekFuturesFromCanon(CANON_PEAK);

function peekFuturesFromCanon(canon: CanonDecision) {
  return canon.scenarios.slice(0, 4).map((s) => {
    const euro = s.expectedContributionEuro;
    let value: string;
    if (euro != null && euro !== 0) {
      value = `+${formatDecisionMoney(euro)}`;
    } else if (s.note) {
      value = s.note.split("·")[0]?.trim() ?? s.note;
    } else {
      value = euro === 0 ? "€0" : "—";
    }
    return {
      id: s.id,
      label: s.title,
      value,
      preferred: Boolean(s.recommended),
    };
  });
}

/** Decision Room IDs that resolve in the store today. */
const ROOM_READY = new Set<string>(Object.values(DECISION_IDS));

function hotelSeed(decisionId: string) {
  return (
    hotelNeedsYouDecisions().find((d) => d.id === decisionId) ??
    hotelHandlingDecisions().find((d) => d.id === decisionId) ??
    null
  );
}

function whyFromRow(row?: NeedsYouRow | null): string[] {
  const line = row?.contextLine?.trim();
  if (line) {
    return line
      .split(/[·|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
  }
  if (row?.title) return [row.title];
  return ["Evidence forming", "Review in Decision Room"];
}

export function DecisionPeek({
  decisionId,
  row,
  onClose,
  triggerRef,
}: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const open = Boolean(decisionId);

  const handleClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => {
      triggerRef?.current?.focus?.();
    });
  }, [onClose, triggerRef]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const shell = document.querySelector<HTMLElement>(
      ".rp-cc4-root, [data-depth='command']",
    );
    if (shell) {
      shell.setAttribute("aria-hidden", "true");
      shell.setAttribute("inert", "");
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const list = Array.from(focusables).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      if (shell) {
        shell.removeAttribute("aria-hidden");
        shell.removeAttribute("inert");
      }
    };
  }, [open, handleClose]);

  if (!open || typeof document === "undefined") return null;

  const hotel = decisionId ? hotelSeed(decisionId) : null;
  const isPeak = decisionId === DECISION_IDS.peak;
  const canon = decisionId ? CANON_BY_ID[decisionId] : undefined;
  const displayId = hotel
    ? hotel.displayId
    : displayDecisionId(decisionId!);
  const verb = (
    hotel
      ? hotel.verb
      : isPeak
        ? "WAIT 12 MINUTES"
        : (row?.recommendation ?? row?.title ?? "Decision")
  ).toUpperCase();
  const econ = hotel
    ? `+${hotel.economicFormatted.replace(/^\+/, "")}`
    : isPeak
      ? `+${formatDecisionMoney(CANON_PEAK.exposureEuro)}`
      : `+${(row?.economicFormatted ?? "—").replace(/^\+/, "")}`;
  const mins = hotel
    ? Number(hotel.deadlineLabel.match(/(\d+)/)?.[1] ?? 0) || null
    : isPeak
      ? peakDecisionWindowMinutes() || liveDecisionWindowMinutes()
      : Number(row?.deadlineLabel?.match(/(\d+)/)?.[1] ?? 0) || null;
  const where = hotel
    ? hotel.locationLabel
    : isPeak
      ? "Soho · New York"
      : (row?.locationLabel ?? "");
  const whyLines = hotel
    ? hotel.why.split(" · ").map((s) => s.trim()).filter(Boolean)
    : isPeak
      ? ["38 inbound", "Delivery +31%", "Kitchen →97%"]
      : whyFromRow(row);
  const futures = hotel?.futures?.length
    ? hotel.futures
    : isPeak
      ? PEAK_FUTURES
      : canon?.scenarios?.length
        ? peekFuturesFromCanon(canon)
        : [];

  const roomId =
    (decisionId ? resolveCanonicalDecisionId(decisionId) : decisionId!);
  const roomHref =
    getDecisionRecord(roomId) || ROOM_READY.has(roomId)
      ? `/app/decisions/${roomId}`
      : null;

  const node: ReactNode = (
    <div className="rp-peek" data-open="true">
      <button
        type="button"
        className="rp-peek-scrim"
        aria-label="Close Decision peek"
        onClick={handleClose}
      />
      <aside
        ref={panelRef}
        className="rp-peek-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="rp-peek-head">
          <div>
            <p className="rp-peek-id">{displayId}</p>
            <h2 id={titleId} className="rp-peek-verb">
              {verb}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="rp-peek-x"
            aria-label="Close"
            onClick={handleClose}
          >
            ×
          </button>
        </header>

        <div className="rp-peek-hero">
          <div>
            <strong>{econ}</strong>
            <span>expected</span>
          </div>
          {mins != null && mins > 0 ? (
            <div>
              <strong>{mins}m</strong>
              <span>remaining</span>
            </div>
          ) : null}
        </div>

        <p className="rp-peek-where">{where}</p>

        <section className="rp-peek-sec">
          <p className="rp-peek-k">Why now</p>
          <ul className="rp-peek-why">
            {whyLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        {futures.length > 0 ? (
          <section className="rp-peek-sec">
            <p className="rp-peek-k">Futures</p>
            <ul className="rp-peek-futures">
              {futures.map((f) => (
                <li key={f.id} data-preferred={f.preferred ? "true" : undefined}>
                  <span>{f.label}</span>
                  <strong>{f.value}</strong>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="rp-peek-foot">
          {roomHref && futures.length > 0 ? (
            <Link
              href={`${roomHref}#futures`}
              className="rp-peek-cta"
              data-secondary="true"
            >
              Compare Futures
            </Link>
          ) : null}
          {roomHref ? (
            <Link href={roomHref} className="rp-peek-cta">
              Open Decision Room
            </Link>
          ) : (
            <button type="button" className="rp-peek-cta" onClick={handleClose}>
              Close
            </button>
          )}
        </footer>
      </aside>
    </div>
  );

  return createPortal(node, document.body);
}
