"use client";

import Link from "next/link";
import { SIGNALS, signalByChannel } from "../data/demo";
import { SiteFooter } from "../SiteFooter";
import { SiteNav } from "../SiteNav";

const EXAMPLES = {
  buy: [
    "Duplicate invoice",
    "Unapproved price increase",
    "Wrong delivery fee",
    "Contract mismatch",
    "Waste / yield issue",
  ],
  labor: [
    "Overtime emerging",
    "Agency usage",
    "Schedule above demand",
    "Low productivity",
    "Labor % above target",
  ],
  sell: [
    "Room rate opportunity",
    "Menu mix",
    "Channel fees",
    "Delivery commissions",
    "Promotion leakage",
  ],
  recover: [
    "Supplier credits",
    "Rebates",
    "Refunds",
    "Settlement differences",
    "Missing commissions",
  ],
} as const;

export function SolutionsPage() {
  const buy = signalByChannel("buy");
  const labor = signalByChannel("labor");
  const sell = signalByChannel("sell");
  const recover = signalByChannel("recover");

  return (
    <div className="radr">
      <SiteNav />
      <main>
        <section className="rx-page-hero" data-nav-theme="dark">
          <div className="rx-shell rx-page-hero-inner">
            <p className="rx-kicker">Solutions</p>
            <h1 className="rx-page-title">
              Everywhere
              <br />
              margin moves.
            </h1>
            <p className="rx-lead-inv rx-lead-short">
              RADR watches spend, labor, revenue and recovery continuously —
              and surfaces the differences worth acting on.
            </p>
            <ul className="rx-sol-jump">
              {SIGNALS.map((s) => (
                <li key={s.channel}>
                  <a href={`#sol-${s.channel}`}>{s.channelLabel}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="rx-sol-block"
          id="sol-buy"
          data-nav-theme="dark"
          data-channel="buy"
        >
          <div className="rx-sol-beam" aria-hidden="true" />
          <div className="rx-shell rx-sol-grid">
            <div>
              <p className="rx-kicker">Buy</p>
              <h2 className="rx-display rx-display-sm">What you spend.</h2>
              <p className="rx-lead-inv">You paid more than agreed.</p>
              <ul className="rx-sol-examples">
                {EXAMPLES.buy.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="rx-sol-panel">
              <header>
                <span>{buy.source.label}</span>
                <span>SCAN</span>
              </header>
              <p>{buy.source.detail}</p>
              <div className="rx-sol-pair">
                <div>
                  <em>Contract</em>
                  <strong className="rx-money">{buy.source.should.value}</strong>
                </div>
                <div data-flag="true">
                  <em>Paid</em>
                  <strong className="rx-money">{buy.source.actual.value}</strong>
                </div>
              </div>
              <p className="rx-sol-delta">
                <span className="rx-tri">△</span> {buy.amount}
                {buy.period}
              </p>
            </div>
          </div>
        </section>

        <section
          className="rx-sol-block"
          id="sol-labor"
          data-nav-theme="dark"
          data-channel="labor"
        >
          <div className="rx-sol-beam" aria-hidden="true" />
          <div className="rx-shell rx-sol-grid">
            <div>
              <p className="rx-kicker">Labor</p>
              <h2 className="rx-display rx-display-sm">How you staff.</h2>
              <p className="rx-lead-inv">You scheduled above demand.</p>
              <ul className="rx-sol-examples">
                {EXAMPLES.labor.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="rx-sol-panel">
              <header>
                <span>{labor.source.label}</span>
                <span>SCAN</span>
              </header>
              <p>{labor.source.detail}</p>
              <div className="rx-sol-pair">
                <div>
                  <em>Needed</em>
                  <strong className="rx-money">{labor.source.should.value}</strong>
                </div>
                <div data-flag="true">
                  <em>Scheduled</em>
                  <strong className="rx-money">{labor.source.actual.value}</strong>
                </div>
              </div>
              <p className="rx-sol-delta">
                <span className="rx-tri">△</span> {labor.source.unitDelta}
              </p>
              <p className="rx-sol-sub">
                <span className="rx-tri">△</span> {labor.amount}
                {labor.period}
              </p>
            </div>
          </div>
        </section>

        <section
          className="rx-sol-block"
          id="sol-sell"
          data-nav-theme="dark"
          data-channel="sell"
        >
          <div className="rx-sol-beam" aria-hidden="true" />
          <div className="rx-shell rx-sol-grid">
            <div>
              <p className="rx-kicker">Sell</p>
              <h2 className="rx-display rx-display-sm">How you monetize.</h2>
              <p className="rx-lead-inv">You&apos;re selling out too cheaply.</p>
              <ul className="rx-sol-examples">
                {EXAMPLES.sell.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="rx-sol-panel">
              <header>
                <span>{sell.source.label}</span>
                <span>SCAN</span>
              </header>
              <p>{sell.source.detail}</p>
              <div className="rx-sol-pair">
                <div>
                  <em>Current</em>
                  <strong className="rx-money">{sell.source.actual.value}</strong>
                </div>
                <div data-flag="true">
                  <em>Optimal</em>
                  <strong className="rx-money">{sell.source.should.value}</strong>
                </div>
              </div>
              <p className="rx-sol-delta">
                <span className="rx-tri">△</span> {sell.source.unitDelta}
              </p>
              <p className="rx-sol-sub">
                <span className="rx-tri">△</span> {sell.amount}
                {sell.period}
              </p>
            </div>
          </div>
        </section>

        <section
          className="rx-sol-block"
          id="sol-recover"
          data-nav-theme="dark"
          data-channel="recover"
        >
          <div className="rx-sol-beam" aria-hidden="true" />
          <div className="rx-shell rx-sol-grid">
            <div>
              <p className="rx-kicker">Recover</p>
              <h2 className="rx-display rx-display-sm">What you&apos;re owed.</h2>
              <p className="rx-lead-inv">This credit never arrived.</p>
              <ul className="rx-sol-examples">
                {EXAMPLES.recover.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="rx-sol-panel">
              <header>
                <span>{recover.source.label}</span>
                <span>SCAN</span>
              </header>
              <p>{recover.source.detail}</p>
              <div className="rx-sol-pair">
                <div>
                  <em>Expected</em>
                  <strong className="rx-money">{recover.source.should.value}</strong>
                </div>
                <div data-flag="true">
                  <em>Received</em>
                  <strong className="rx-money">{recover.source.actual.value}</strong>
                </div>
              </div>
              <p className="rx-sol-delta">
                <span className="rx-tri">△</span> {recover.amount}
                {recover.period}
              </p>
            </div>
          </div>
        </section>

        <section className="rx-page-cta" data-nav-theme="dark">
          <div className="rx-shell">
            <h2 className="rx-display rx-display-sm">
              Four territories.
              <br />
              One intelligence layer.
            </h2>
            <div className="rx-ctas">
              <Link href="/how" className="rx-btn rx-btn-ghost">
                How it works
              </Link>
              <Link href="/signup" className="rx-btn rx-btn-primary">
                See RADR <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
