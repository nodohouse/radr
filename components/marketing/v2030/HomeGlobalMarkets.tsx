"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PUBLIC_DEMO_MARKETS } from "@/lib/marketing/publicCanon";

const MARKET_PHOTOS = [
  "/marketing/2030/dining.jpg",
  "/marketing/2030/hero-atmosphere.jpg",
  "/marketing/2030/hero-suite.jpg",
  "/marketing/2030/cc-restaurant.jpg",
  "/demo/facilities/berlin-bar.jpg",
  "/demo/facilities/canal-deluxe-king.jpg",
  "/marketing/company-env-aparthotel.jpg",
  "/marketing/2030/gateway.jpg",
  "/marketing/2030/hero-lounge-hi.jpg",
  "/marketing/2030/hero-coastal-hi.jpg",
] as const;

function WorldMapBackdrop() {
  return (
    <svg
      className="rx30-world-svg"
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rx30Node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d978" stopOpacity="1" />
          <stop offset="100%" stopColor="#00d978" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* faint continent silhouettes */}
      <g fill="none" stroke="rgba(11,61,46,0.12)" strokeWidth="1.2">
        <path d="M140 160 C 180 120, 220 130, 250 150 C 280 175, 260 210, 220 220 C 170 235, 120 200, 140 160 Z" />
        <path d="M280 200 C 320 170, 360 180, 390 210 C 410 240, 380 280, 340 270 C 300 260, 270 230, 280 200 Z" />
        <path d="M520 150 C 580 120, 640 140, 680 170 C 720 210, 700 260, 640 250 C 580 240, 500 200, 520 150 Z" />
        <path d="M760 180 C 820 150, 900 160, 940 200 C 970 240, 940 280, 880 270 C 820 260, 740 230, 760 180 Z" />
        <path d="M980 240 C 1040 210, 1100 230, 1120 270 C 1135 300, 1100 330, 1050 320 C 1000 310, 960 280, 980 240 Z" />
      </g>
      {/* arcs */}
      <g fill="none" stroke="#00c96a" strokeOpacity="0.35" strokeWidth="1.4">
        <path d="M210 180 C 320 80, 480 90, 600 170" />
        <path d="M600 170 C 720 90, 860 110, 980 200" />
        <path d="M390 220 C 520 280, 700 260, 880 240" />
        <path d="M250 200 C 420 320, 700 300, 1050 280" strokeDasharray="4 6" />
      </g>
      {/* nodes */}
      {[
        [210, 180],
        [390, 210],
        [600, 170],
        [760, 200],
        [880, 240],
        [980, 200],
        [1050, 280],
        [320, 250],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="14" fill="url(#rx30Node)" opacity="0.45" />
          <circle cx={x} cy={y} r="4.5" fill="#00c96a" />
        </g>
      ))}
    </svg>
  );
}

export function HomeGlobalMarkets({
  exploreHref = "/product",
}: {
  exploreHref?: string;
}) {
  return (
    <section
      className="rx30-global rx30-global--map"
      aria-labelledby="rx30-global-title"
    >
      <div className="rx30-global-map" aria-hidden="true">
        <WorldMapBackdrop />
      </div>
      <div className="rx30-shell">
        <div className="rx30-global-head">
          <div>
            <h2 id="rx30-global-title" className="rx30-h2">
              From iconic hotels to emerging destinations, RADR is global by
              design.
            </h2>
            <p className="rx30-global-note">
              Demo operating contexts across markets. Not a customer footprint.
            </p>
            <Link href={exploreHref} className="rx30-btn rx30-btn-ghost">
              Explore global markets <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="rx30-markets" role="list">
          {PUBLIC_DEMO_MARKETS.map((m, i) => (
            <article key={m.city} className="rx30-market" role="listitem">
              <Image
                src={MARKET_PHOTOS[i % MARKET_PHOTOS.length]!}
                alt=""
                width={360}
                height={260}
                sizes="200px"
                quality={72}
              />
              <div className="rx30-market-body">
                <strong>
                  <i className="rx30-market-dot" aria-hidden="true" />
                  {m.city}
                </strong>
                <span>{m.region}</span>
                <em>{m.daypart}</em>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
