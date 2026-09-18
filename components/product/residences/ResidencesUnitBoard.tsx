"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LISBON_RESIDENCES,
  lisbonArrivalForUnit,
  lisbonStayArrivals,
  lisbonUnits,
  residencesUnitStatusLabel,
  type ResidencesUnitStatus,
} from "@/lib/radr/demo/lisbonResidences";
import { residenceFacilityForType } from "@/lib/radr/demo/facilityCatalog";
import { FacilityCard } from "@/components/product/FacilityCard";
import {
  StayArrivalsBrief,
  StayGuestChips,
} from "@/components/product/StayArrivalsBrief";

type Filter = "all" | ResidencesUnitStatus | "types";

function parseFilter(raw: string | null): Filter {
  if (
    raw === "types" ||
    raw === "delayed" ||
    raw === "cleaning" ||
    raw === "maintenance" ||
    raw === "ready" ||
    raw === "occupied"
  ) {
    return raw;
  }
  return "all";
}

export function ResidencesUnitBoard() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Filter>(() =>
    parseFilter(searchParams.get("board")),
  );
  const [swapDone, setSwapDone] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [arrivalsOpen, setArrivalsOpen] = useState(true);
  const units = useMemo(() => lisbonUnits(), []);
  const arrivals = useMemo(() => lisbonStayArrivals(), []);
  const typeGuide = useMemo(
    () =>
      LISBON_RESIDENCES.unitTypes
        .map((t) => residenceFacilityForType(t))
        .filter(Boolean),
    [],
  );
  const visible =
    filter === "all" || filter === "types"
      ? units
      : units.filter((u) => u.status === filter);

  return (
    <div className="rp-hotel-prop" aria-label="Units · turnovers">
      <header className="rp-hotel-prop-head">
        <div>
          <p className="rp-hotel-glance-kicker">UNITS · FACILITIES · DEMO</p>
          <h1>{LISBON_RESIDENCES.name}</h1>
          <p className="rp-hotel-glance-lead">
            Who arrives today · unit differences · what to prepare
          </p>
        </div>
        <Link href="/app" className="rp-btn-secondary">
          Control Center
        </Link>
      </header>

      <div className="rp-stay-board-brief">
        <button
          type="button"
          className="rp-stay-board-toggle"
          aria-expanded={arrivalsOpen}
          onClick={() => setArrivalsOpen((o) => !o)}
        >
          {arrivalsOpen ? "Hide arrivals" : "Show arrivals"} · {arrivals.length}{" "}
          today
        </button>
        {arrivalsOpen ? (
          <StayArrivalsBrief
            arrivals={arrivals}
            vertical="serviced_apartments"
          />
        ) : null}
      </div>

      <div
        className="rp-hotel-prop-filters"
        role="tablist"
        aria-label="Unit filter"
      >
        {(
          [
            ["all", "All units"],
            ["types", "Unit types"],
            ["delayed", "At risk"],
            ["cleaning", "Cleaning"],
            ["maintenance", "Maintenance"],
            ["ready", "Ready"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            data-active={filter === id ? "true" : "false"}
            className="rp-hotel-prop-filter"
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {filter === "types" ? (
        <section aria-label="Unit type guide">
          <p className="rp-hotel-sec-label">
            Unit types · for ops &amp; new cleaners
          </p>
          <div className="rp-fac-grid">
            {typeGuide.map((f) =>
              f ? (
                <FacilityCard
                  key={f.id}
                  facility={f}
                  expanded={expandedId === f.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === f.id ? null : f.id))
                  }
                />
              ) : null,
            )}
          </div>
        </section>
      ) : (
        <div className="rp-fac-grid">
          {visible.map((u) => {
            const facility = residenceFacilityForType(u.type);
            if (!facility) return null;
            const arrival = lisbonArrivalForUnit(u.number);
            return (
              <FacilityCard
                key={u.id}
                facility={facility}
                roomLabel={`Unit ${u.number}`}
                statusLabel={residencesUnitStatusLabel(u.status)}
                radarNote={u.radar}
                expanded={expandedId === u.id}
                onToggle={() =>
                  setExpandedId((id) => (id === u.id ? null : u.id))
                }
                footer={
                  <div className="rp-fac-ops">
                    {arrival ? (
                      <StayGuestChips arrival={arrival} />
                    ) : u.guestName ? (
                      <p className="rp-hotel-room-guest">{u.guestName}</p>
                    ) : null}
                    {u.checkInAt && !arrival ? (
                      <p className="rp-hotel-room-meta">
                        Check-in {u.checkInAt}
                      </p>
                    ) : arrival ? (
                      <p className="rp-hotel-room-meta">
                        Check-in {arrival.time}
                      </p>
                    ) : null}
                    {u.note ? (
                      <p className="rp-hotel-room-note">{u.note}</p>
                    ) : null}
                    {u.number === "24" && !swapDone ? (
                      <button
                        type="button"
                        className="rp-btn-secondary"
                        onClick={() => setSwapDone(true)}
                      >
                        Approve reallocation
                      </button>
                    ) : null}
                    {u.number === "24" && swapDone ? (
                      <p className="rp-hotel-room-done">
                        RADR handling · 48 before 24
                      </p>
                    ) : null}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
