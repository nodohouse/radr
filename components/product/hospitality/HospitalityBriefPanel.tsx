"use client";

import { useEffect, useState } from "react";
import {
  menuGuidanceForAllergy,
  type AllergyAlert,
  type HospitalityTonightBrief,
} from "@/lib/radr/hospitality";
import { WhyLine } from "@/components/product/WhyLine";

type Props = {
  brief: HospitalityTonightBrief;
  onClose: () => void;
};

/**
 * Hospitality brief - CRITICAL → PREPARE → RECOGNIZE.
 * Calm, role-aware, never a reservation dump.
 */
export function HospitalityBriefPanel({ brief, onClose }: Props) {
  const [menuFor, setMenuFor] = useState<AllergyAlert | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuFor) setMenuFor(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, menuFor]);

  const critical = brief.allergies ?? [];
  const prepare = (brief.requirements ?? []).filter((r) => r.priority === "PREPARE");
  const recognize = (brief.moments ?? []).filter(
    (m) => m.kind !== "returning" || Boolean(m.guestLabel),
  );

  return (
    <div className="rp-review" role="presentation">
      <button
        type="button"
        className="rp-review-scrim"
        aria-label="Close hospitality brief"
        onClick={onClose}
      />
      <aside
        className="rp-review-panel rp-hosp-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Hospitality brief"
      >
        <header className="rp-review-head">
          <p className="rp-review-terr">Hospitality brief</p>
          <button
            type="button"
            className="rp-review-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <section className="rp-ps-sec rp-ps-sec-tight">
          <h2 className="rp-ps-hero">
            Tonight · {brief.reservedCovers} covers
          </h2>
          <p className="rp-ps-peak">
            {brief.returningGuests} returning
            {brief.birthdays > 0 ? ` · ${brief.birthdays} birthdays` : ""}
            {brief.engagements > 0 ? ` · ${brief.engagements} engagement` : ""}
            {brief.anniversaries > 0
              ? ` · ${brief.anniversaries} anniversary`
              : ""}
          </p>
          <p className="rp-ps-peak">
            Safety: {brief.safety.allergyReservations} allergy reservations ·{" "}
            {brief.safety.kitchenAcknowledged}/{brief.allergies?.length ?? 0}{" "}
            kitchen ack
            {brief.safety.needsActionBeforeOpen
              ? " · needs action before open"
              : " · ready"}
          </p>
        </section>

        {brief.access.aggregatesOnly ? (
          <section className="rp-ps-sec">
            <p className="rp-ps-so-what">
              Named guest and allergy detail are hidden for this role.
              Operational counts only.
            </p>
            <ul className="rp-hosp-agg">
              <li>
                <strong>{brief.birthdays}</strong> birthdays
              </li>
              <li>
                <strong>{brief.allergyAlerts}</strong> allergy reservations
              </li>
              <li>
                <strong>{brief.privateDiningSetups}</strong> private dining
              </li>
            </ul>
          </section>
        ) : (
          <>
            {critical.length > 0 ? (
              <section className="rp-ps-sec" aria-label="Critical">
                <p className="rp-ps-sec-label">Critical</p>
                <ul className="rp-hosp-list">
                  {critical.map((a) => (
                    <li
                      key={a.id}
                      className="rp-hosp-card"
                      data-tone={
                        a.needsClarification
                          ? "clarify"
                          : !a.kitchenAcknowledged
                            ? "critical"
                            : "ready"
                      }
                    >
                      <div className="rp-hosp-card-head">
                        <h3>
                          {a.tableLabel} · {a.time}
                        </h3>
                        <span className="rp-ps-pill" data-tone={
                          !a.kitchenAcknowledged || a.needsClarification
                            ? "emergency"
                            : "good"
                        }>
                          {a.needsClarification
                            ? "Needs confirmation"
                            : !a.kitchenAcknowledged
                              ? "Kitchen pending"
                              : "Ready"}
                        </span>
                      </div>
                      <p className="rp-hosp-allergen">
                        Allergy alert · {a.allergenLabel}
                        {a.severityExplicit === "severe"
                          ? " · guest stated severe"
                          : ""}
                        {" · "}
                        Guest {a.guestOfParty}
                      </p>
                      {a.needsClarification && a.clarificationHint ? (
                        <p className="rp-ps-so-what">{a.clarificationHint}</p>
                      ) : (
                        <p className="rp-ps-so-what">
                          FOH: {a.fohInstruction}
                          {brief.access.canSeeKitchenSafety ? (
                            <>
                              <br />
                              Kitchen: {a.kitchenInstruction}
                            </>
                          ) : null}
                        </p>
                      )}
                      <p className="rp-ps-meta-line">
                        Menu: {a.menuContainsCount} contain ·{" "}
                        {a.menuCrossContactCount} cross-contact risk
                      </p>
                      <p className="rp-ps-meta-line">
                        Source: {a.source.system} · “{a.source.originalText}”
                      </p>
                      <div className="rp-ps-actions">
                        <button
                          type="button"
                          className="rp-btn-secondary"
                          onClick={() => setMenuFor(a)}
                        >
                          View menu guidance
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {prepare.length > 0 ? (
              <section className="rp-ps-sec" aria-label="Prepare">
                <p className="rp-ps-sec-label">Prepare</p>
                <ul className="rp-hosp-simple">
                  {prepare.map((r) => (
                    <li key={r.id}>
                      <strong>
                        {r.tableLabel ?? "TBD"} · {r.time}
                      </strong>
                      <span>
                        {r.label} - {r.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {recognize.length > 0 ? (
              <section className="rp-ps-sec" aria-label="Recognize">
                <p className="rp-ps-sec-label">Recognize</p>
                <ul className="rp-hosp-simple">
                  {recognize.slice(0, 8).map((m) => (
                    <li key={m.id}>
                      <strong>
                        {m.tableLabel ?? "TBD"}, {m.time}
                      </strong>
                      <span>
                        {m.label}
                        {m.guestLabel ? ` · ${m.guestLabel}` : ""}
                      </span>
                      <WhyLine
                        as="span"
                        why={
                          m.kind === "birthday"
                            ? "Celebrate at the table - guests remember the moment"
                            : m.kind === "anniversary"
                              ? "Mark the occasion quietly so service feels personal"
                              : m.kind === "engagement"
                                ? "Special night - coordinate cake or champagne timing"
                                : "Guest moment worth recognizing before they sit"
                        }
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {brief.dietary && brief.dietary.length > 0 ? (
              <section className="rp-ps-sec" aria-label="Dietary">
                <p className="rp-ps-sec-label">Dietary · not allergies</p>
                <ul className="rp-hosp-simple">
                  {brief.dietary.map((d) => (
                    <li key={d.id}>
                      <strong>
                        {d.tableLabel ?? "TBD"} · {d.time}
                      </strong>
                      <span>
                        {d.label} - {d.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}

        {menuFor ? (
          <div className="rp-hosp-menu-sheet">
            <header className="rp-review-head">
              <p className="rp-review-terr">
                Menu guidance · {menuFor.tableLabel} · {menuFor.allergenLabel}
              </p>
              <button
                type="button"
                className="rp-review-close"
                onClick={() => setMenuFor(null)}
                aria-label="Close menu guidance"
              >
                ×
              </button>
            </header>
            <p className="rp-ps-so-what">
              Based on current menu / allergen data. Never treated as a medical
              guarantee - confirm with kitchen.
            </p>
            {(["CONTAINS", "POSSIBLE_CROSS_CONTACT", "NO_IDENTIFIED_INGREDIENT"] as const).map(
              (bucket) => {
                const lines = menuGuidanceForAllergy(menuFor).filter(
                  (l) => l.containment === bucket,
                );
                if (lines.length === 0) return null;
                const title =
                  bucket === "CONTAINS"
                    ? "Not suitable · contains"
                    : bucket === "POSSIBLE_CROSS_CONTACT"
                      ? "Requires kitchen confirmation · cross-contact"
                      : "No identified ingredient in current menu data";
                return (
                  <div key={bucket} className="rp-hosp-menu-bucket">
                    <p className="rp-ps-sec-label">{title}</p>
                    <ul>
                      {lines.map((l) => (
                        <li key={l.menuItemId}>
                          <strong>{l.name}</strong>
                          <span>{l.detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              },
            )}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
