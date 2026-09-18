"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useDocumentVisible,
  useReducedMotionSafe,
} from "@/components/marketing/motion/useReducedMotionSafe";

const CHAIN_RAIN = [
  "rain",
  "terrace",
  "absorb",
  "staff",
  "delivery",
  "exposure",
] as const;

const CHAIN_SUN = [
  "sun",
  "terrace",
  "covers",
  "staff",
  "walkins",
  "exposure",
] as const;

const OPTIONS = ["a", "b", "c"] as const;
type Weather = "rain" | "sun";

/** Full weather dwell — leave room for the 3.2s morph + copy crossfade. */
const CYCLE_MS = 14000;
const COPY_FADE_MS = 520;

/**
 * Scene 4 — Live causal instrument: weather shifts, RADR responds.
 * Rain ↔ sun with a soft sunrise crossfade; options lead with economics.
 */
export function SectionSignalDecision() {
  const t = useTranslations("homepage.signalDecision");
  const reduced = useReducedMotionSafe();
  const visible = useDocumentVisible();
  const [weather, setWeather] = useState<Weather>("rain");
  const [copy, setCopy] = useState<Weather>("rain");
  const [copyOn, setCopyOn] = useState(true);

  useEffect(() => {
    if (reduced || !visible) return;
    const id = window.setInterval(() => {
      setWeather((w) => (w === "rain" ? "sun" : "rain"));
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduced, visible]);

  useEffect(() => {
    if (weather === copy) return;
    if (reduced) {
      setCopy(weather);
      setCopyOn(true);
      return;
    }

    setCopyOn(false);
    const swap = window.setTimeout(() => {
      setCopy(weather);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setCopyOn(true));
      });
    }, COPY_FADE_MS);

    return () => window.clearTimeout(swap);
  }, [weather, copy, reduced]);

  const chain = copy === "rain" ? CHAIN_RAIN : CHAIN_SUN;
  const chainNs = copy === "rain" ? "chain" : "chainSun";
  const optionsNs = copy === "rain" ? "options" : "optionsSun";
  const recommended = copy === "rain" ? "c" : "b";

  return (
    <section
      className="rx-scene rx-scene-signal"
      data-mode="flow"
      data-weather={weather}
      data-nav-theme="light"
      id="signal-decision"
    >
      <div className="rx-shell">
        <div className="rx-signal-head">
          <p className="rx-signal-kicker">{t("kicker")}</p>
          <h2
            className="rx-scene-display rx-signal-copy"
            data-on={copyOn ? "true" : "false"}
          >
            {copy === "rain" ? t("title") : t("titleSun")}
          </h2>
        </div>

        <div className="rx-signal-board">
          <div className="rx-signal-chain-wrap" data-weather={weather}>
            <span className="rx-signal-bg rx-signal-bg-rain" aria-hidden="true" />
            <span className="rx-signal-bg rx-signal-bg-sun" aria-hidden="true" />

            <div className="rx-signal-weather" aria-hidden="true">
              <div
                className="rx-signal-sky rx-signal-sky-rain"
                data-on={weather === "rain" ? "true" : "false"}
              >
                {Array.from({ length: 22 }, (_, i) => (
                  <i
                    key={i}
                    data-drop=""
                    style={{
                      ["--x" as string]: `${3 + ((i * 4.6) % 94)}%`,
                      ["--d" as string]: `${(i % 10) * 0.18}s`,
                      ["--h" as string]: `${0.5 + (i % 5) * 0.18}`,
                      ["--dur" as string]: `${1.55 + (i % 5) * 0.12}s`,
                    }}
                  />
                ))}
              </div>

              <div
                className="rx-signal-sky rx-signal-sky-sun"
                data-on={weather === "sun" ? "true" : "false"}
              >
                <span className="rx-signal-dawn" />
                <div className="rx-signal-sun-anchor" aria-hidden="true">
                  <div className="rx-signal-sun-spin">
                    {Array.from({ length: 14 }, (_, i) => (
                      <i
                        key={i}
                        data-ray=""
                        style={{
                          ["--a" as string]: `${i * (360 / 14)}deg`,
                          ["--d" as string]: `${(i % 7) * 0.28}s`,
                          ["--len" as string]: `${1.05 + (i % 4) * 0.32}`,
                          ["--w" as string]: `${1.8 + (i % 5) * 0.7}`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="rx-signal-sun-glow" />
                  <span className="rx-signal-sun" />
                </div>
              </div>
            </div>

            <ol
              className="rx-signal-chain rx-signal-copy"
              data-on={copyOn ? "true" : "false"}
              aria-label={t("chainAria")}
            >
              {chain.map((id, i) => (
                <li
                  key={`${copy}-${id}`}
                  style={{ ["--i" as string]: i }}
                  data-last={i === chain.length - 1 ? "true" : "false"}
                  data-value={id === "exposure" ? "true" : "false"}
                >
                  <span className="rx-signal-node" aria-hidden="true" />
                  <div>
                    <strong>{t(`${chainNs}.${id}.label`)}</strong>
                    <span>{t(`${chainNs}.${id}.detail`)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div
            className="rx-signal-panel rx-signal-copy"
            data-on={copyOn ? "true" : "false"}
          >
            <div className="rx-signal-panel-top">
              <p className="rx-signal-fork">
                {copy === "rain" ? t("fork") : t("forkSun")}
              </p>
              <p className="rx-signal-stake">
                {copy === "rain" ? t("stake") : t("stakeSun")}
              </p>
            </div>

            <ul className="rx-signal-options" aria-label={t("optionsAria")}>
              {OPTIONS.map((id) => (
                <li
                  key={id}
                  data-option={id}
                  data-recommended={id === recommended ? "true" : "false"}
                >
                  <p className="rx-signal-opt-k">
                    {t(`${optionsNs}.${id}.label`)}
                  </p>
                  <h3>{t(`${optionsNs}.${id}.title`)}</h3>
                  <p className="rx-signal-opt-net">
                    {t(`${optionsNs}.${id}.net`)}
                  </p>
                  <p className="rx-signal-opt-why">
                    {t(`${optionsNs}.${id}.why`)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="rx-signal-value">
              <div>
                <em>{t("valueDeltaLabel")}</em>
                <strong>
                  {copy === "rain" ? t("valueDelta") : t("valueDeltaSun")}
                </strong>
              </div>
              <div>
                <em>{t("valueProtectLabel")}</em>
                <span>
                  {copy === "rain" ? t("valueProtect") : t("valueProtectSun")}
                </span>
              </div>
            </div>

            <div className="rx-signal-decide">
              <div className="rx-signal-decide-meta">
                <p>
                  <em>{t("recommendLabel")}</em>
                  <strong>
                    {copy === "rain" ? t("recommend") : t("recommendSun")}
                  </strong>
                </p>
                <p>
                  <em>{t("confidenceLabel")}</em>
                  <span>
                    {copy === "rain" ? t("confidence") : t("confidenceSun")}
                  </span>
                </p>
                <p>
                  <em>{t("deadlineLabel")}</em>
                  <span>
                    {copy === "rain" ? t("deadline") : t("deadlineSun")}
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="rx-btn rx-btn-primary"
                tabIndex={-1}
              >
                {t("approve")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
