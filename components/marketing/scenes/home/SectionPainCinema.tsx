"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CANON_ORPHAN,
  CANON_OTA,
  CANON_PEAK,
} from "@/lib/radr/decision/demo/canonical";

type Vertical = "hotel" | "restaurant" | "aparthotel";

type ClockBeat = { t: string; value: number; label: string };
type TimelineItem = { t: string; label: string };

type PainWorld = {
  id: Vertical;
  tab: string;
  image: string;
  objectPosition: string;
  timeline: TimelineItem[];
  event: string;
  meta: string;
  clock: readonly ClockBeat[];
  bench: string;
};

const WORLDS: Record<Vertical, PainWorld> = {
  hotel: {
    id: "hotel",
    tab: "Hotels",
    image: "/demo/facilities/canal-deluxe-king.jpg",
    objectPosition: "52% 45%",
    timeline: [
      { t: "14:40", label: "Housekeeping priority" },
      { t: "15:10", label: "Premium OTA book" },
      { t: "15:35", label: "Arrival wave building" },
      { t: "16:20", label: "Direct hold deadline" },
    ],
    event: "Premium room booked via OTA · €310 looks good",
    meta: `${CANON_OTA.property} · 89% occupancy · premium inventory tightening`,
    clock: [
      {
        t: "15:10",
        value: CANON_OTA.exposureEuro,
        label: "CONTRIBUTION EXPOSURE",
      },
      {
        t: "15:40",
        value: CANON_OTA.expectedProtectedEuro,
        label: "After OTA book · contribution decays",
      },
      { t: "16:10", value: 1680, label: "Channel cost · contribution left" },
      { t: "16:40", value: 0, label: "Hold window · contribution gone" },
    ],
    bench: `${CANON_OTA.property} · €${CANON_OTA.exposureEuro.toLocaleString("en-US")} contribution exposure · channel mix`,
  },
  restaurant: {
    id: "restaurant",
    tab: "Restaurants",
    image: "/demo/facilities/berlin-dining.jpg",
    objectPosition: "48% 40%",
    timeline: [
      { t: "18:30", label: "Floor looks open" },
      { t: "18:42", label: "Walk-ins waiting" },
      { t: "18:53", label: "Decision deadline" },
      { t: "18:54", label: "Resume window" },
    ],
    event: "Seat them · empty tables look like capacity",
    meta: `${CANON_PEAK.property} · 78% floor · kitchen 92% · 38 covers inbound`,
    clock: [
      { t: "18:42", value: CANON_PEAK.exposureEuro, label: "Contribution vs seating now" },
      { t: "18:53", value: 420, label: "After seat-now · second turns slip" },
      { t: "18:54", value: 180, label: "Comps + ticket drag · left" },
      { t: "19:10", value: 0, label: "Peak collision · contribution gone" },
    ],
    bench: `${CANON_PEAK.property} · €${CANON_PEAK.exposureEuro.toLocaleString("en-US")} vs seat-now · peak capacity`,
  },
  aparthotel: {
    id: "aparthotel",
    tab: "Aparthotels",
    image: "/demo/facilities/lisbon-onebed.jpg",
    objectPosition: "50% 42%",
    timeline: [
      { t: "NOW", label: "One-night gap opens" },
      { t: "72H", label: "Discount pressure" },
      { t: "48H", label: "OTA release tempting" },
      { t: "24H", label: "Direct wait deadline" },
    ],
    event: "Discount now · fills fast · burns the floor",
    meta: `${CANON_ORPHAN.property} · Unit 24 · cleaning already absorbed · next stay Wednesday`,
    clock: [
      {
        t: "NOW",
        value: CANON_ORPHAN.exposureEuro,
        label: "Recoverable opportunity at stake",
      },
      {
        t: "72H",
        value: CANON_ORPHAN.expectedProtectedEuro,
        label: "Wait path · expected contribution",
      },
      {
        t: "48H",
        value:
          CANON_ORPHAN.scenarios.find((s) => s.id === "discount_128")
            ?.expectedContributionEuro ?? 78,
        label: "Discount path · expected contribution",
      },
      { t: "24H", value: 0, label: "Gap expires · contribution gone" },
    ],
    bench: `${CANON_ORPHAN.property} · €${CANON_ORPHAN.exposureEuro.toLocaleString("en-US")} orphan exposure · wait vs dump`,
  },
};

