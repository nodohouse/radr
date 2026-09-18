"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import {
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
  money,
} from "@/data/demo";
import { CANON_PLAYBOOK } from "@/lib/radr/decision/demo/canonical";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/product-chapters.css";
import "@/app/econ.css";

type IndustryId = "restaurants" | "hotels" | "apartments" | "groups";

type UnderRow = { label: string; value: string };

type IndustryStory = {
  id: IndustryId;
  label: string;
  physics: string;
  headline: [string, string];
  kpiOk: string;
  obvious: string;
  underneath: UnderRow[];
  decision: string;
  consequence: string;
  principle: string;
  exposure: number;
  exposureLabel: string;
  displayId: string;
  src: string;
  pos: string;
  groupCompare?: {
    left: { site: string; adr: string; gop: string };
    right: { site: string; adr: string; gop: string };
  };
  chain?: string[];
};

const INDUSTRIES: IndustryStory[] = [
  {
    id: "restaurants",
    label: "Restaurants & F&B",
    physics: "Service · compressed time",
    headline: ["MORE COVERS", "CAN MAKE YOU LESS MONEY."],
    kpiOk: "78% floor occupancy · walk-ins waiting",
    obvious: "SEAT THEM.",
    underneath: [
      { label: "Reservations inbound", value: "38 covers · 22 min" },
      { label: "Kitchen", value: "92% modeled capacity" },
      { label: "Delivery", value: "+31% vs plan" },
      { label: "KDS tickets", value: "14 min ↑" },
      { label: "Second turns", value: "9 tables exposed" },
    ],
    decision: "WAIT 12 MINUTES.",
    consequence: "Expected contribution vs seating immediately",
    principle:
      "RADR does not optimize tables. It optimizes the economics of the service.",
    exposure: CANON_PEAK.exposureEuro,
    exposureLabel: "vs seat-now",
    displayId: CANON_PEAK.displayId,
    src: "/demo/facilities/berlin-dining.jpg",
    pos: "48% 40%",
  },
  {
    id: "hotels",
    label: "Hotels & Resorts",
    physics: "Rooms · distribution",
    headline: ["FULLER DOESN'T ALWAYS", "MEAN MORE PROFITABLE."],
    kpiOk: "89% occupancy · looks healthy",
    obvious: "RELEASE REMAINING TO OTA.",
    underneath: [
      { label: "OTA share", value: "+11 pts" },
      { label: "Direct pickup", value: "Ahead of pace" },
      { label: "Premium inventory", value: "Scarce · 4 open" },
      { label: "Housekeeping", value: "Premium ready" },
      { label: "Events", value: "Compression inbound" },
    ],
    decision: "HOLD PREMIUM INVENTORY DIRECT.",
    consequence: "Hold prepared · not OTA dump",
    principle:
      "RADR does not optimize occupancy alone. It sees what the room actually contributes.",
    exposure: CANON_OTA.exposureEuro,
    exposureLabel: "contribution exposure",
    displayId: CANON_OTA.displayId,
    src: "/demo/facilities/canal-suite.jpg",
    pos: "55% 40%",
  },
  {
    id: "apartments",
    label: "Serviced Apartments",
    physics: "Unit · calendar · turnover",
    headline: ["FILLING THE NIGHT", "CAN BE THE WRONG DECISION."],
    kpiOk: "One-night gap · a booking is available",
    obvious: "TAKE IT.",
    underneath: [
      { label: "Turnover / cleaning", value: "Already absorbed" },
      { label: "OTA / channel cost", value: "~18% on take-now" },
      { label: "Longer direct stay", value: "41% probability · 48h" },
      { label: "Next-stay constraint", value: "Wednesday arrival" },
      { label: "Maintenance", value: "Clear · no block" },
    ],
    decision: "WAIT · PROTECT DIRECT / LOS PATH.",
    consequence: `${money(CANON_ORPHAN.actualProtectedEuro)} verified recovered · rate ${money(CANON_ORPHAN.recommendedRateEuro ?? 148)}`,
    principle:
      "RADR does not fill empty nights. It models unit-night contribution after turnover and channel cost.",
    exposure: CANON_ORPHAN.exposureEuro,
    exposureLabel: "net opportunity",
    displayId: CANON_ORPHAN.displayId,
    src: "/demo/facilities/lisbon-studio.jpg",
    pos: "50% 50%",
  },
  {
    id: "groups",
    label: "Groups",
    physics: "Portfolio · patterns",
    headline: ["SAME BRAND.", "SIMILAR REVENUE. DIFFERENT PROFIT."],
    kpiOk: "Locations ranked · ADR almost identical",
    obvious: "PUSH THE LOWER-GOP SITE HARDER.",
    underneath: [
      { label: "Labor productivity", value: "Diverges by daypart" },
      { label: "Channel mix", value: "OTA drag uneven" },
      { label: "Supplier variance", value: "Invoice delta recurring" },
      { label: "Housekeeping / F&B", value: "Hours ≠ demand" },
      { label: "Operating hours", value: "Local reactive repeats" },
    ],
    decision: "LOCAL DECISION → VERIFIED → PLAYBOOK → GROUP ROLLOUT.",
    consequence: "Recurring drivers · Operating Memory rolls the fix",
    principle:
      "RADR does not rank locations. It finds why similar revenue produces different profit — then rolls the fix.",
    exposure: CANON_PLAYBOOK.exposureEuro,
    exposureLabel: "structural / month",
    displayId: CANON_PLAYBOOK.displayId,
    src: "/demo/facilities/canal-deluxe-king.jpg",
    pos: "60% 40%",
    groupCompare: {
      left: { site: "Amsterdam", adr: "€214 ADR", gop: "38% GOP" },
      right: { site: "Berlin", adr: "€216 ADR", gop: "31% GOP" },
    },
    chain: ["LOCAL DECISION", "VERIFIED", "PLAYBOOK", "GROUP ROLLOUT"],
  },
];

