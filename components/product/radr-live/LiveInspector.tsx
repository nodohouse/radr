"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { LiveEntity } from "@/lib/radr/spatial-live/types";
import { useAskRadrOptional } from "@/components/product/ask/AskRadrContext";

type Props = {
  entity: LiveEntity | null;
  vertical?: "restaurant" | "hotel";
  onClose: () => void;
  onSimulate?: (progress: number) => void;
  onEnterVenue?: () => void;
};

const DELIVERY_SIM = {
  before: [
    { label: "Delivery", value: "34%" },
    { label: "Kitchen load", value: "91%" },
    { label: "Contribution exposure", value: "€420" },
  ],
  after: [
    { label: "Delivery", value: "24%" },
    { label: "Kitchen load", value: "83%" },
    { label: "Contribution protected", value: "+€280" },
  ],
};

const HK_SIM = {
  before: [
    { label: "Floor 7 ready", value: "6" },
    { label: "At risk before 15:00", value: "11" },
    { label: "Exposure", value: "€1,840" },
  ],
  after: [
    { label: "Floor 7 ready", value: "17" },
    { label: "At risk before 15:00", value: "0" },
    { label: "Protected", value: "€1,840" },
  ],
};

const LOC_THUMB: Record<string, string> = {
  loc_berlin_mitte: "/demo/facilities/berlin-dining.jpg",
  loc_berlin_kreuzberg: "/demo/facilities/berlin-bar.jpg",
  loc_hamburg_hafen: "/demo/facilities/berlin-terrace.jpg",
  loc_frankfurt_westend: "/demo/facilities/berlin-dining.jpg",
  loc_munich_altstadt: "/demo/facilities/berlin-bar.jpg",
  loc_koln_ehrenfeld: "/demo/facilities/berlin-terrace.jpg",
  loc_dusseldorf_medienhafen: "/demo/facilities/berlin-dining.jpg",
  loc_stuttgart_mitte: "/demo/facilities/berlin-bar.jpg",
  loc_canal_house: "/demo/facilities/berlin-dining.jpg",
  loc_ams_harbour: "/demo/facilities/berlin-terrace.jpg",
  loc_schiphol_gate: "/demo/facilities/berlin-bar.jpg",
  loc_lisbon_alfama: "/demo/facilities/berlin-dining.jpg",
  loc_berlin_mitte_hotel: "/demo/facilities/berlin-dining.jpg",
  loc_paris_opera: "/demo/facilities/berlin-bar.jpg",
  loc_london_clerkenwell: "/demo/facilities/berlin-terrace.jpg",
  loc_munich_airport: "/demo/facilities/berlin-dining.jpg",
};

const RADR_SEES_BULLETS: Record<string, { text: string; sev: string }[]> = {
  loc_berlin_mitte: [
    { text: "Dinner demand up +18% this week", sev: "healthy" },
    { text: "Labor cost holding within plan band", sev: "healthy" },
    { text: "Guest spend rising on wine attach", sev: "watch" },
  ],
  loc_canal_house: [
    { text: "11 priority rooms at risk before 15:00 check-in", sev: "intervene" },
    { text: "Floor 7 lag · attendants available on Floors 3–4", sev: "watch" },
    { text: "Wave 14:00–15:30 · lobby queue tracks readiness", sev: "watch" },
  ],
};

type Tab = "overview" | "operations" | "demand" | "guests" | "readiness" | "arrivals";

