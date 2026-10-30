"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "motion/react";
import { Glyph } from "./MockupVisuals";
import "./solutions-story.css";

const systems = [
  ["POS", "Sales, menu, covers", "pos"],
  ["PMS", "Occupancy, ADR, forecast", "hotel"],
  ["Reservations", "Bookings, events, waitlist", "calendar"],
  ["Finance", "Revenue, costs, margins", "data"],
  ["Procurement", "Suppliers, inventory, prices", "box"],
  ["Labor", "Schedules, productivity", "labor"],
];
const stages = [
  ["Observe", "All your data"],
  ["Contextualize", "Find what matters"],
  ["Compare", "Model outcomes"],
  ["Decide", "Take action"],
];
const subscribeReduced = (fn: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", fn);
  return () => media.removeEventListener("change", fn);
};
const getReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribeVisibility = (fn: () => void) => {
  document.addEventListener("visibilitychange", fn);
  return () => document.removeEventListener("visibilitychange", fn);
};
const getForeground = () => document.visibilityState !== "hidden";

function FutureChart({ positive }: { positive?: boolean }) {
  return (
    <svg className="sf-future-chart" viewBox="0 0 120 38" aria-hidden="true">
      <path
        d={
          positive
            ? "M2 32 16 30 27 20 38 26 48 17 61 19 72 8 83 11 96 10 108 5 118 1"
            : "M2 28 16 19 27 24 38 20 48 26 61 15 72 20 83 15 96 17 108 12 118 4"
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        pathLength="100"
      />
    </svg>
  );
}

export function SolutionsStory() {
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { amount: 0.12 });
  const reduced = useSyncExternalStore(
    subscribeReduced,
    getReduced,
    () => true,
  );
  const foreground = useSyncExternalStore(
    subscribeVisibility,
    getForeground,
    () => true,
  );
  const [stage, setStage] = useState(0);
  const moving = visible && !reduced && foreground;
  useEffect(() => {
    if (!moving) return;
    const durations = [1800, 1700, 2300, 2300, 2400];
    const timer = setTimeout(
      () => setStage((n) => (n + 1) % 5),
      durations[stage],
    );
    return () => clearTimeout(timer);
  }, [moving, stage]);
  return (
    <section
      ref={ref}
      className="sf-hero"
      id="overview"
      aria-labelledby="sf-title"
      data-moving={moving}
      data-stage={stage}
      data-motion={reduced ? "reduced" : "full"}
    >
      <div className="sf-layout">
        <div className="sf-copy">
          <p className="sf-kicker">FROM SIGNALS TO DECISIONS</p>
          <h1 id="sf-title">
            <span>See the operation.</span>
            <span>Compare the future.</span>
            <span>Take the right action.</span>
          </h1>
          <p>
            RADR connects your fragmented data, understands what’s happening,
            and shows you the best decision. before it impacts your guests,
            your team or your margins.
          </p>
          <Link href="/how" className="sf-cta">
            See how it works <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div
          className="sf-demo"
          role="group"
          aria-label="Illustrative restaurant decision: connected signals, compared futures, recommended seating pace, and outcome tracking"
        >
          <ol className="sf-stages" aria-label="Decision story stages">
            {stages.map(([name, detail], i) => (
              <li
                className="sf-stage"
                key={name}
                aria-current={Math.min(stage, 3) === i ? "step" : undefined}
              >
                <strong>{name}</strong>
                <span>{detail}</span>
                <i aria-hidden="true" />
              </li>
            ))}
          </ol>
          <div className="sf-board">
            <svg
              className="sf-streams"
              viewBox="0 0 1180 470"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              {systems.map(([name], i) => (
                <g key={name}>
                  <path
                    d={`M188 ${108 + i * 62}C270 ${108 + i * 62} 270 275 342 275`}
                    className="sf-track sf-in-track"
                  />
                  <path
                    d={`M188 ${108 + i * 62}C270 ${108 + i * 62} 270 275 342 275`}
                    pathLength="100"
                    className="sf-packet sf-in-packet"
                    style={{ animationDelay: `${i * -0.43}s` }}
                  />
                </g>
              ))}
              {[220, 370].map((y, i) => (
                <g key={y}>
                  <path
                    d={`M501 275C530 275 520 ${y} 548 ${y}`}
                    className="sf-track sf-out-track"
                  />
                  <path
                    d={`M501 275C530 275 520 ${y} 548 ${y}`}
                    pathLength="100"
                    className="sf-packet sf-out-packet"
                    style={{ animationDelay: `${i * -1.2}s` }}
                  />
                </g>
              ))}
              {["M770 285H784", "M1015 285H1044"].map((d, i) => (
                <path
                  key={d}
                  d={d}
                  pathLength="100"
                  className="sf-packet sf-out-packet sf-handoff"
                  style={{ animationDelay: `${i * -0.8}s` }}
                />
              ))}
              <path
                d="M770 285H784m-6-5 6 5-6 5M1015 285H1044m-6-5 6 5-6 5"
                stroke="#c1e8d6"
                strokeWidth="1.3"
              />
            </svg>
            <svg
              className="sf-mobile-streams"
              viewBox="0 0 1000 372"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              {systems.map(([name], i) => (
                <g key={name}>
                  <path
                    d={`M520 ${28 + i * 63.2}C600 ${28 + i * 63.2} 585 186 650 186`}
                    className="sf-track sf-in-track"
                  />
                  <path
                    d={`M520 ${28 + i * 63.2}C600 ${28 + i * 63.2} 585 186 650 186`}
                    pathLength="100"
                    className="sf-packet sf-in-packet"
                    style={{ animationDelay: `${i * -0.43}s` }}
                  />
                </g>
              ))}
              <path d="M750 258V372" className="sf-track sf-out-track" />
              <path
                d="M750 258V372"
                pathLength="100"
                className="sf-packet sf-out-packet"
              />
            </svg>
            <div className="sf-sources">
              {systems.map(([name, detail, icon]) => (
                <div className="sf-source" key={name}>
                  <Glyph name={icon} size={22} />
                  <span>
                    <strong>{name}</strong>
                    <small>{detail}</small>
                  </span>
                  <i aria-hidden="true" />
                </div>
              ))}
            </div>
            <div className="sf-core-area">
              <div className="sf-orbit sf-orbit-outer" aria-hidden="true" />
              <div className="sf-orbit" aria-hidden="true" />
              <div className="sf-core">
                <Image
                  src="/brand/radr-wordmark-clean-white.svg"
                  width={132}
                  height={30}
                  alt="RADR"
                />
                <span>Operating State</span>
              </div>
            </div>
            <div className="sf-futures">
              <h2>Compare futures</h2>
              <article className="sf-future sf-future-risk">
                <h3>Do nothing</h3>
                <p>Likely outcome</p>
                <FutureChart />
                <dl>
                  <div>
                    <dt>Revenue</dt>
                    <dd>−8%</dd>
                  </div>
                  <div>
                    <dt>Guest satisfaction</dt>
                    <dd>↓</dd>
                  </div>
                  <div>
                    <dt>Kitchen pressure</dt>
                    <dd>High</dd>
                  </div>
                </dl>
              </article>
              <article className="sf-future sf-future-recommended">
                <h3>Pace seating 12 min</h3>
                <p>Recommended</p>
                <FutureChart positive />
                <dl>
                  <div>
                    <dt>Revenue</dt>
                    <dd>+21%</dd>
                  </div>
                  <div>
                    <dt>Guest satisfaction</dt>
                    <dd>↑</dd>
                  </div>
                  <div>
                    <dt>Kitchen pressure</dt>
                    <dd>Normal</dd>
                  </div>
                </dl>
              </article>
            </div>
            <article className="sf-decision">
              <div className="sf-decision-label">
                <h2>RADR Decision</h2>
                <span>● Recommended</span>
              </div>
              <h3>Increase pace to 12 minutes</h3>
              <ul>
                <li>
                  <Glyph name="chart" size={18} />
                  <span>
                    <strong>
                      Demand <b>+21%</b>
                    </strong>
                    <small>Higher demand expected</small>
                  </span>
                </li>
                <li>
                  <Glyph name="spark" size={18} />
                  <span>
                    <strong>Kitchen pressure rising</strong>
                    <small>Based on live covers and prep time</small>
                  </span>
                </li>
                <li>
                  <Glyph name="labor" size={18} />
                  <span>
                    <strong>Labor stretched</strong>
                    <small>Adjust 1 FOH to maintain service</small>
                  </span>
                </li>
              </ul>
              <div className="sf-impact">
                <span>
                  Expected impact<strong>+$620</strong>
                </span>
                <span>
                  Illustrative confidence<strong>82%</strong>
                </span>
              </div>
              <p className="sf-approval">Your team reviews and approves.</p>
            </article>
            <article className="sf-outcome">
              <h2>Outcome tracking</h2>
              <ol>
                <li className="sf-expected">
                  <i aria-hidden="true" />
                  <span>
                    Expected<strong>+$620</strong>
                  </span>
                </li>
                <li>
                  <i aria-hidden="true" />
                  <span>
                    Observed<strong>Pending</strong>
                  </span>
                </li>
                <li>
                  <i aria-hidden="true" />
                  <span>
                    Verified<strong>$0</strong>
                  </span>
                </li>
              </ol>
            </article>
          </div>
          <div className="sf-demo-footer">
            <span>
              ILLUSTRATIVE SCENARIO · Expected value is not verified value.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
