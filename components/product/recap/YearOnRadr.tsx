"use client";

/**
 * Your Year on RADR — cinematic annual recap.
 * NOT on everyday Control Center.
 * Access from Memory / Performance when period = YTD / annual.
 */

import Link from "next/link";
import Image from "next/image";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export type YearRecapCard = {
  id: string;
  kicker: string;
  headline: string;
  detail?: string;
  imageSrc?: string | null;
  tone?: "live" | "quiet" | "proof";
};

const DEMO_CARDS: YearRecapCard[] = [
  {
    id: "guests",
    kicker: "Guests",
    headline: "186,420 covers",
    detail: "Across the Northstar restaurant estate",
    tone: "quiet",
  },
  {
    id: "money",
    kicker: "Economics",
    headline: `${formatDecisionMoney(12400000)} revenue`,
    detail: `${formatDecisionMoney(3180000)} contribution`,
    tone: "quiet",
  },
  {
    id: "dish",
    kicker: "#1 dish",
    headline: "Tuna Tataki",
    detail: "STAR · hold at peak",
    imageSrc: "/menu/menu-tuna-tataki.jpg",
    tone: "live",
  },
  {
    id: "profit",
    kicker: "Most profitable",
    headline: "Truffle Pasta",
    detail: "#1 contribution / kitchen minute",
    imageSrc: "/menu/menu-truffle-pasta.jpg",
    tone: "live",
  },
  {
    id: "upsell",
    kicker: "Best upsell",
    headline: "Pasta + House White",
    detail: "+€8.10 incremental · low capacity impact",
    tone: "live",
  },
  {
    id: "service",
    kicker: "Busiest service",
    headline: "Fri · Berlin Dinner",
    detail: "Peak 20:10 · kitchen 97%",
    tone: "quiet",
  },
  {
    id: "best-loc",
    kicker: "Best location",
    headline: "Soho · New York",
    detail: "Contribution vs plan +4.1%",
    tone: "live",
  },
  {
    id: "improved",
    kicker: "Most improved",
    headline: "Roma Norte · Mexico City",
    detail: "Wine attach +9.4pp · contribution +8.1%",
    tone: "quiet",
  },
  {
    id: "verified",
    kicker: "Verified Value",
    headline: formatDecisionMoney(184200),
    detail: "Evidence-sealed outcomes",
    tone: "proof",
  },
  {
    id: "decisions",
    kicker: "Decisions",
    headline: "1,284 Decisions",
    detail: "61% handled without judgment",
    tone: "proof",
  },
  {
    id: "forecast",
    kicker: "Forecast",
    headline: "Accuracy +11pp",
    detail: "vs first 90 days",
    tone: "quiet",
  },
  {
    id: "playbook",
    kicker: "Learned",
    headline: "Wait-12 peak hold",
    detail: "Playbook adopted · Berlin",
    tone: "proof",
  },
];

export const HOTEL_DEMO_CARDS: YearRecapCard[] = [
  {
    id: "nights",
    kicker: "Room nights",
    headline: "48,210 room nights",
    detail: "Across Northstar Hotels",
    tone: "quiet",
  },
  {
    id: "money",
    kicker: "Economics",
    headline: `${formatDecisionMoney(11200000)} rooms revenue`,
    detail: "RevPAR +3.1% vs plan",
    tone: "quiet",
  },
  {
    id: "readiness",
    kicker: "Readiness",
    headline: "31/42 ready · peak day",
    detail: "Reassign-2 playbook sealed",
    tone: "live",
  },
  {
    id: "channel",
    kicker: "Distribution",
    headline: "Direct share 62%",
    detail: "OTA commission avoided €1,840",
    tone: "live",
  },
  {
    id: "hk",
    kicker: "Housekeeping",
    headline: "13.2 rooms / shift",
    detail: "Floor-3 lag → staffing Decision",
    tone: "quiet",
  },
  {
    id: "best-loc",
    kicker: "Best property",
    headline: "Mercer House · New York",
    detail: "Net channel contribution +4.8%",
    tone: "live",
  },
  {
    id: "verified",
    kicker: "Verified Value",
    headline: formatDecisionMoney(12480),
    detail: "Readiness + channel sealed",
    tone: "proof",
  },
  {
    id: "decisions",
    kicker: "Decisions",
    headline: "842 Decisions",
    detail: "58% handled without judgment",
    tone: "proof",
  },
  {
    id: "forecast",
    kicker: "Forecast",
    headline: "Pickup error −4.1pp",
    detail: "vs first 90 days",
    tone: "quiet",
  },
  {
    id: "playbook",
    kicker: "Learned",
    headline: "Reassign-2 check-in wave",
    detail: "Playbook adopted · Canal",
    tone: "proof",
  },
];

export function YearOnRadr({
  year = 2025,
  cards = DEMO_CARDS,
}: {
  year?: number;
  cards?: YearRecapCard[];
}) {
  return (
    <section className="rp-year" aria-label={`Your year on RADR · ${year}`}>
      <header className="rp-year-head">
        <p className="rp-cin-kicker">Annual</p>
        <h1 className="rp-cin-headline">Your year on RADR</h1>
        <p className="rp-cin-quiet">
          {year} · cinematic proof — not a dashboard dump
        </p>
      </header>
      <ol className="rp-year-cards">
        {cards.map((c) => (
          <li key={c.id} data-tone={c.tone ?? "quiet"}>
            {c.imageSrc ? (
              <span className="rp-year-img">
                <Image src={c.imageSrc} alt="" width={72} height={72} />
              </span>
            ) : null}
            <p className="rp-year-k">{c.kicker}</p>
            <strong>{c.headline}</strong>
            {c.detail ? <span>{c.detail}</span> : null}
          </li>
        ))}
      </ol>
      <p className="rp-year-foot">
        <Link href="/app/memory">Operating Memory →</Link>
        {" · "}
        <Link href="/app/value">Verified Value →</Link>
      </p>
    </section>
  );
}
