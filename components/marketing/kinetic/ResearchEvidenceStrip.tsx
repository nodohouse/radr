"use client";

/**
 * Editorial evidence — three spreads.
 * Facility masters are 1152×864 → render ≤480 CSS px (sharp, never upscaled).
 */

import Image from "next/image";
import NextLink from "next/link";
import {
  researchFact,
  type ResearchFactId,
} from "@/data/research/researchFacts";

type Proof = {
  id: ResearchFactId;
  spread: "a" | "b" | "c";
  chapter: string;
  image: {
    src: string;
    alt: string;
    credit: string;
    position: string;
    /** CSS px cap — native 1152 → stay ≤576 @2x */
    cssMax: number;
  };
  quote?: string;
  note?: string;
};

const NATIVE_W = 1152;
const NATIVE_H = 864;

const PROOFS: Proof[] = [
  {
    id: "nraSmallRestaurantMargin2023",
    spread: "a",
    chapter: "01 · Restaurant economics",
    image: {
      src: "/demo/facilities/berlin-dining.jpg",
      alt: "Active restaurant dining room during service",
      credit: "Restaurant service",
      position: "50% 40%",
      cssMax: 520,
    },
    quote: "The average small business restaurant runs on a 3-5% margin.",
  },
  {
    id: "nraFoodCostChallenge2023",
    spread: "b",
    chapter: "02 · Food cost pressure",
    image: {
      src: "/demo/facilities/berlin-bar.jpg",
      alt: "Hospitality service during an active shift",
      credit: "Restaurant operations",
      position: "45% 35%",
      cssMax: 480,
    },
    note: "When food costs move inside a thin-margin business, small discrepancies stop being small.",
  },
  {
    id: "starfleetHotelIntegration2025",
    spread: "c",
    chapter: "03 · Hotel system fragmentation",
    image: {
      src: "/demo/facilities/canal-deluxe-king.jpg",
      alt: "Hotel guest environment — operations behind the stay",
      credit: "Hotel operations",
      position: "55% 45%",
      cssMax: 440,
    },
    quote: "Only 24% of hotels report full integration of their core systems.",
  },
];

function sourceLine(id: ResearchFactId, year: string): string {
  if (id.startsWith("nra")) return `National Restaurant Association · ${year}`;
  if (id.startsWith("starfleet"))
    return `Starfleet Research / IBS Software · ${year}`;
  const f = researchFact(id);
  return `${f.publisher} · ${year}`;
}

export function ResearchEvidenceStrip({
  kicker = "Evidence",
  title = "The software exists. The gaps still do.",
}: {
  kicker?: string;
  title?: string;
}) {
  return (
    <div className="rx-ev rx-ev-cinema">
      <header className="rx-ev-head">
        <p className="rx-rec-k">{kicker}</p>
        <h2 className="rx-rec-h">{title}</h2>
      </header>

      <ol className="rx-ev-moments">
        {PROOFS.map((p) => {
          const f = researchFact(p.id);
          const year = f.publicationDate.slice(0, 4);
          return (
            <li
              key={p.id}
              className="rx-ev-moment"
              data-layout="panel"
              data-spread={p.spread}
            >
              <figure
                className="rx-ev-photo"
                style={{ maxWidth: p.image.cssMax }}
              >
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  width={NATIVE_W}
                  height={NATIVE_H}
                  sizes={`(max-width: 700px) 100vw, ${p.image.cssMax}px`}
                  style={{ objectPosition: p.image.position }}
                  loading="lazy"
                  quality={90}
                />
                <figcaption>
                  <span>{p.image.credit}</span>
                </figcaption>
              </figure>
              <div className="rx-ev-body">
                <p className="rx-ev-chapter">{p.chapter}</p>
                <p className="rx-ev-metric">{f.metric}</p>
                <p className="rx-ev-label">{f.displayLabel}</p>
                {p.quote ? (
                  <blockquote>
                    <p>“{p.quote}”</p>
                  </blockquote>
                ) : null}
                {p.note ? <p className="rx-ev-note">{p.note}</p> : null}
                <footer className="rx-ev-source">
                  <span>{sourceLine(p.id, year)}</span>
                  <a
                    href={f.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source <span aria-hidden="true">↗</span>
                  </a>
                </footer>
              </div>
            </li>
          );
        })}
      </ol>

      <NextLink href="/research" className="rx-research-lib">
        Evidence library <span aria-hidden="true">→</span>
      </NextLink>
    </div>
  );
}
