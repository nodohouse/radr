"use client";

/**
 * Control Center — THREE bands only:
 * 1) Shift Pulse hero graph
 * 2) Decision + Autopilot
 * 3) Role band (Brief / win-loss / themes) · pins below fold
 */

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { DecisionHero } from "./DecisionHero";
import { ShiftPulse } from "./ShiftPulse";
import { ServiceBrief } from "./ServiceBrief";
import { AutopilotStatus } from "./AutopilotStatus";
import { useLab } from "./LabContext";
import { LAB_SEEDS } from "./labLineage";
import {
  ROLE_PRESETS,
  modulesByIds,
  type LabModule,
} from "./labModules";
import { CLEVEL_THEMES, ROLE_LENSES } from "./labRoleLens";
import { autopilotForSeed } from "./labAutopilot";
import type { LabFuture } from "./labState";

const SERVICE_PATHS: {
  id: LabFuture;
  title: string;
  euro: string;
  note: string;
}[] = [
  { id: "seat_now", title: "Seat now", euro: "€0", note: "Kitchen →97% · turns slip" },
  { id: "wait_12", title: "Wait 12 min", euro: "€620", note: "Hold walk-ins · throttle delivery" },
  { id: "hard_stop", title: "Kill delivery", euro: "€180", note: "Protects kitchen · over-corrects" },
];

const RECOVER_PATHS: {
  id: LabFuture;
  title: string;
  euro: string;
  note: string;
}[] = [
  { id: "seat_now", title: "Leave unapplied", euro: "€0", note: "Cash never lands" },
  { id: "wait_12", title: "Trace sealed", euro: "€273", note: "Applied · Verified · stop" },
  { id: "hard_stop", title: "Reprice menu", euro: "—", note: "Wrong lever" },
];

function FavCard({ m }: { m: LabModule }) {
  return (
    <Link href={m.href} className="lab-fav">
      <em>{m.displayId}</em>
      <strong>{m.title}</strong>
      <span className="lab-fav-euro" data-grade={m.grade}>
        {m.euro > 0 ? `€${m.euro.toLocaleString("en-IE")}` : m.euroLabel}
        <i>{m.grade}</i>
      </span>
      <span className="lab-fav-because">because {m.because}</span>
      <span className="lab-fav-clock">{m.clock}</span>
    </Link>
  );
}