export function LiveInspector({
  entity,
  vertical = "restaurant",
  onClose,
  onSimulate,
  onEnterVenue,
}: Props) {
  const ask = useAskRadrOptional();
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const isHotel = vertical === "hotel" || entity?.vertical === "hotel";

  useEffect(() => {
    setPreview(false);
    setTab("overview");
    onSimulate?.(0);
  }, [entity?.id, onSimulate]);

  useEffect(() => {
    if (!preview || !onSimulate) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      onSimulate(e);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [preview, onSimulate]);

  const isDelivery = Boolean(entity?.id.includes("zone_delivery"));
  const isHk =
    isHotel &&
    Boolean(
      entity?.type === "floor" ||
        entity?.type === "room" ||
        entity?.type === "property" ||
        entity?.decisionIds?.length,
    );
  const isSite =
    entity?.type === "location" || entity?.type === "property";
  const isDepth =
    isSite ||
    entity?.type === "floor" ||
    entity?.type === "department" ||
    entity?.type === "room";
  const thumb = entity ? LOC_THUMB[entity.id] : null;
  const sees =
    (entity && RADR_SEES_BULLETS[entity.id]) ??
    (entity ? [{ text: entity.radrSees, sev: entity.severity }] : []);
  const conf = entity?.confidence
    ? `${Math.round(entity.confidence * 100)}%`
    : null;

  const hotelTabs = [
    ["overview", "Overview"],
    ["readiness", "Readiness"],
    ["arrivals", "Arrivals"],
    ["guests", "Guests"],
  ] as const;
  const restTabs = [
    ["overview", "Overview"],
    ["operations", "Operations"],
    ["demand", "Demand"],
    ["guests", "Guests"],
  ] as const;

  const enterLabel = isHotel ? "Enter Property" : "Enter Venue";
  const sim = isHotel ? HK_SIM : DELIVERY_SIM;
  const canPreview = isDelivery || (isHotel && isHk && entity?.decisionIds?.[0]);

  return (
    <AnimatePresence>
      {entity ? (
        <motion.aside
          key={entity.id}
          className="rp-live3-inspector rv-live-inspector"
          data-kind={isSite ? "location" : entity.type}
          data-vertical={isHotel ? "hotel" : "restaurant"}
          aria-label={`${entity.label} detail`}
          initial={{ x: 28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {thumb ? (
            <div className="rv-insp-hero">
              <Image
                src={thumb}
                alt=""
                width={360}
                height={140}
                className="rv-insp-hero-img"
              />
              <div className="rv-insp-hero-veil" />
            </div>
          ) : null}

          <header className="rp-live3-insp-head">
            <div>
              <h2>{entity.label}</h2>
              <p className="rp-live3-status" data-sev={entity.severity}>
                <i data-dot={entity.severity} />
                {entity.status}
              </p>
            </div>
            <button
              type="button"
              className="rp-live3-insp-close"
              onClick={onClose}
              aria-label="Close inspector"
            >
              ×
            </button>
          </header>

          {isDepth ? (
            <div
              className="rv-insp-tabs"
              role="tablist"
              aria-label={isHotel ? "Property depth" : "Location depth"}
            >
              {(isHotel ? hotelTabs : restTabs).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  data-active={tab === id ? "true" : undefined}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          <ul className="rp-live3-metrics rv-insp-metrics">
            {entity.metrics.map((m) => (
              <li key={m.id} data-tone={m.tone}>
                <span>{m.label}</span>
                <strong>{m.value}</strong>
                {m.delta ? <em data-tone={m.tone}>{m.delta}</em> : null}
                {!isHotel ? (
                  <i className="rv-insp-metric-bars" aria-hidden>
                    {[4, 7, 5, 9, 6, 8, 10].map((h, i) => (
                      <b key={i} style={{ height: `${40 + h * 5}%` }} />
                    ))}
                  </i>
                ) : null}
              </li>
            ))}
          </ul>

          <section>
            <p className="rp-live3-k">RADR sees</p>
            <ul className="rv-insp-sees">
              {sees.map((row) => (
                <li key={row.text}>
                  <span className="rv-status" data-sev={row.sev}>
                    <i />
                  </span>
                  {row.text}
                </li>
              ))}
            </ul>
          </section>

          {entity.decisionIds[0] ? (
            <section className="rv-insp-decision">
              <p className="rp-live3-k">Active Decision</p>
              <div className="rv-decision-card">
                <h3>
                  {entity.driver || `Decision for ${entity.label}`}
                </h3>
                {entity.expectedValue ? (
                  <p className="rv-decision-econ">
                    Simulated impact {entity.expectedValue}
                  </p>
                ) : null}
                {conf ? (
                  <p className="rp-live3-body">Confidence {conf}</p>
                ) : null}

                {canPreview && preview ? (
                  <div className="rp-live3-sim" aria-live="polite">
                    <p className="rp-live3-k">Preview impact</p>
                    {sim.after.map((row, i) => (
                      <div className="rp-live3-sim-row" key={row.label}>
                        <span>
                          {row.label}
                          <em>was {sim.before[i]?.value}</em>
                        </span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="rv-decision-actions">
                  {canPreview && !preview ? (
                    <button
                      type="button"
                      className="rv-btn"
                      data-primary="true"
                      onClick={() => setPreview(true)}
                    >
                      {isHotel ? "Approve & Reassign" : "Review & Approve"}
                    </button>
                  ) : (
                    <Link
                      href={`/app/decisions/${entity.decisionIds[0]}`}
                      className="rv-btn"
                      data-primary="true"
                    >
                      {isHotel ? "Approve & Reassign" : "Review & Approve"}
                    </Link>
                  )}
                  <Link
                    href={`/app/decisions/${entity.decisionIds[0]}`}
                    className="rv-btn"
                  >
                    View Simulation
                  </Link>
                  {isSite && onEnterVenue ? (
                    <button
                      type="button"
                      className="rv-btn"
                      onClick={onEnterVenue}
                    >
                      {enterLabel}
                    </button>
                  ) : null}
                </div>
              </div>
            </section>
          ) : (
            <div className="rp-live3-actions">
              {isSite && onEnterVenue ? (
                <button
                  type="button"
                  className="rv-btn"
                  data-primary="true"
                  onClick={onEnterVenue}
                >
                  {enterLabel}
                </button>
              ) : null}
              <button
                type="button"
                className="rv-btn"
                onClick={() =>
                  ask?.openAsk({
                    query: isHotel
                      ? `How is ${entity.label} readiness and arrivals?`
                      : `How is ${entity.label} performing?`,
                    entityId: entity.id,
                    entityLabel: entity.label,
                  })
                }
              >
                Ask RADR
              </button>
            </div>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
