"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import "./research-discover.css";

const stories = [
  {
    tag: "RESTAURANTS",
    number: "42%",
    title: "Busy is only half the story.",
    body: "U.S. operators who said their restaurant was not profitable in 2025. Includes breaking even.",
    source: "National Restaurant Association · July 2026",
    href: "/blog/restaurant-profitability-beyond-revenue",
    action: "Understand restaurant economics",
  },
  {
    tag: "HOTELS",
    number: "4.1% / 2.3%",
    title: "Costs can outrun the room rate.",
    body: "Above-GOP expenses versus revenue growth in CBRE’s preliminary 2024 U.S. hotel sample.",
    source: "CBRE · 2,600 hotels · May 2025",
    href: "/blog/hotel-distribution-contribution",
    action: "Follow hotel contribution",
  },
  {
    tag: "KITCHENS & FOOD SERVICE",
    number: "GBP 3.2bn",
    title: "What never reaches the guest.",
    body: "Estimated annual UK hospitality and food-service food-waste cost. Not a 2026 measurement.",
    source: "UKHospitality citing WRAP · sector estimate",
    href: "/blog/kitchen-waste-measured-value",
    action: "Build a measured waste case",
  },
];
const signals = [
  "See the service behind the sales",
  "Compare restaurant and hotel economics",
  "Model value with explicit assumptions",
  "Keep expected and verified value separate",
];

export function ResearchDiscover() {
  const ref = useRef<HTMLElement>(null);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    let visible = false;
    const sync = () => setRunning(visible && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "100px" },
    );
    if (ref.current) observer.observe(ref.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <section
      ref={ref}
      className="rm-research"
      data-nav-theme="light"
      aria-labelledby="research-title"
    >
      <div
        className="rm-research-strip"
        aria-label="A better way to evaluate hospitality performance"
        data-running={running}
      >
        <div className="rm-research-track">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {signals.map((signal) => (
                <span key={signal}>
                  <b aria-hidden="true">✦</b>
                  {signal}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="rm-shell rm-research-inner">
        <div className="rm-section-head">
          <div>
            <p className="rm-eyebrow">THE CASE FOR A BETTER DECISION</p>
            <h2 id="research-title">
              The pressure is real.
              <br />
              <em>Make the next move count.</em>
            </h2>
          </div>
          <p>
            Different businesses. Different pressure points. Independent
            research, useful calculations and decisions you can put to work.
          </p>
        </div>
        <div className="rm-research-grid">
          {stories.map((story) => (
            <article key={story.tag}>
              <p className="rm-research-tag">{story.tag}</p>
              <strong className="rm-research-number">{story.number}</strong>
              <h3>{story.title}</h3>
              <p>{story.body}</p>
              <small>{story.source}</small>
              <Link href={story.href}>
                {story.action}{" "}
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3 11 11 3M3 3h8v8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </article>
          ))}
        </div>
        <div className="rm-research-foot">
          <p>
            Industry context, not RADR customer results. Explore the sources and
            limitations in each free article.
          </p>
          <Link href="/blog">Read the journal →</Link>
        </div>
      </div>
    </section>
  );
}