function parseHash(): IndustryId {
  if (typeof window === "undefined") return "restaurants";
  const raw = window.location.hash.replace(/^#/, "").toLowerCase();
  if (raw.includes("hotel")) return "hotels";
  if (raw.includes("apartment")) return "apartments";
  if (raw.includes("group")) return "groups";
  if (raw.includes("restaurant")) return "restaurants";
  return "restaurants";
}

/**
 * Industries — economic pain per vertical, one immersive canvas.
 */
export function IndustriesLock() {
  const [active, setActive] = useState<IndustryId>("restaurants");
  const story = INDUSTRIES.find((i) => i.id === active) ?? INDUSTRIES[0]!;

  useEffect(() => {
    const apply = () => setActive(parseHash());
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  function select(id: IndustryId) {
    setActive(id);
    const next = `#intelligence-${id}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }

  return (
    <div className="radr radr-mineral rx-ch-light">
      <SiteNav />
      <main>
        <section className="rx-ch-hero rx-ind-hero-compact" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">Industries · DEMO · ILLUSTRATIVE</p>
            <h1 className="rx-ch-title">
              Different operations.
              <br />
              Different ways to lose margin.
            </h1>
            <p className="rx-ch-lead rx-ind-hero-lead">
              RADR learns the operating physics of each one.
            </p>
          </div>
        </section>

        <section
          className="rx-ind-cinema"
          data-nav-theme="dark"
          data-vertical={story.id}
          aria-label="Industry economic pain"
        >
          <div className="rx-ind-cinema-backdrop" aria-hidden="true">
            {INDUSTRIES.map((i) => (
              <div
                key={i.id}
                className="rx-ind-cinema-layer"
                data-on={active === i.id ? "true" : "false"}
              >
                <Image
                  src={i.src}
                  alt=""
                  fill
                  sizes="100vw"
                  className="rx-ind-immerse-img"
                  style={{ objectPosition: i.pos }}
                  priority={i.id === "restaurants"}
                />
              </div>
            ))}
            <div className="rx-ind-immerse-veil" />
            <div className="rx-ind-cinema-vignette" />
          </div>

          <div className="rx-shell rx-ind-cinema-inner">
            <div className="rx-ind-cinema-rail" role="tablist" aria-label="Vertical">
              {INDUSTRIES.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  role="tab"
                  data-on={active === i.id ? "true" : "false"}
                  aria-selected={active === i.id}
                  onClick={() => select(i.id)}
                >
                  <span>{i.label}</span>
                  <em>{i.physics}</em>
                </button>
              ))}
            </div>

            <div className="rx-ind-pain rx-ind-cinema-story" key={story.id}>
              <h2 className="rx-ind-pain-headline">
                {story.headline[0]}
                <br />
                {story.headline[1]}
              </h2>

              {story.groupCompare ? (
                <div className="rx-ind-group-split" aria-label="Location comparison">
                  <div>
                    <strong>{story.groupCompare.left.site}</strong>
                    <span>{story.groupCompare.left.adr}</span>
                    <em data-tone="good">{story.groupCompare.left.gop}</em>
                  </div>
                  <div>
                    <strong>{story.groupCompare.right.site}</strong>
                    <span>{story.groupCompare.right.adr}</span>
                    <em data-tone="risk">{story.groupCompare.right.gop}</em>
                  </div>
                </div>
              ) : null}

              <div className="rx-ind-pain-grid">
                <p>
                  <em>Looks fine</em>
                  <strong>{story.kpiOk}</strong>
                </p>
                <p>
                  <em>Obvious move</em>
                  <strong className="rx-ind-obvious">{story.obvious}</strong>
                </p>
              </div>

              <div className="rx-ind-under">
                <em>Underneath</em>
                <ul>
                  {story.underneath.map((row) => (
                    <li key={row.label}>
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="rx-ind-decide">
                <em>{story.displayId}</em>
                <strong>{story.decision}</strong>
              </p>

              {story.chain ? (
                <ol className="rx-ind-chain" aria-label="Group learning chain">
                  {story.chain.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : null}

              <p className="rx-ind-immerse-money">
                <span className="rx-econ-risk">{money(story.exposure)}</span>
                <span>
                  {" "}
                  {story.exposureLabel} · {story.consequence}
                </span>
              </p>

              <p className="rx-ind-principle">{story.principle}</p>
            </div>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <div className="rx-ch-ctas">
              <NextLink href="/demo" className="rx-btn rx-btn-primary">
                {CTAS.primaryProduct} <span aria-hidden="true">→</span>
              </NextLink>
              <Link href="/contact" className="rx-btn rx-btn-ghost">
                {CTAS.primarySales}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
