"use client";

/**
 * PASS 1–3 — Live Estate spatial world.
 * Visual source of truth: visual/live-storyboard-reference.jpg panels 1–3.
 * Architecture = high-res fictional raster. Labels/metrics = HTML overlays only.
 */

import Link from "next/link";
import { useState } from "react";
import {
  estateDaypartForLocation,
  estateLocalClockLabel,
} from "@/lib/radr/live/estateDaypart";
import { ESTATE_SITES, type EstateSev, type EstateSite } from "./estateSites";
import { CLOCK_LABEL } from "./liveSpatialData";

type EstateTab = "Live" | "Trends" | "Drivers" | "Decisions";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onEnterVenue: (site: EstateSite) => void;
};

function sevLabel(s: EstateSev) {
  if (s === "intervene") return "Intervene";
  if (s === "watch") return "Watch";
  return "Healthy";
}

const ESTATE_ART = {
  src: "/live/estate/estate-world-base.jpg",
  src2x: "/live/estate/estate-world-base@2x.jpg",
  w: 1280,
  h: 720,
};

export function EstateWorld({
  selectedId,
  onSelect,
  onClose,
  onEnterVenue,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tab, setTab] = useState<EstateTab>("Live");

  const selected = selectedId
    ? (ESTATE_SITES.find((s) => s.id === selectedId) ?? null)
    : null;
  const hovered =
    !selected && hoveredId
      ? (ESTATE_SITES.find((s) => s.id === hoveredId) ?? null)
      : null;

  return (
    <div className="ls-estate" data-testid="ls-estate" data-pass="2">
      <header className="ls-estate-hero">
        <div className="ls-estate-title-row">
          <h1 className="ls-estate-title">Live Estate</h1>
          <span className="ls-live-pill">
            <i />
            LIVE · {CLOCK_LABEL}
          </span>
        </div>
        <p className="ls-estate-sub">{ESTATE_SITES.length} locations</p>
        <div className="ls-estate-pills" role="list">
          <span className="ls-pill" data-tone="bad" role="listitem">
            {
              ESTATE_SITES.filter((s) => s.severity !== "healthy").length
            }{" "}
            need attention
          </span>
          <span className="ls-pill" role="listitem">
            <b>$5.8k</b> exposed now
          </span>
          <span className="ls-pill" data-tone="good" role="listitem">
            <i />2 active Decisions
          </span>
          <span className="ls-pill" role="listitem">
            <b>$31.2k</b> Verified Value MTD
          </span>
        </div>
      </header>

      <div className="ls-estate-world">
        <button
          type="button"
          className="ls-estate-backdrop"
          aria-label="Dismiss location inspector"
          tabIndex={selected ? 0 : -1}
          hidden={!selected}
          onClick={onClose}
        />

        <div className="ls-estate-art" aria-hidden>
          <img
            className="ls-estate-art-img"
            src={ESTATE_ART.src}
            srcSet={`${ESTATE_ART.src} 1280w, ${ESTATE_ART.src2x} 2560w`}
            sizes="100vw"
            width={ESTATE_ART.w}
            height={ESTATE_ART.h}
            alt=""
            draggable={false}
          />
          <div className="ls-estate-art-veil" />
        </div>

        <svg
          className="ls-estate-pressure"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {ESTATE_SITES.filter((s) => s.severity !== "healthy").map((site) => (
            <ellipse
              key={`glow-${site.id}`}
              className="ls-estate-glow"
              data-sev={site.severity}
              cx={site.x}
              cy={site.y + 2}
              rx={site.severity === "intervene" ? 7.5 : 5.2}
              ry={site.severity === "intervene" ? 4.2 : 2.8}
            />
          ))}
        </svg>

        {ESTATE_SITES.map((site) => {
          const active = selected?.id === site.id;
          const isHover = hoveredId === site.id && !selected;
          const dim = Boolean(selected && !active);
          return (
            <button
              key={site.id}
              type="button"
              className="ls-estate-site"
              data-sev={site.severity}
              data-depth={site.depth}
              data-active={active ? "true" : undefined}
              data-hover={isHover ? "true" : undefined}
              data-dim={dim ? "true" : undefined}
              data-testid={`ls-estate-${site.id}`}
              style={{ left: `${site.x}%`, top: `${site.y}%` }}
              onMouseEnter={() => setHoveredId(site.id)}
              onMouseLeave={() =>
                setHoveredId((cur) => (cur === site.id ? null : cur))
              }
              onFocus={() => setHoveredId(site.id)}
              onBlur={() =>
                setHoveredId((cur) => (cur === site.id ? null : cur))
              }
              onClick={(e) => {
                e.stopPropagation();
                setHoveredId(null);
                setTab("Live");
                if (active) onClose();
                else onSelect(site.id);
              }}
            >
              <span className="ls-estate-hit" aria-hidden />
              <span className="ls-estate-halo" aria-hidden />
              <span className="ls-estate-focus-ring" aria-hidden />
              <span className="ls-estate-label">
                <span className="ls-estate-dot" aria-hidden />
                <strong>{site.city}</strong>
                <em data-sev={site.severity}>{sevLabel(site.severity)}</em>
                <span className="ls-estate-daypart">
                  {estateDaypartForLocation(site.id)} ·{" "}
                  {estateLocalClockLabel(site.id)}
                </span>
                <span className="ls-estate-delta" data-sev={site.severity}>
                  {site.delta}
                </span>
              </span>
            </button>
          );
        })}

        {hovered ? (
          <div
            className="ls-estate-hover"
            data-testid="ls-estate-hover"
            data-sev={hovered.severity}
            style={{ left: `${hovered.x}%`, top: `${Math.max(12, hovered.y - 14)}%` }}
            aria-hidden
          >
            <header>
              <strong>{hovered.city}</strong>
              <span className="ls-sev-pill" data-sev={hovered.severity}>
                {sevLabel(hovered.severity)}
              </span>
            </header>
            <div className="ls-estate-hover-tri">
              <div>
                <span>Revenue</span>
                <em
                  data-tone={
                    hovered.revenueDelta.startsWith("−") ? "neg" : "pos"
                  }
                >
                  {hovered.revenueDelta}
                </em>
              </div>
              <div>
                <span>Contribution</span>
                <em
                  data-tone={
                    hovered.contributionDelta.startsWith("−") ? "neg" : "pos"
                  }
                >
                  {hovered.contributionDelta}
                </em>
              </div>
              <div>
                <span>Margin</span>
                <em data-tone="pos">{hovered.margin}</em>
              </div>
            </div>
            <p className="ls-estate-hover-exp" data-sev={hovered.severity}>
              {hovered.exposure} exposed
            </p>
          </div>
        ) : null}

        {selected ? (
          <aside
            className="ls-estate-panel"
            data-testid="ls-estate-focus"
            role="dialog"
            aria-label={`${selected.city} inspector`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ls-insp-close"
              aria-label="Close inspector"
              data-testid="ls-estate-close"
              onClick={onClose}
            >
              ✕
            </button>
            <header className="ls-panel-head">
              <div>
                <h2>{selected.city}</h2>
                <span className="ls-sev-pill" data-sev={selected.severity}>
                  {sevLabel(selected.severity)}
                </span>
              </div>
            </header>

            <nav className="ls-estate-tabs" aria-label="Location sections">
              {(["Live", "Trends", "Drivers", "Decisions"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  data-active={tab === t ? "true" : undefined}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </nav>

            {tab === "Live" || tab === "Trends" ? (
              <>
                <div className="ls-panel-tri">
                  <div>
                    <span>Revenue</span>
                    <strong>{selected.revenue}</strong>
                    <em
                      data-tone={
                        selected.revenueDelta.startsWith("−") ? "neg" : "pos"
                      }
                    >
                      {selected.revenueDelta}
                    </em>
                  </div>
                  <div>
                    <span>Contribution</span>
                    <strong>{selected.contribution}</strong>
                    <em
                      data-tone={
                        selected.contributionDelta.startsWith("−")
                          ? "neg"
                          : "pos"
                      }
                    >
                      {selected.contributionDelta}
                    </em>
                  </div>
                  <div>
                    <span>Margin</span>
                    <strong>{selected.margin}</strong>
                    <em
                      data-tone={
                        selected.marginDelta.startsWith("−") ? "neg" : "pos"
                      }
                    >
                      {selected.marginDelta}
                    </em>
                  </div>
                </div>

                <div className="ls-exposure-block" data-sev={selected.severity}>
                  <strong>{selected.exposure}</strong>
                  <span>current exposure</span>
                  <p className="ls-exposure-why">
                    <em>Why</em>
                    {selected.driver}
                  </p>
                </div>
              </>
            ) : null}

            {tab === "Drivers" ? (
              <div className="ls-estate-tab-body">
                <p className="ls-k">Primary driver</p>
                <p className="ls-estate-driver-line">
                  Labor <strong>{selected.labor}</strong> · Covers{" "}
                  <strong>{selected.covers}</strong>
                </p>
                <p>{selected.driver}</p>
              </div>
            ) : null}

            {tab === "Decisions" ||
            (tab === "Live" && selected.decisionValue !== "—") ? (
              <div className="ls-panel-note" data-decision="true">
                <p className="ls-k">
                  {selected.decisionValue !== "—"
                    ? "1 active Decision"
                    : "No active Decision"}
                </p>
                {selected.decisionValue !== "—" ? (
                  <p>
                    <strong>{selected.decisionValue}</strong> expected value
                  </p>
                ) : (
                  <p>RADR is watching this location.</p>
                )}
              </div>
            ) : null}

            <div className="ls-panel-actions">
              <button
                type="button"
                className="ls-cta"
                data-testid="ls-enter-venue"
                onClick={() => onEnterVenue(selected)}
              >
                Enter Venue →
              </button>
              <Link
                href={`/app/decisions/${selected.decisionId}`}
                className="ls-ghost"
                data-testid="ls-review-decision"
              >
                Review Decision
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
