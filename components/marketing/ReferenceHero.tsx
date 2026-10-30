import Image from "next/image";
import Link from "next/link";
import "./reference-hero.css";
import { ReferenceNav } from "./ReferenceNav";
import { HeroScrollStory } from "./HeroScrollStory";
import { HeroTablet } from "./HeroTablet";

const brand = "/brand/radr-wordmark-clean-white.svg";

function Arrow() {
  return (
    <svg
      className="rh-arrow"
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h15m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReferenceHero() {
  return (
    <HeroScrollStory>
    <section className="rh-hero" id="product" aria-labelledby="rh-title">
      <div className="rh-backdrop" />
      <ReferenceNav />
      <div className="rh-copy">
        <p className="rh-eyebrow">HOSPITALITY OPERATING INTELLIGENCE</p>
        <h1 id="rh-title">
          NOTHING OFF
          <br />
          <span className="rh-last-line">
            THE{" "}
            <Image src={brand} alt="RADR" width={300} height={68} priority />
            <span className="rh-period">.</span>
          </span>
        </h1>
        <p className="rh-description">
          Find what’s costing you. See what to do next.
          <br />
          Make every operating decision count.
        </p>
        <div className="rh-ctas">
          <Link href="/contact" className="rh-button">
            Book a demo <Arrow />
          </Link>
          <Link href="#product-story" className="rh-button rh-button-ghost">
            See it in action <Arrow />
          </Link>
        </div>
      </div>
      <div className="rh-story-captions" aria-label="Scroll through the RADR product story">
        <div data-story-caption="0"><span>01 / EVIDENCE</span><h2>See the discrepancy.</h2><p>Contract $6.80/L. Invoice $7.45/L. The evidence is connected.</p></div>
        <div data-story-caption="1"><span>02 / RECOMMENDED ACTION</span><h2>Know what to do next.</h2><p>Prepare the dispute package. Your team reviews and approves.</p></div>
        <div data-story-caption="2"><span>03 / VERIFY THE OUTCOME</span><h2>Track value. Prove the result.</h2><p>$2,430 expected. Outcome pending. $0 verified so far.</p></div>
      </div>
      <HeroTablet />
      <span className="rh-scene-note">SCROLL TO EXPLORE THE DECISION ↓</span>
    </section>
    </HeroScrollStory>
  );
}