const TABS: Vertical[] = ["hotel", "restaurant", "aparthotel"];

/**
 * Scene 02 — economic clock. Hotel default; same physics for restaurant + aparthotel.
 * One featured moment. Value decays with time — inside the lens.
 */
export function SectionPainCinema() {
  const [vertical, setVertical] = useState<Vertical>("hotel");
  const [i, setI] = useState(0);
  const world = WORLDS[vertical];
  const clock = world.clock;
  const beat = clock[i]!;

  useEffect(() => {
    setI(0);
  }, [vertical]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setI((n) => (n + 1) % clock.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [clock.length, vertical]);

  return (
    <section
      className="rx-econ-clock"
      data-nav-theme="dark"
      id="pain"
      data-beat={i}
      data-vertical={vertical}
    >
      <div className="rx-econ-clock-media" aria-hidden="true">
        <Image
          key={world.image}
          src={world.image}
          alt=""
          fill
          sizes="100vw"
          className="rx-econ-clock-img"
          style={{ objectPosition: world.objectPosition }}
          priority={false}
        />
        <div className="rx-econ-clock-veil" />
      </div>

      <div className="rx-shell rx-econ-clock-inner">
        <div className="rx-econ-clock-copy">
          <div
            className="rx-econ-clock-tabs"
            role="tablist"
            aria-label="Operating model"
          >
            {TABS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={vertical === id}
                className="rx-econ-clock-tab"
                data-on={vertical === id ? "true" : undefined}
                onClick={() => setVertical(id)}
              >
                {WORLDS[id].tab}
              </button>
            ))}
          </div>

          <h2 className="rx-econ-clock-title">
            The P&amp;L moves
            <br />
            before the report does.
          </h2>

          <ol className="rx-econ-clock-timeline" aria-hidden="true">
            {world.timeline.map((item, idx) => (
              <li
                key={`${vertical}-${item.t}`}
                data-on={
                  idx === 0
                    ? i === 0
                      ? "true"
                      : "past"
                    : i === idx
                      ? "true"
                      : i > idx
                        ? "past"
                        : "false"
                }
                data-past={idx === 0 || i > idx ? "true" : undefined}
              >
                <em>{item.t}</em>
                <span>{item.label}</span>
              </li>
            ))}
          </ol>

          <article className="rx-econ-clock-moment" aria-live="polite">
            <p className="rx-econ-clock-event">{world.event}</p>
            <p className="rx-econ-clock-meta">{world.meta}</p>
          </article>

          <p className="rx-econ-clock-footer">
            RADR finds the moment while value can still change.
          </p>
          <p className="rx-econ-clock-bench">{world.bench}</p>
        </div>

        <div
          className="rx-econ-clock-lens"
          data-gone={beat.value === 0 ? "true" : "false"}
          data-beat={i}
          aria-hidden="true"
        >
          <i className="rx-econ-clock-ring" data-r="1" />
          <i className="rx-econ-clock-ring" data-r="2" />
          <i className="rx-econ-clock-glow" />
          <div className="rx-econ-clock-value" key={`${vertical}-${beat.t}`}>
            <strong>€{beat.value.toLocaleString("en-US")}</strong>
            <em>{beat.label}</em>
            <span>{beat.t}</span>
          </div>
          <div className="rx-econ-clock-decay">
            {clock.map((c, idx) => (
              <i
                key={`${vertical}-${c.t}`}
                data-on={idx === i ? "true" : idx < i ? "past" : "false"}
              >
                €{c.value.toLocaleString("en-US")}
              </i>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
