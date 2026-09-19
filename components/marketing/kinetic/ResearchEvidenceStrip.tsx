"use client";

/**
 * Editorial evidence — three spreads, native-sharp photos + sand panels.
 * No more stats. 1152px sources → max 576 CSS px.
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
  };
  /** Source quote — omit when the panel is editorial-only */
  quote?: string;
  /** Editorial interpretation — never in quotation marks */
  note?: string;
};

const IMG_W = 576;
const IMG_H = 432;

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
    },
    note: "When food costs move inside a thin-margin business, small discrepancies stop being small.",
  },
  {
    id: "starfleetHotelIntegration2025",
    spread: "c",
    chapter: "03 · Hotel fragmentation",
    image: {
      src: "/demo/facilities/canal-deluxe-king.jpg",
      alt: "Hotel guest environment — operations behind the stay",
      credit: "Hotel operations",
      position: "55% 45%",
    },
    quote: "Only 24% of hotels report full integration of their core systems.",
  },
];

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
          return (
            <li
              key={p.id}
              className="rx-ev-moment"
              data-layout="panel"
              data-spread={p.spread}
            >
              <figure className="rx-ev-photo">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  width={IMG_W * 2}
                  height={IMG_H * 2}
                  sizes="(max-width: 700px) 100vw, 576px"
                  style={{ objectPosition: p.image.position }}
                  loading="lazy"
                  quality={85}
                />
                <figcaption>{p.image.credit}</figcaption>
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
                  <span>
                    {p.id.startsWith("nra")
                      ? `NRA · ${f.publicationDate.slice(0, 4)}`
                      : p.id.startsWith("starfleet")
                        ? `Starfleet / IBS · ${f.publicationDate.slice(0, 4)}`
                        : `${f.publisher} · ${f.publicationDate.slice(0, 4)}`}
                  </span>
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
