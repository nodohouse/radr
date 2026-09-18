"use client";

import Image from "next/image";
import { platformHrefForItem } from "./navConfig";
import {
  BRIEF_ATTENTION,
  CANON_ORPHAN,
  CANON_OTA,
  CANON_PEAK,
  money,
} from "@/data/demo";

type PreviewRow = { label: string; value: string };

type PreviewModel = {
  kicker: string;
  title: string;
  metric?: string;
  metricLabel?: string;
  rows?: PreviewRow[];
  cta: string;
};

const VERTICAL_HINT = ["Restaurant", "Hotel", "Aparthotel"] as const;

const PREVIEWS: Record<string, PreviewModel> = {
  overview: {
    kicker: "Platform",
    title: "One loop. Three environments.",
    rows: [
      {
        label: "Restaurant",
        value: `${money(CANON_PEAK.exposureEuro)} · ${CANON_PEAK.displayId}`,
      },
      {
        label: "Hotel",
        value: `${money(CANON_OTA.exposureEuro)} · ${CANON_OTA.displayId}`,
      },
      {
        label: "Aparthotel",
        value: `${money(CANON_ORPHAN.exposureEuro)} · ${CANON_ORPHAN.displayId}`,
      },
    ],
    cta: "See one variance → Trace",
  },
  decisions: {
    kicker: "Decision",
    title: CANON_PEAK.title,
    metric: money(CANON_PEAK.exposureEuro),
    metricLabel: "vs seat-now · Berlin Mitte",
    rows: [
      { label: "Deadline", value: CANON_PEAK.deadline },
      { label: "Recommended", value: "Wait 12 minutes" },
    ],
    cta: "Open Decision Trace",
  },
  controlCenter: {
    kicker: "Control Center",
    title: "Only what needs you",
    metric: String(BRIEF_ATTENTION.needsYou),
    metricLabel: "need you",
    rows: [
      { label: "RADR handling", value: String(BRIEF_ATTENTION.handling) },
      { label: "Watching", value: String(BRIEF_ATTENTION.watching) },
      {
        label: "Verified today",
        value: money(BRIEF_ATTENTION.verifiedTodayEuro),
      },
    ],
    cta: "Open Control Center",
  },
  futures: {
    kicker: "Futures",
    title: "Play it forward",
    rows: [
      {
        label: "Wait 12 min",
        value: money(CANON_PEAK.expectedProtectedEuro),
      },
      { label: "Hard stop", value: money(180) },
      { label: "Seat now", value: money(0) },
    ],
    cta: "Compare Futures",
  },
  findings: {
    kicker: "Finding",
    title: "What may deserve a Decision",
    metric: money(CANON_OTA.exposureEuro),
    metricLabel: `channel drag · ${CANON_OTA.displayId}`,
    rows: [
      { label: "OTA share", value: "+11 pts" },
      { label: "Eligibility", value: "→ Decision" },
    ],
    cta: "View evidence",
  },
  actions: {
    kicker: "Prepared",
    title: "Hold premium direct · 72h",
    metric: money(CANON_OTA.expectedProtectedEuro),
    metricLabel: `${CANON_OTA.property}`,
    rows: [
      { label: "Not", value: "OTA dump" },
      { label: "Status", value: "AWAITING APPROVAL" },
    ],
    cta: "Review action",
  },
  verifiedValue: {
    kicker: "Verified",
    title: "Protected after the night",
    metric: money(CANON_ORPHAN.actualProtectedEuro),
    metricLabel: `recovered · ${CANON_ORPHAN.displayId}`,
    rows: [
      { label: "Exposure", value: money(CANON_ORPHAN.exposureEuro) },
      { label: "Orphan gap", value: "Direct fill · 24h wait" },
    ],
    cta: "See Verified Value",
  },
  memory: {
    kicker: "Memory",
    title: "Playbook evolved",
    rows: [
      { label: "From", value: "Raise rate on OTA" },
      { label: "To", value: "Hold premium direct" },
      { label: "Pattern", value: "Shoulder sell-outs · 6 / 9" },
    ],
    cta: "Operating Memory",
  },
  connections: {
    kicker: "Connect",
    title: "Start with what you have",
    rows: [
      { label: "Files · APIs · systems", value: "Supported" },
      { label: "Mature stack required", value: "No" },
    ],
    cta: "View connections",
  },
  operatingModel: {
    kicker: "Operating model",
    title: "How RADR understands the house",
    rows: [
      { label: "Locations", value: "Mapped" },
      { label: "Decision types", value: "Policy-bound" },
    ],
    cta: "View model",
  },
  developers: {
    kicker: "Developers",
    title: "Events → Decisions → Value",
    rows: [{ label: "Status", value: "Proposed API · Sandbox coming" }],
    cta: "Developers",
  },
  security: {
    kicker: "Trust",
    title: "Evidence grades · honest controls",
    rows: [{ label: "Writes to PMS/POS", value: "Never faked" }],
    cta: "Trust & Security",
  },
};

