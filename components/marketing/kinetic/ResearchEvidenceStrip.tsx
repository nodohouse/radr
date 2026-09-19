"use client";

/**
 * Editorial evidence — magazine breakout spreads.
 * Facility masters 1152×864 → image stays ≤520 CSS px; panel fills the rest.
 */

import Image from "next/image";
import NextLink from "next/link";
import {
  researchFact,
  type ResearchFactId,
} from "@/data/research/researchFacts";
import {
  FACILITY_NATIVE,
  PUBLIC_IMAGES,
  type PublicImageId,
} from "@/lib/marketing/publicImagery";

type Proof = {
  id: ResearchFactId;
  spread: "a" | "b" | "c";
  chapter: string;
  imageId: PublicImageId;
  quote?: string;
  note?: string;
};

const PROOFS: Proof[] = [
  {
    id: "nraSmallRestaurantMargin2023",
    spread: "a",
    chapter: "01 · Restaurant economics",
    imageId: "berlin-dining",
    quote: "The average small business restaurant runs on a 3-5% margin.",
  },
  {
    id: "nraFoodCostChallenge2023",
    spread: "b",
    chapter: "02 · Food cost pressure",
    imageId: "berlin-bar",
    note: "When food costs move inside a thin-margin business, small discrepancies stop being small.",
  },
  {
    id: "starfleetHotelIntegration2025",
    spread: "c",
    chapter: "03 · Hotel system fragmentation",
    imageId: "canal-deluxe-king",
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
    <div className="rx-ev rx-ev-cinema rx-ev-breakout">
      <header className="rx-ev-head rx-shell">
        <p className="rx-rec-k">{kicker}</p>
        <h2 className="rx-rec-h">{title}</h2>
      </header>

      <ol className="rx-ev-moments">
        {PROOFS.map((p) => {
          const f = researchFact(p.id);
          const year = f.publicationDate.slice(0, 4);
          const img = PUBLIC_IMAGES[p.imageId];
          return (
            <li
              key={p.id}
              className="rx-ev-moment"
              data-layout="panel"
              data-spread={p.spread}
            >
              <figure
                className="rx-ev-photo"
                style={{ maxWidth: img.cssMax }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={FACILITY_NATIVE.w}
                  height={FACILITY_NATIVE.h}
                  sizes={`(max-width: 700px) 92vw, ${img.cssMax}px`}
                  style={{
                    objectPosition: `${img.focalX} ${img.focalY}`,
                  }}
                  loading="lazy"
                  quality={90}
                />
                <figcaption>
                  <span>{img.credit}</span>
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

      <div className="rx-shell">
        <NextLink href="/research" className="rx-research-lib">
          Evidence library <span aria-hidden="true">→</span>
        </NextLink>
      </div>
    </div>
  );
}
