"use client";

import { useEffect, useState } from "react";
import { signalByChannel } from "../data/demo";
import { useReducedMotionSafe } from "../motion/useReducedMotionSafe";
import { useScrollStage } from "../motion/useScrollStage";
import { DeltaGlyph } from "../primitives/DeltaGlyph";

const STAGE_COUNT = 8;
const STORY_VH = 200;

type Buy = ReturnType<typeof signalByChannel>;

function DetectBlock({
  buy,
  showCompare,
  showUnit,
  showAnnual,
  ping,
}: {
  buy: Buy;
  showCompare: boolean;
  showUnit: boolean;
  showAnnual: boolean;
  ping: boolean;
}) {
  return (
    <>
      <div className="rx-delta-compare" data-on={showCompare ? "true" : "false"}>
        <div className="rx-delta-src" data-on={showCompare ? "true" : "false"}>
          <span>Contract price</span>
          <strong className="rx-money">{buy.source.should.value}</strong>
        </div>
        <div
          className="rx-delta-bridge"
          data-on={showUnit ? "true" : "false"}
          data-ping={ping ? "true" : "false"}
        >
          <i />
        </div>
        <div
          className="rx-delta-src"
          data-on={showCompare ? "true" : "false"}
          data-flag={showUnit ? "true" : "false"}
        >
          <span>Invoice price</span>
          <strong className="rx-money">{buy.source.actual.value}</strong>
        </div>
      </div>
      <p className="rx-delta-unit" data-on={showUnit ? "true" : "false"}>
        <span className="rx-tri">△</span>{" "}
        <strong className="rx-money">{buy.source.unitDelta}</strong>
      </p>
      <p className="rx-delta-annual" data-on={showAnnual ? "true" : "false"}>
        <span className="rx-tri">△</span>{" "}
        <strong className="rx-money">
          {buy.amount}
          {buy.period}
        </strong>
      </p>
    </>
  );
}

function FindingPanel({ buy }: { buy: Buy }) {
  return (
    <article className="rx-delta-panel">
      <header>
        <span>RADR / Finding 001</span>
        <span>Status · Actionable</span>
      </header>
      <h3>{buy.title}</h3>
      <p>
        You paid {buy.source.actual.value}. Your contract says{" "}
        {buy.source.should.value}.
      </p>
      <p className="rx-delta-panel-unit">
        <span className="rx-tri">△</span> {buy.source.unitDelta}
      </p>
      <div className="rx-delta-panel-row">
        <em>Annual exposure</em>
        <strong className="rx-money">{buy.amount}</strong>
      </div>
    </article>
  );
}

function ActionPanel() {
  return (
    <article className="rx-delta-panel">
      <header>
        <span>Recommended action</span>
        <span>ACT</span>
      </header>
      <h3>Review supplier charge</h3>
      <p className="rx-delta-panel-meta">Evidence ready</p>
      <ul className="rx-delta-evidence">
        <li>Contract</li>
        <li>Invoice</li>
        <li>Purchase history</li>
      </ul>
      <p className="rx-delta-cta-line">Review finding →</p>
    </article>
  );
}

function ControlPanel() {
  return (
    <article className="rx-delta-panel">
      <header>
        <span>Action taken</span>
        <span>LEARN</span>
      </header>
      <p className="rx-delta-panel-meta">Supplier contacted.</p>
      <p className="rx-delta-panel-meta">Pricing corrected.</p>
      <div className="rx-delta-control">
        <em>Control created</em>
        <strong>
          Invoice price
          <br />
          must match
          <br />
          contract price
        </strong>
        <p>RADR will flag the next mismatch automatically.</p>
      </div>
    </article>
  );
}

function VerifyBlock({ buy }: { buy: Buy }) {
  return (
    <>
      <article className="rx-delta-panel rx-delta-panel--verified">
        <header>
          <span>Recovery</span>
          <span>✓ VERIFIED</span>
        </header>
        <div className="rx-delta-compare rx-delta-compare--verify">
          <div className="rx-delta-src" data-on="true">
            <span>Expected recovery</span>
            <strong className="rx-money">{buy.amount}</strong>
          </div>
          <div className="rx-delta-src" data-on="true" data-flag="true">
            <span>Recovered</span>
            <strong className="rx-money">{buy.amount}</strong>
          </div>
        </div>
        <p className="rx-delta-verified-mark">✓ Verified value</p>
        <p className="rx-delta-annual" data-on="true">
          <strong className="rx-money">{buy.amount}</strong>
        </p>
        <p className="rx-delta-panel-meta">Added to RADR total.</p>
      </article>
      <div className="rx-delta-close">
        <p className="rx-kicker">The RADR loop</p>
        <h3>
          Find it.
          <br />
          Fix it.
          <br />
          Keep it fixed.
        </h3>
        <p className="rx-delta-close-lines">
          RADR finds the gap.
          <br />
          Shows you what it&apos;s worth.
          <br />
          And what to do next.
        </p>
        <p className="rx-delta-close-lines">And checks that it got fixed.</p>
      </div>
    </>
  );
}