const INTEL_SCENES = [
  {
    vertical: "Restaurant",
    src: "/demo/facilities/berlin-dining.jpg",
    line: `${money(CANON_PEAK.exposureEuro)} · ${CANON_PEAK.displayId}`,
  },
  {
    vertical: "Hotel",
    src: "/demo/facilities/canal-deluxe-king.jpg",
    line: `${money(CANON_OTA.exposureEuro)} · ${CANON_OTA.displayId}`,
  },
  {
    vertical: "Aparthotel",
    src: "/demo/facilities/lisbon-onebed.jpg",
    line: `${money(CANON_ORPHAN.exposureEuro)} · ${CANON_ORPHAN.displayId}`,
  },
] as const;

function VerticalHint() {
  return (
    <p className="rx-np-live-verticals" aria-hidden="true">
      {VERTICAL_HINT.map((name, i) => (
        <span key={name}>
          {i > 0 ? (
            <span className="rx-np-live-verticals-sep" aria-hidden="true">
              {" "}
              ·{" "}
            </span>
          ) : null}
          {name}
        </span>
      ))}
    </p>
  );
}

/**
 * Compact contextual preview for Platform popover.
 */
export function PlatformLivePreview({ itemKey }: { itemKey: string }) {
  const model = PREVIEWS[itemKey] ?? PREVIEWS.overview;
  const href = platformHrefForItem(itemKey) ?? "/product";

  return (
    <div className="rx-np-live" aria-hidden="true">
      <p className="rx-np-live-kicker">{model.kicker}</p>
      <VerticalHint />
      <p className="rx-np-live-title">{model.title}</p>
      {model.metric ? (
        <div className="rx-np-live-metric">
          <strong>{model.metric}</strong>
          {model.metricLabel ? <span>{model.metricLabel}</span> : null}
        </div>
      ) : null}
      {model.rows?.length ? (
        <ul className="rx-np-live-rows">
          {model.rows.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </li>
          ))}
        </ul>
      ) : null}
      <span className="rx-np-live-cta">
        {model.cta} <span aria-hidden="true">→</span>
      </span>
      <span className="rx-np-live-href" data-href={href} hidden />
    </div>
  );
}

/** Intelligence nav — equal-weight facility scenes, not one vertical. */
export function IntelligenceLivePreview() {
  return (
    <div className="rx-np-live rx-np-live-intel" aria-hidden="true">
      <p className="rx-np-live-kicker">Intelligence</p>
      <p className="rx-np-live-title">Territories across the house</p>
      <ul className="rx-np-intel-scenes">
        {INTEL_SCENES.map((scene) => (
          <li key={scene.vertical}>
            <div className="rx-np-intel-scene">
              <Image
                src={scene.src}
                alt=""
                fill
                sizes="120px"
                className="rx-np-intel-scene-img"
              />
            </div>
            <span className="rx-np-intel-scene-label">{scene.vertical}</span>
            <strong className="rx-np-intel-scene-line">{scene.line}</strong>
          </li>
        ))}
      </ul>
      <span className="rx-np-live-cta">
        Open Intelligence <span aria-hidden="true">→</span>
      </span>
    </div>
  );
}

/** @deprecated static previews - prefer PlatformLivePreview */
export function NavProductPreview({
  caption,
}: {
  caption?: { title: string; desc: string; cta: string };
}) {
  return (
    <div className="rx-np-live">
      <PlatformLivePreview itemKey="overview" />
      {caption ? (
        <div className="rx-np-live-caption">
          <strong>{caption.title}</strong>
          <span>{caption.desc}</span>
        </div>
      ) : null}
    </div>
  );
}
