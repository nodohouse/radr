import Image from "next/image";
import Link from "next/link";
import "./reference-hero.css";
import { ReferenceNav } from "./ReferenceNav";
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
          Turn your data into better decisions,
          <br />
          higher profits and stronger guest experiences.
        </p>
        <div className="rh-ctas">
          <Link href="/contact" className="rh-button">
            Book a demo <Arrow />
          </Link>
          <Link href="/how" className="rh-button rh-button-ghost">
            See how it works <Arrow />
          </Link>
        </div>
      </div>
      <HeroTablet />
      <span className="rh-scene-note">CLARITY FOR EVERY OPERATION.</span>
    </section>
  );
}
