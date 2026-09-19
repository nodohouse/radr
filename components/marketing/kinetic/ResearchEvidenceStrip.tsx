"use client";

/**
 * Editorial evidence — photography at native-sharp size + solid text panels.
 * Sources are 1152px: never stretch beyond ~576 CSS px (2× retina).
 */

import Image from "next/image";
import NextLink from "next/link";
import {
  researchFact,
  type ResearchFactId,
} from "@/data/research/researchFacts";

type Proof = {
  id: ResearchFactId;
  image: {
    src: string;
    alt: string;
    credit: string;
    /** object-position for deliberate crop */
    position: string;
  };
  quote: string;
  note?: string;
};

/** Native facility assets are 1152×864 — render ≤576 CSS px wide */
const IMG_W = 576;
const IMG_H = 432;

const PROOFS: Proof[] = [
  {
    id: "nraSmallRestaurantMargin2023",
    image: {
      src: "/demo/facilities/berlin-dining.jpg",
      alt: "Active restaurant dining room during service",
      credit: "Restaurant service",
      position: "50% 40%",
    },
    quote: "The average small business restaurant runs on a 3-5% margin.",
    note: "When margins are this thin, small leakage matters.",
  },
  {
    id: "nraFoodCostChallenge2023",
    image: {
      src: "/demo/facilities/berlin-bar.jpg",
      alt: "Hospitality service during an active shift",
      credit: "Restaurant operations",
      position: "45% 35%",
    },
    quote:
      "92% of operators say the cost of food is a significant issue for their restaurant.",
    note: "Food and labor each consume roughly one-third of restaurant sales in the Association’s analysis.",
  },
  {
    id: "starfleetHotelIntegration2025",
    image: {
      src: "/demo/facilities/canal-deluxe-king.jpg",
      alt: "Hotel guest environment — operations behind the stay",
      credit: "Hotel operations",
      position: "55% 45%",
    },
    quote: "Only 24% of hotels report full integration of their core systems.",
    note: "42% reported relying on disconnected systems.",
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
        {PROOFS.map((p, i) => {
          const f = researchFact(p.id);
          return (
            <li
              key={p.id}
              className="rx-ev-moment"
              data-layout="panel"
              data-flip={i % 2 === 1 ? "true" : undefined}
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
                <p className="rx-ev-metric">{f.metric}</p>
                <p className="rx-ev-label">{f.displayLabel}</p>
                <blockquote>
                  <p>“{p.quote}”</p>
                </blockquote>
                {p.note ? <p className="rx-ev-note">{p.note}</p> : null}
                <footer className="rx-ev-source">
                  <span>
                    {f.publisher} · {f.publicationDate.slice(0, 4)}
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
