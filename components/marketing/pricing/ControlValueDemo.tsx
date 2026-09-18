"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";

type DemoId = "suppliers" | "credits" | "services" | "delivery";
type Phase = "ready" | "exit" | "in";

const DEMO_IDS: DemoId[] = ["suppliers", "credits", "services", "delivery"];

const SIGNAL_ROWS: Record<DemoId, number[]> = {
  suppliers: [1],
  credits: [2, 3],
  services: [1],
  delivery: [6],
};

const DEMO_TERR: Record<DemoId, string> = {
  suppliers: "BUY",
  credits: "RECOVER",
  services: "BUY",
  delivery: "SELL",
};

export function ControlValueDemo() {
  const t = useTranslations("pricing.demo");
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<DemoId>("suppliers");
  const [phase, setPhase] = useState<Phase>("ready");
  const timers = useRef<number[]>([]);

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clear(), [clear]);

  function select(id: DemoId) {
    if (id === active && phase === "ready") return;
    clear();
    if (reduced) {
      setActive(id);
      setPhase("ready");
      return;
    }
    setPhase("exit");
    timers.current.push(
      window.setTimeout(() => {
        setActive(id);
        setPhase("in");
      }, 120),
      window.setTimeout(() => setPhase("ready"), 280),
    );
  }

  const rows = t.raw(`${active}.rows`) as Array<{ label: string; value: string }>;
  const signalIdx = new Set(SIGNAL_ROWS[active]);
  const punch = active === "delivery" ? t("delivery.punch") : null;
  const statusBuilding = active === "delivery";

  return (
    <section className="px-value" id="control-value" data-nav-theme="light">
      <div className="rx-shell px-value-layout">
        <div>
          <header className="px-section-head">
            <p className="rx-kicker">{t("kicker")}</p>
            <h2 className="px-section-title">
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
            </h2>
            <p className="px-section-lead">{t("lead")}</p>
          </header>
          <div
            className="px-value-tabs"
            role="tablist"
            aria-label={t("tabsAria")}
          >
            {DEMO_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active === id}
                className="px-value-tab"
                data-active={active === id ? "true" : "false"}
                onClick={() => select(id)}
              >
                {t(`tabs.${id}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="rx-prod-stage px-value-stage">
          <div className="rx-prod-plate" aria-hidden="true" />
          <div
            className="rx-prod-board px-value-panel"
            data-phase={phase}
            role="tabpanel"
            aria-label={t(`tabs.${active}`)}
          >
            <div className="rx-prod-chrome">
              <span className="rx-prod-chrome-left">
                <i aria-hidden="true" />
                {DEMO_TERR[active]}
              </span>
              <span className="rx-prod-chrome-right">
                {statusBuilding ? t("building") : t("requiresReview")}
              </span>
            </div>
            <div className="rx-prod-body">
              <p className="px-value-context">{t(`${active}.context`)}</p>
              {punch ? <p className="px-value-punch">{punch}</p> : null}
              <div className="px-value-rows">
                {rows.map((row, i) => (
                  <div
                    key={row.label}
                    className="px-value-row"
                    data-signal={signalIdx.has(i) ? "true" : "false"}
                  >
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="px-value-outcome">
                <p className="px-value-outcome-label">
                  {t(`${active}.outcomeLabel`)}
                </p>
                <p className="px-value-outcome-value">
                  {t(`${active}.outcomeValue`)}
                </p>
                <p className="px-value-outcome-sub">
                  {t(`${active}.outcomeSub`)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