function Carry({ buy, on }: { buy: Buy; on: boolean }) {
  return (
    <a
      href="/solutions#sol-buy"
      className="rx-delta-carry"
      data-on={on ? "true" : "false"}
    >
      <span className="rx-delta-carry-meta">Signal 01 · BUY · continues</span>
      <span className="rx-delta-carry-amt">
        <span className="rx-tri">△</span> {buy.amount}
        {buy.period}
      </span>
      <span className="rx-delta-carry-go">Open finding →</span>
    </a>
  );
}

/**
 * △ instrument — detect → explain → act → learn → verify.
 * Sticky scroll on desktop; linear stack on mobile. Same visual language.
 */
export function SectionDelta() {
  const buy = signalByChannel("buy");
  const reduced = useReducedMotionSafe();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const u = () => setMobile(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  const desktop = !mobile && !reduced;
  const { rootRef, index } = useScrollStage(STAGE_COUNT, desktop);
  const scene = desktop ? index : 0;

  const label =
    scene >= 7
      ? "Delta / Verified"
      : scene >= 6
        ? "Delta / Learning"
        : scene >= 5
          ? "Delta / Action"
          : scene >= 4
            ? "Delta / Finding"
            : "Delta / Active";

  const compact = desktop && scene >= 4;

  if (!desktop) {
    return (
      <section className="rx-delta-inst" id="difference" data-nav-theme="dark">
        <div className="rx-delta-atm" aria-hidden="true">
          <div className="rx-delta-grid" />
          <div className="rx-delta-arcs" />
        </div>
        <div className="rx-shell rx-delta-inst-inner">
          <p className="rx-delta-label" data-on="true">
            <span className="rx-live-dot" /> Delta / Active
          </p>
          <h2 className="rx-delta-title" data-on="true">
            △ is the
            <br />
            difference.
          </h2>
          <div className="rx-delta-stage">
            <div className="rx-delta-frame" data-on="true">
              <DeltaGlyph size={160} className="rx-delta-frame-glyph" />
            </div>
            <DetectBlock
              buy={buy}
              showCompare
              showUnit
              showAnnual
              ping={false}
            />
            <FindingPanel buy={buy} />
            <ActionPanel />
            <ControlPanel />
            <VerifyBlock buy={buy} />
          </div>
          <Carry buy={buy} on />
        </div>
      </section>
    );
  }

  return (
    <section
      className="rx-delta-inst"
      id="difference"
      ref={rootRef}
      data-nav-theme="dark"
      data-scene={scene}
      data-compact={compact ? "true" : "false"}
      style={{ height: `${STORY_VH}vh` }}
    >
      <div className="rx-delta-pin">
        <div className="rx-delta-atm" aria-hidden="true">
          <div className="rx-delta-grid" />
          <div className="rx-delta-arcs" />
          <div className="rx-delta-specks" />
          <span className="rx-delta-coord rx-delta-coord--tl">48.21 N</span>
          <span className="rx-delta-coord rx-delta-coord--tr">SCAN 02</span>
          <span className="rx-delta-coord rx-delta-coord--bl">Δ · BUY</span>
          <span className="rx-delta-coord rx-delta-coord--br">18 LOC</span>
        </div>

        <div className="rx-shell rx-delta-inst-inner">
          <p className="rx-delta-label" data-on="true">
            <span
              className="rx-live-dot"
              data-dim={scene < 3 ? "true" : "false"}
            />
            {label}
          </p>

          <h2
            className="rx-delta-title"
            data-on="true"
            data-quiet={compact ? "true" : "false"}
          >
            △ is the
            <br />
            difference.
          </h2>

          <div className="rx-delta-stage">
            <div
              className="rx-delta-frame"
              data-on={scene >= 1 ? "true" : "false"}
              data-scan={scene >= 1 && scene <= 2 ? "true" : "false"}
              data-compact={compact ? "true" : "false"}
              data-verified={scene >= 7 ? "true" : "false"}
            >
              <DeltaGlyph
                living={scene >= 2 && scene < 7}
                active={scene >= 1}
                verified={scene >= 7}
                size={compact ? 96 : 168}
                className="rx-delta-frame-glyph"
              />
              <div className="rx-delta-scanline" aria-hidden="true" />
            </div>

            {scene <= 3 ? (
              <div className="rx-delta-scene" data-on="true">
                <DetectBlock
                  buy={buy}
                  showCompare={scene >= 1}
                  showUnit={scene >= 2}
                  showAnnual={scene >= 3}
                  ping={scene === 2}
                />
              </div>
            ) : null}

            {scene === 4 ? (
              <div className="rx-delta-scene" data-on="true">
                <FindingPanel buy={buy} />
              </div>
            ) : null}

            {scene === 5 ? (
              <div className="rx-delta-scene" data-on="true">
                <ActionPanel />
              </div>
            ) : null}

            {scene === 6 ? (
              <div className="rx-delta-scene" data-on="true">
                <ControlPanel />
              </div>
            ) : null}

            {scene >= 7 ? (
              <div className="rx-delta-scene" data-on="true">
                <VerifyBlock buy={buy} />
              </div>
            ) : null}
          </div>

          <Carry buy={buy} on={scene >= 7} />
        </div>
      </div>
    </section>
  );
}
