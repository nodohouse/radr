import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RADR brand-test — soft vector master v4 QA",
  robots: { index: false, follow: false },
};

const MARK_SIZES = [140, 500, 1000] as const;

/**
 * QA only — v4 is NOT wired into the live site.
 * Soft board silhouette via Bézier contours. Website CSS frozen.
 */
export default function BrandTestPage() {
  return (
    <main className="bt">
      <style>{CSS}</style>
      <header className="bt-head">
        <p className="bt-kicker">INTERNAL · /brand-test · VECTOR MASTER V4</p>
        <h1>Board vs v3 vs v4</h1>
        <p className="bt-sub">
          <strong>v4 is not live.</strong> Soft board silhouette via cubic
          Béziers — reproduce the board, do not invent a geometric A. Approve
          only if board ≡ v4 at 1000px + 50% overlay.
        </p>
      </header>

      {MARK_SIZES.map((n) => (
        <section key={n} className="bt-card">
          <p className="bt-label">A-mark · {n}px</p>
          <div className="bt-tri">
            <figure className="bt-cell">
              <figcaption>Approved board</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/qa/board-a-mark-clean.png"
                alt="Approved branding-board A-mark"
                style={{ width: n, height: n }}
                className="bt-img"
              />
            </figure>
            <figure className="bt-cell">
              <figcaption>V3 sharp (rejected)</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/radr-mark-master-v3.svg"
                alt="Rejected sharp v3 mark"
                style={{ width: n, height: n }}
                className="bt-img"
              />
            </figure>
            <figure className="bt-cell bt-cell--focus">
              <figcaption>V4 soft</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/radr-mark-master-v4.svg"
                alt="Proposed soft v4 mark"
                style={{ width: n, height: n }}
                className="bt-img"
              />
            </figure>
          </div>
        </section>
      ))}

      <section className="bt-card">
        <p className="bt-label">50% overlay · Board + V4 @ matched scale</p>
        <div className="bt-overlay">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/qa/board-a-mark-overlay.png"
            alt=""
            className="bt-overlay-img"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/radr-mark-master-v4.svg"
            alt="Board and v4 overlay"
            className="bt-overlay-img"
          />
        </div>
      </section>

      <section className="bt-card">
        <p className="bt-label">Wordmark · board · v3 · v4</p>
        <div className="bt-stack">
          <figure className="bt-wm">
            <figcaption>Board</figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/qa/board-wordmark.png"
              alt="Board wordmark"
              className="bt-wm-img"
            />
          </figure>
          <figure className="bt-wm">
            <figcaption>V3</figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/radr-wordmark-master-v3.svg"
              alt="v3 wordmark"
              className="bt-wm-img"
            />
          </figure>
          <figure className="bt-wm bt-wm--focus">
            <figcaption>V4</figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/radr-wordmark-master-v4.svg"
              alt="v4 wordmark"
              className="bt-wm-img"
            />
          </figure>
        </div>
      </section>

      <section className="bt-card">
        <p className="bt-label">800% zoom · v4 soft terminals</p>
        <div className="bt-zoom">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/radr-mark-master-v4.svg"
            alt="v4 mark zoomed"
            className="bt-zoom-img"
          />
        </div>
      </section>

      <section className="bt-card bt-card--dark">
        <p className="bt-label">Dark · v4 white</p>
        <div className="bt-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/radr-wordmark-master-v4-white.svg"
            alt="v4 wordmark white"
            style={{ height: 48, width: "auto" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/radr-mark-master-v4-white.svg"
            alt="v4 mark white"
            style={{ height: 72, width: "auto" }}
          />
        </div>
      </section>
    </main>
  );
}

const CSS = `
  .bt {
    min-height: 100vh;
    margin: 0;
    padding: 48px 40px 80px;
    background: #f4f7f5;
    color: #0b1512;
    font-family: "Geist", "Geist Sans", ui-sans-serif, system-ui, sans-serif;
    display: grid;
    gap: 20px;
    max-width: 1200px;
  }
  .bt-head { margin-bottom: 8px; }
  .bt-kicker {
    margin: 0 0 8px;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #5a6660;
  }
  .bt h1 {
    margin: 0 0 12px;
    font-size: 34px;
    line-height: 0.95;
    letter-spacing: -0.04em;
    font-weight: 700;
  }
  .bt-sub { margin: 0; max-width: 70ch; color: #3d4742; font-size: 15px; line-height: 1.5; }
  .bt-card {
    background: #fff;
    border: 1px solid #d7ddd9;
    border-radius: 12px;
    padding: 22px 24px 28px;
    overflow: visible;
  }
  .bt-card--dark {
    background: #0a1110;
    border-color: #1c2824;
    color: #f4f7f5;
  }
  .bt-label {
    margin: 0 0 16px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #5a6660;
  }
  .bt-card--dark .bt-label { color: #9aa8a1; }
  .bt-tri {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    align-items: end;
  }
  @media (max-width: 900px) {
    .bt-tri { grid-template-columns: 1fr; }
  }
  .bt-cell, .bt-wm {
    margin: 0;
    display: grid;
    gap: 8px;
    justify-items: center;
    padding: 14px;
    border: 1px solid #e4e9e6;
    border-radius: 10px;
    background: #fafcfb;
  }
  .bt-cell--focus, .bt-wm--focus {
    border-color: #00a85a;
    box-shadow: 0 0 0 1px rgba(0, 168, 90, 0.25);
  }
  .bt-cell figcaption, .bt-wm figcaption {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #5a6660;
  }
  .bt-img {
    object-fit: contain;
    display: block;
    background: #fff;
    max-width: 100%;
  }
  .bt-overlay {
    position: relative;
    width: min(640px, 100%);
    aspect-ratio: 120 / 91.81;
    margin: 0 auto;
    background: #fff;
    border: 1px solid #e4e9e6;
    border-radius: 10px;
  }
  .bt-overlay-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.5;
  }
  .bt-stack { display: grid; gap: 14px; }
  .bt-wm { justify-items: stretch; }
  .bt-wm-img {
    width: 100%;
    max-width: 640px;
    height: 88px;
    object-fit: contain;
    display: block;
    background: #fff;
    justify-self: center;
  }
  .bt-zoom {
    overflow: hidden;
    border: 1px solid #e4e9e6;
    border-radius: 10px;
    background: #fff;
    height: 220px;
    position: relative;
  }
  .bt-zoom-img {
    position: absolute;
    left: -40%;
    bottom: -120%;
    width: 900px;
    height: 900px;
    object-fit: contain;
  }
  .bt-row { display: flex; flex-wrap: wrap; align-items: center; gap: 28px; }
`;
