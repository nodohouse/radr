"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { pricingConfig } from "./config";

const freeItems = [
  "1 location",
  "1 user",
  `${pricingConfig.free.documentLimit} documents total`,
  "Manual evidence upload",
  "Private document storage",
  "Basic checks — Building",
  `${pricingConfig.free.historyDays}-day history`,
];

const controlItems = [
  "Everything in Free",
  "Continuous financial control — Building",
  "Cases & human decisions — Building",
  "Money owed / credit tracking — Building",
  "Procurement mismatch checks — Building",
  "Verified outcome ledger — Building",
  "Controls library — Building",
  "Delivery-platform reconciliation — Building",
  "Team access — Building",
];

const scaleItems = [
  "Everything in Control",
  "Multi-location control room — Building",
  "Group-wide exception queue — Building",
  "Cross-location supplier intelligence — Building",
  "Advanced integrations — Building",
  "Roles & permissions — Building",
  "Dedicated onboarding",
];

type TierKey = "free" | "control" | "scale";

function TierCard({
  tierKey,
  focused,
  recommended,
  onFocus,
  onBlur,
  children,
}: {
  tierKey: TierKey;
  focused: boolean;
  recommended?: boolean;
  onFocus: (key: TierKey) => void;
  onBlur: () => void;
  children: ReactNode;
}) {
  const [egg, setEgg] = useState<"idle" | "locked" | "fit">("idle");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!recommended) return;
    if (focused) {
      timer.current = window.setTimeout(() => setEgg("locked"), 1200);
      const t2 = window.setTimeout(() => setEgg("fit"), 2200);
      return () => {
        if (timer.current) window.clearTimeout(timer.current);
        window.clearTimeout(t2);
      };
    }
    setEgg("idle");
  }, [focused, recommended]);

  const setScanY = (el: HTMLElement, clientY: number) => {
    const rect = el.getBoundingClientRect();
    const y = ((clientY - rect.top) / Math.max(rect.height, 1)) * 100;
    el.style.setProperty("--scan-y", `${Math.min(100, Math.max(0, y))}%`);
  };

  return (
    <article
      className="px-tier"
      data-tier={tierKey}
      data-focus={focused ? "true" : "false"}
      data-quiet={focused === false ? undefined : undefined}
      tabIndex={0}
      onMouseEnter={() => onFocus(tierKey)}
      onMouseMove={(e) => setScanY(e.currentTarget, e.clientY)}
      onMouseLeave={onBlur}
      onFocus={() => onFocus(tierKey)}
      onBlur={onBlur}
      onTouchStart={() => onFocus(tierKey)}
      style={{ "--scan-y": "18%" } as CSSProperties}
    >
      {recommended ? (
        <p className="px-tier-egg" data-state={egg}>
          {egg === "locked"
            ? "Signal locked"
            : egg === "fit"
              ? "On RADR"
              : "\u00a0"}
        </p>
      ) : null}
      {children}
    </article>
  );
}

export function PricingTiers() {
  const { free, control, scale } = pricingConfig;
  const [focus, setFocus] = useState<TierKey | null>(null);
  const [entered, setEntered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setEntered(true);
      },
      { threshold: 0.2 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const onFocus = useCallback((key: TierKey) => setFocus(key), []);
  const onBlur = useCallback(() => setFocus(null), []);

  return (
    <section
      className="px-tiers"
      id="plans"
      ref={sectionRef}
      data-entered={entered ? "true" : "false"}
      data-focus={focus ?? "none"}
    >
      <div className="prep-shell">
        <div className="px-tier-grid">
          <TierCard
            tierKey="free"
            focused={focus === "free"}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <p className="prep-kicker">
              {focus === "free" ? (
                <>
                  <span className="px-tier-mark" aria-hidden="true">
                    △
                  </span>{" "}
                  {free.name}
                </>
              ) : (
                free.name
              )}
            </p>
            <p className="px-tier-purpose">{free.purpose}</p>
            <p className="px-tier-price">{free.priceLabel}</p>
            <ul className="px-tier-list">
              {freeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href={free.cta.href} className="prep-btn prep-btn-ghost-dark">
              {free.cta.label} <span aria-hidden="true">→</span>
            </Link>
          </TierCard>

          <TierCard
            tierKey="control"
            focused={focus === "control"}
            recommended
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <p className="prep-kicker">
              {focus === "control" ? (
                <>
                  <span className="px-tier-mark" aria-hidden="true">
                    △
                  </span>{" "}
                  {control.name}
                </>
              ) : (
                control.name
              )}
            </p>
            <p className="px-tier-purpose">{control.purpose}</p>
            <p className="px-tier-price">{control.priceLabel}</p>
            <p className="px-tier-unit">{control.unit}</p>
            <ul className="px-tier-list">
              {controlItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href={control.cta.href} className="prep-btn prep-btn-primary">
              See RADR in action <span aria-hidden="true">→</span>
            </Link>
            <p className="prep-tag" style={{ marginTop: "0.55rem" }}>
              Billing not live · early access via signup
            </p>
          </TierCard>

          <TierCard
            tierKey="scale"
            focused={focus === "scale"}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <p className="prep-kicker">
              {focus === "scale" ? (
                <>
                  <span className="px-tier-mark" aria-hidden="true">
                    △
                  </span>{" "}
                  {scale.name}
                </>
              ) : (
                scale.name
              )}
            </p>
            <p className="px-tier-purpose">{scale.purpose}</p>
            <p className="px-tier-price">{scale.priceLabel}</p>
            <ul className="px-tier-list">
              {scaleItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href={scale.cta.href} className="prep-btn prep-btn-ghost-dark">
              {scale.cta.label} <span aria-hidden="true">→</span>
            </Link>
          </TierCard>
        </div>
      </div>
    </section>
  );
}
