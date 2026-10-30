"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  STATION_INSPECTORS,
  TABLES,
  ZONE_INSPECTORS,
  type LiveLens,
  type LiveStationId,
  type LiveZoneId,
  type ZoneInspector,
} from "./liveSpatialData";

type Props = {
  lens: LiveLens;
  zone: LiveZoneId | null;
  station: LiveStationId | null;
  tableId: string | null;
  simulating: boolean;
  simCalm: boolean;
  compare: boolean;
  onClose: () => void;
  onPreview: () => void;
  onToggleCompare: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

type InspTab = "live" | "forecast" | "financial";

function KitchenPanel({
  data,
  simulating,
  simCalm,
  compare,
  tab,
  onTab,
  onPreview,
  onToggleCompare,
}: {
  data: ZoneInspector;
  simulating: boolean;
  simCalm: boolean;
  compare: boolean;
  tab: InspTab;
  onTab: (t: InspTab) => void;
  onPreview: () => void;
  onToggleCompare: () => void;
}) {
  return (
    <>
      <header className="ls-panel-head">
        <div>
          <h2>Kitchen</h2>
          <span className="ls-sev-pill" data-sev="intervene">
            High pressure
          </span>
        </div>
        {simCalm ? <span className="ls-sim-pill">SIMULATED</span> : null}
      </header>

      <div className="ls-insp-tabs" role="tablist" aria-label="Kitchen lens">
        {(
          [
            ["live", "Live"],
            ["forecast", "Forecast"],
            ["financial", "Financial"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            data-active={tab === id ? "true" : undefined}
            data-testid={`ls-insp-tab-${id}`}
            onClick={() => onTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "live" || tab === "forecast" ? (
        <>
          <div className="ls-station-loads">
            <div data-tone="bad">
              <span>Hot Line</span>
              <strong>{simCalm ? "83%" : "91%"}</strong>
            </div>
            <div>
              <span>Cold</span>
              <strong>76%</strong>
            </div>
            <div>
              <span>Pass</span>
              <strong>{simCalm ? "72%" : "84%"}</strong>
            </div>
          </div>

          <dl className="ls-insp-metrics ls-insp-metrics--grid">
            <div>
              <dt>Average ticket</dt>
              <dd>{simCalm ? "14 min" : "18 min"}</dd>
            </div>
            <div>
              <dt>Oldest ticket</dt>
              <dd>24 min</dd>
            </div>
            <div>
              <dt>Orders waiting</dt>
              <dd>{simCalm ? "9" : "17"}</dd>
            </div>
            <div>
              <dt>Orders/hour</dt>
              <dd>42</dd>
            </div>
          </dl>

          <div className="ls-peak-block">
            <div>
              <span>Next peak</span>
              <strong>20:06</strong>
            </div>
            <div>
              <span>Expected load</span>
              <strong data-tone="bad">96%</strong>
            </div>
          </div>
        </>
      ) : (
        <dl className="ls-insp-metrics ls-insp-metrics--grid">
          <div>
            <dt>COGS</dt>
            <dd>32.8%</dd>
          </div>
          <div>
            <dt>Labor tonight</dt>
            <dd>€1.2k</dd>
          </div>
          <div>
            <dt>Exposure</dt>
            <dd data-tone="bad">{simCalm ? "€140" : "€410"}</dd>
          </div>
          <div>
            <dt>Contribution at risk</dt>
            <dd data-tone="bad">{simCalm ? "€140" : "€420"}</dd>
          </div>
        </dl>
      )}

      <div className="ls-panel-note">
        <p className="ls-k">RADR sees</p>
        <p>
          Delivery is responsible for 18% of the current hot-line load increase.
        </p>
      </div>

      <ul className="ls-downstream">
        <li>3 table turns at risk</li>
        <li>+4 min expected ticket delay</li>
        <li>€420 contribution exposed</li>
      </ul>

      <div className="ls-panel-note" data-decision="true">
        <p className="ls-k">RADR Decision</p>
        <h3>Throttle delivery intake for 12 minutes.</h3>
        <p className="ls-insp-value">
          Expected value:{" "}
          <strong>{data.expectedValue.replace(" protected", "")}</strong>
        </p>
        {simulating || simCalm ? (
          <ul className="ls-insp-expected">
            {data.expected.map((e) => (
              <li key={e.label}>
                <span>{e.label}</span>
                <strong>
                  <s>{e.before}</s> {e.after}
                </strong>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {compare && data.compare ? (
        <div className="ls-compare" data-testid="ls-compare">
          <div>
            <p className="ls-k">Do nothing</p>
            <ul>
              {data.compare.doNothing.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div data-radr="true">
            <p className="ls-k">RADR</p>
            <ul>
              {data.compare.radr.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="ls-panel-actions">
        <button
          type="button"
          className="ls-cta"
          data-testid="ls-preview-impact"
          onClick={onPreview}
        >
          Preview Impact →
        </button>
        <button
          type="button"
          className="ls-ghost"
          data-testid="ls-compare-futures"
          onClick={onToggleCompare}
        >
          {compare ? "Hide compare" : "Compare futures"}
        </button>
        <Link
          href={`/app/decisions/${data.decisionId}`}
          className="ls-ghost"
          data-testid="ls-review-decision"
        >
          Review Decision
        </Link>
      </div>
    </>
  );
}

function ZoneBody({
  data,
  simulating,
  simCalm,
  compare,
  onPreview,
  onToggleCompare,
}: {
  data: ZoneInspector;
  simulating: boolean;
  simCalm: boolean;
  compare: boolean;
  onPreview: () => void;
  onToggleCompare: () => void;
}) {
  const canSim = data.expected.length > 0;
  return (
    <>
      <header className="ls-panel-head">
        <div>
          <h2>{data.headline}</h2>
          <span className="ls-sev-pill" data-sev={data.severity}>
            {data.severityLabel}
          </span>
        </div>
        {simCalm ? <span className="ls-sim-pill">SIMULATED</span> : null}
      </header>

      <dl className="ls-insp-metrics ls-insp-metrics--grid">
        {data.metrics.map((m) => (
          <div key={m.label}>
            <dt>{m.label}</dt>
            <dd>
              {simulating && m.after ? (
                <>
                  <s>{m.value}</s> {m.after}
                </>
              ) : (
                m.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="ls-panel-note">
        <p className="ls-k">RADR sees</p>
        <p>{data.radrSees}</p>
      </div>

      <div className="ls-panel-note" data-decision="true">
        <p className="ls-k">RADR Decision</p>
        <h3>{data.decision}</h3>
        <p className="ls-insp-value">{data.expectedValue}</p>
      </div>

      {compare && data.compare ? (
        <div className="ls-compare" data-testid="ls-compare">
          <div>
            <p className="ls-k">Do nothing</p>
            <ul>
              {data.compare.doNothing.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div data-radr="true">
            <p className="ls-k">RADR</p>
            <ul>
              {data.compare.radr.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="ls-panel-actions">
        {canSim ? (
          <button
            type="button"
            className="ls-cta"
            data-testid="ls-preview-impact"
            onClick={onPreview}
          >
            Preview Impact →
          </button>
        ) : null}
        {data.compare ? (
          <button
            type="button"
            className="ls-ghost"
            data-testid="ls-compare-futures"
            onClick={onToggleCompare}
          >
            {compare ? "Hide compare" : "Compare futures"}
          </button>
        ) : null}
        <Link
          href={`/app/decisions/${data.decisionId}`}
          className="ls-ghost"
          data-testid="ls-review-decision"
        >
          Review Decision
        </Link>
      </div>
    </>
  );
}

export function LiveInspector({
  lens,
  zone,
  station,
  tableId,
  simulating,
  simCalm,
  compare,
  onClose,
  onPreview,
  onToggleCompare,
}: Props) {
  const [tab, setTab] = useState<InspTab>("live");
  const table = tableId ? TABLES.find((t) => t.id === tableId) : null;
  const stationData = station ? STATION_INSPECTORS[station] : null;
  const zoneData = zone ? ZONE_INSPECTORS[lens][zone] : null;
  const open = Boolean(table || stationData || zoneData);
  const isKitchen = zone === "kitchen" && !table && !stationData;

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          key={`${zone}-${station}-${tableId}`}
          className="ls-panel ls-venue-panel"
          data-testid="ls-inspector"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.24, ease: EASE }}
        >
          <button
            type="button"
            className="ls-insp-close"
            aria-label="Close inspector"
            data-testid="ls-insp-close"
            onClick={onClose}
          >
            ✕
          </button>

          {table ? (
            <>
              <header className="ls-panel-head">
                <div>
                  <h2>Table {table.id.replace(/^t/i, "").toUpperCase()}</h2>
                  <span
                    className="ls-sev-pill"
                    data-sev={table.turnRisk === "HIGH" ? "intervene" : "watch"}
                  >
                    Turn risk {table.turnRisk}
                  </span>
                </div>
              </header>
              <dl className="ls-insp-metrics ls-insp-metrics--grid">
                <div>
                  <dt>Covers</dt>
                  <dd>{table.covers}</dd>
                </div>
                <div>
                  <dt>Seated</dt>
                  <dd>{table.seated}</dd>
                </div>
                <div>
                  <dt>Stage</dt>
                  <dd>{table.stage}</dd>
                </div>
                <div>
                  <dt>Expected finish</dt>
                  <dd>{table.expectedFinish}</dd>
                </div>
                <div>
                  <dt>Next reservation</dt>
                  <dd>{table.nextReservation}</dd>
                </div>
              </dl>
              <div className="ls-panel-note">
                <p className="ls-k">RADR sees</p>
                <p>{table.radrSees}</p>
              </div>
              <div className="ls-panel-actions">
                {table.actions.map((a) => (
                  <button key={a} type="button" className="ls-ghost">
                    {a}
                  </button>
                ))}
              </div>
            </>
          ) : stationData ? (
            <>
              <header className="ls-panel-head">
                <div>
                  <h2>{stationData.label}</h2>
                  <span className="ls-sev-pill" data-sev="intervene">
                    Station
                  </span>
                </div>
              </header>
              <dl className="ls-insp-metrics ls-insp-metrics--grid">
                {stationData.metrics.map((m) => (
                  <div key={m.label}>
                    <dt>{m.label}</dt>
                    <dd>{m.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="ls-panel-note">
                <p className="ls-k">RADR sees</p>
                <p>{stationData.radrSees}</p>
              </div>
            </>
          ) : isKitchen && zoneData ? (
            <KitchenPanel
              data={zoneData}
              simulating={simulating}
              simCalm={simCalm}
              compare={compare}
              tab={tab}
              onTab={setTab}
              onPreview={onPreview}
              onToggleCompare={onToggleCompare}
            />
          ) : zoneData ? (
            <ZoneBody
              data={zoneData}
              simulating={simulating}
              simCalm={simCalm}
              compare={compare}
              onPreview={onPreview}
              onToggleCompare={onToggleCompare}
            />
          ) : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