export function LabCenterCanvas() {
  const {
    state,
    derived,
    nav,
    setWhyStep,
    setFuture,
    setVip,
    setMode,
    setSeed,
    goValue,
    goMyCenter,
    setMyView,
    setCenterView,
    togglePin,
  } = useLab();
  const reduced = useReducedMotionSafe();
  const lens = ROLE_LENSES[nav.role];
  const recover = state.seed === "recover";
  const paths = recover ? RECOVER_PATHS : SERVICE_PATHS;
  const approved = state.mode === "approved";
  const auto = autopilotForSeed(state.seed, approved);

  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const agg = useMemo(
    () => deriveValueAggregate(nav.role === "cfo" ? "cfo" : "gm"),
    [snap, nav.role],
  );

  const favorites = modulesByIds(nav.pinnedIds);
  const briefMode = nav.centerView === "brief" && lens.showBrief;

  useEffect(() => {
    if (state.mode !== "why") return;
    if (reduced) {
      setWhyStep(6);
      return;
    }
    setWhyStep(0);
    const timers = [1, 2, 3, 4, 5, 6].map((i) =>
      window.setTimeout(() => setWhyStep(i), 60 + i * 100),
    );
    return () => timers.forEach(clearTimeout);
  }, [state.mode, reduced, setWhyStep]);

  return (
    <div
      className="lab-board lab-board-compose"
      data-seed={state.seed}
      data-mode={state.mode}
      data-role={nav.role}
      data-view={nav.centerView}
      data-industry={nav.industry}
    >
      <div className="lab-board-band lab-board-band-slim">
        <div>
          <h1 className="lab-board-title">{lens.title}</h1>
          <p className="lab-board-sub">
            {lens.subtitle} · {ROLE_PRESETS[nav.role].note}
          </p>
          <p className="lab-board-demo">{lens.demoPath}</p>
        </div>
        <div className="lab-board-band-actions">
          {lens.showBrief ? (
            <>
              <button
                type="button"
                className="lab-board-band-btn"
                data-primary={nav.centerView === "ops" ? true : undefined}
                onClick={() => setCenterView("ops")}
              >
                Ops
              </button>
              <button
                type="button"
                className="lab-board-band-btn"
                data-primary={briefMode ? true : undefined}
                onClick={() => setCenterView("brief")}
              >
                Brief
              </button>
            </>
          ) : null}
          <Link
            href="/app/lab/my-center"
            className="lab-board-band-btn"
            onClick={() => setMyView("board")}
          >
            My Center
          </Link>
          <button
            type="button"
            className="lab-board-band-btn"
            onClick={() => {
              setMyView("catalog");
              goMyCenter();
            }}
          >
            Catalog
          </button>
        </div>
      </div>

      {briefMode ? (
        <div className="lab-compose">
          <ServiceBrief />
        </div>
      ) : (
        <div className="lab-board-layout">
          <div className="lab-compose">
            {/* BAND 1 — Shift Pulse hero graph */}
            <ShiftPulse mode={lens.pulseMode} />

            {/* BAND 2 — Decision + Autopilot */}
            <section className="lab-band lab-band-decision">
              <div className="lab-band-decision-grid">
                <div className="lab-board-hero">
                  <DecisionHero
                    mode={state.mode}
                    seed={state.seed}
                    displayId={derived.displayId}
                    label={derived.decisionLabel}
                    sub={derived.decisionSub}
                    contribution={derived.contribution}
                    moneyMeta={derived.moneyMeta}
                    deadlineLabel={derived.deadlineLabel}
                    clockLabel={derived.clockLabel}
                    recommended={derived.recommended}
                    selectedFuture={state.selectedFuture}
                    operatorVip={state.operatorContext === "vip"}
                    onWhy={() => setMode("why")}
                    onFutures={() => setMode("futures")}
                    onContext={() => setMode("context")}
                    onApprove={() => setMode("approved")}
                    onSelectFuture={setFuture}
                    onLive={() => setMode("live")}
                    onOpenTrace={() => goValue("trace")}
                    whySlot={
                      <div className="lab-obj-why">
                        {recover ? (
                          <>
                            <p data-on={state.whyStep >= 1 ? "true" : undefined}>
                              Contract €6.80/L · Invoice €7.45/L · 420 L
                            </p>
                            <p data-on={state.whyStep >= 2 ? "true" : undefined}>
                              → Invoice variance €273 in AP
                            </p>
                            <p data-on={state.whyStep >= 3 ? "true" : undefined}>
                              → Dispute recovers €{derived.contribution} Expected
                            </p>
                          </>
                        ) : (
                          <>
                            <p data-on={state.whyStep >= 1 ? "true" : undefined}>
                              38 inbound + delivery +31% · kitchen 92%
                            </p>
                            <p data-on={state.whyStep >= 2 ? "true" : undefined}>
                              → Seat-now →97% · 9 turns exposed
                            </p>
                            <p data-on={state.whyStep >= 3 ? "true" : undefined}>
                              → Wait protects €{derived.contribution} expected
                            </p>
                          </>
                        )}
                      </div>
                    }
                    contextSlot={
                      <div className="lab-obj-context">
                        <button
                          type="button"
                          onClick={() => (recover ? undefined : setVip())}
                        >
                          {recover
                            ? "Supplier offered partial credit"
                            : "VIP party must sit at 18:50"}
                        </button>
                      </div>
                    }
                  />
                </div>

                {(state.mode === "live" ||
                  state.mode === "context" ||
                  state.mode === "approved") && (
                  <div className="lab-board-futures">
                    {state.mode !== "approved" ? (
                      <>
                        <p className="lab-board-section-k">Futures</p>
                        <p className="lab-board-section-t">
                          Three options. One Decision.
                        </p>
                        <div className="lab-futures-strip-row">
                          {paths.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              className="lab-futures-chip"
                              data-on={
                                state.selectedFuture === f.id
                                  ? "true"
                                  : undefined
                              }
                              data-rec={
                                derived.recommended === f.id
                                  ? "true"
                                  : undefined
                              }
                              onClick={() => {
                                setFuture(f.id);
                                setMode("futures");
                              }}
                            >
                              <span className="lab-futures-chip-title">
                                {f.title}
                              </span>
                              <span className="lab-futures-chip-euro">
                                {f.euro}
                              </span>
                              <span className="lab-futures-chip-note">
                                {f.note}
                              </span>
                              {derived.recommended === f.id ? (
                                <em>REC</em>
                              ) : null}
                            </button>
                          ))}
                        </div>
                        {recover ? (
                          <button
                            type="button"
                            className="lab-board-trace-link"
                            onClick={() => goValue("trace")}
                          >
                            Trace · INV-88421 · CM-44102 sealed
                          </button>
                        ) : null}
                      </>
                    ) : null}
                    <AutopilotStatus model={auto} />
                  </div>
                )}

                {state.mode === "futures" || state.mode === "why" ? (
                  <div className="lab-board-futures">
                    <AutopilotStatus model={auto} />
                  </div>
                ) : null}
              </div>
            </section>

            {/* BAND 3 — Role band */}
            <section className="lab-band lab-band-role">
              {lens.showThemes ? (
                <>
                  <p className="lab-board-section-k">Portfolio</p>
                  <h2 className="lab-board-section-t">Three money themes</h2>
                  <div className="lab-theme-row">
                    {CLEVEL_THEMES.map((t) => (
                      <Link key={t.id} href={t.href} className="lab-theme">
                        <em>{t.wedge}</em>
                        <strong>{t.title}</strong>
                        <span data-grade={t.grade}>
                          €{t.euro.toLocaleString("en-IE")} · {t.grade}
                        </span>
                        <p>because {t.because}</p>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              {lens.showFloorNotes && !recover && nav.industry === "restaurant" ? (
                <>
                  <div className="lab-board-section-head">
                    <div>
                      <p className="lab-board-section-k">Who’s coming</p>
                      <h2 className="lab-board-section-t">
                        Service implications
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="lab-board-section-link"
                      onClick={() => setCenterView("brief")}
                    >
                      Open FOH Brief
                    </button>
                  </div>
                  <div className="lab-floor-row">
                    <div className="lab-floor-card">
                      <em>Arriving</em>
                      <strong>4 covers · 20m</strong>
                      <p>because density compresses — hold walk-ins first</p>
                    </div>
                    <div className="lab-floor-card">
                      <em>Returning</em>
                      <strong>2 regulars</strong>
                      <p>because honor tables after Wait-12 resume 18:54</p>
                    </div>
                    <div className="lab-floor-card">
                      <em>VIP / allergy</em>
                      <strong>VIP 6 · T12 nut</strong>
                      <p>because must sit 18:50 — on Decision context</p>
                    </div>
                    <div className="lab-floor-card" data-hot>
                      <em>Turn-risk</em>
                      <strong>T4 · T7 · T11</strong>
                      <p>because linked to D-1911 · €620 Expected</p>
                    </div>
                  </div>
                </>
              ) : null}

              {lens.showWinLoss ? (
                <>
                  <p className="lab-board-section-k">Win / loss</p>
                  <h2 className="lab-board-section-t">
                    Where we protected · where we leak
                  </h2>
                  <div className="lab-winloss">
                    {recover ? (
                      <article className="lab-winloss-card" data-kind="win">
                        <em>Protected</em>
                        <strong>€273 Verified</strong>
                        <p>
                          because CM-44102 applied_to INV-88421 · sealed Trace
                        </p>
                        <button
                          type="button"
                          onClick={() => goValue("trace")}
                        >
                          Open Trace · stop
                        </button>
                      </article>
                    ) : (
                      <>
                        <article className="lab-winloss-card" data-kind="win">
                          <em>Protected</em>
                          <strong>
                            {formatDecisionMoney(agg.verifiedTotal)} Verified
                          </strong>
                          <p>because tuna shortfall Trace sealed on ledger</p>
                          <button
                            type="button"
                            onClick={() => goValue("verified")}
                          >
                            Open Trace
                          </button>
                        </article>
                        <article className="lab-winloss-card" data-kind="loss">
                          <em>Leaking</em>
                          <strong>€273 Expected</strong>
                          <p>
                            because INV-88421 above contract — open Recover to
                            seal
                          </p>
                          <button
                            type="button"
                            onClick={() => setSeed("recover")}
                          >
                            Open Recover
                          </button>
                        </article>
                      </>
                    )}
                  </div>
                </>
              ) : null}
            </section>

            {/* Below fold — pins only */}
            <section className="lab-band lab-band-pins">
              <div className="lab-board-section-head">
                <div>
                  <p className="lab-board-section-k">Favorites</p>
                  <h2 className="lab-board-section-t">My modules</h2>
                </div>
                <button
                  type="button"
                  className="lab-board-section-link"
                  onClick={() => {
                    setMyView("catalog");
                    goMyCenter();
                  }}
                >
                  Edit in Catalog
                </button>
              </div>
              <div className="lab-fav-row">
                {favorites.length === 0 ? (
                  <p className="lab-board-empty">
                    Pin from Catalog · {ROLE_PRESETS[nav.role].note}
                  </p>
                ) : (
                  favorites.map((m) => <FavCard key={m.id} m={m} />)
                )}
              </div>
            </section>
          </div>

          <aside className="lab-aside">
            <div className="lab-aside-card lab-aside-clock">
              <em>Decide by</em>
              <strong>{derived.deadlineLabel}</strong>
              <span>{derived.clockLabel}</span>
            </div>
            <div className="lab-aside-card">
              <em>Autopilot</em>
              <strong className="lab-aside-auto-level">{auto.levelLabel}</strong>
              <p className="lab-aside-because">because {auto.because}</p>
            </div>
            <div className="lab-aside-card">
              <em>Verified Value</em>
              <strong className="lab-aside-verified">
                {formatDecisionMoney(agg.verifiedTotal)}
              </strong>
              <Link
                href="/app/lab/value?band=verified"
                className="lab-aside-link"
              >
                Open ledger
              </Link>
            </div>
            <div className="lab-aside-card">
              <em>Data health</em>
              <p className="lab-aside-health">1 degraded · 1 stale</p>
              <p className="lab-aside-health-note">
                {recover
                  ? "€273 Verified = applied_amount · sealed Trace book-matchable."
                  : "€ claim grade unchanged — still Expected until verified."}
              </p>
            </div>
            <div className="lab-aside-card">
              <em>Pins</em>
              <div className="lab-aside-pins">
                {favorites.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="lab-aside-unpin"
                    onClick={() => togglePin(m.id)}
                    title="Unpin"
                  >
                    {m.displayId}
                  </button>
                ))}
              </div>
            </div>
            <p className="lab-aside-seed">
              <Link
                href={LAB_SEEDS.service.path}
                onClick={() => setSeed("service")}
              >
                Wait-12
              </Link>
              {" · "}
              <Link
                href={LAB_SEEDS.recover.path}
                onClick={() => setSeed("recover")}
              >
                Recover
              </Link>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
