import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { CTAS } from "@/lib/marketing/brand";
import {
  CANON_OTA,
  canonScenario,
} from "@/lib/radr/decision/demo/canonical";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../../product-chapters.css";
import "../../../econ.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Operating Memory — RADR",
    description:
      "Your best managers learn. RADR makes sure the operation does too.",
    alternates: buildAlternatesForLocale(locale, "/product/memory"),
  };
}

export default async function MemoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const withoutMemory = canonScenario(CANON_OTA, "do_nothing");
  const withMemory = canonScenario(CANON_OTA, "hold_72h");

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section className="rx-mem-page" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">Platform · Operating Memory</p>
            <h1 className="rx-ch-title">
              The operation should not
              <br />
              have to learn the same lesson twice.
            </h1>
            <p className="rx-plat10-lead" style={{ marginTop: "1rem", maxWidth: "36rem" }}>
              One manager&apos;s good judgment can become location memory, then a
              verified playbook, then group intelligence — when context is
              sufficiently comparable. Not blind transfer.
            </p>
          </div>

          <div className="rx-mem-page-stage">
            <Image
              src="/demo/facilities/canal-suite.jpg"
              alt=""
              fill
              sizes="100vw"
              className="rx-mem-page-img"
              style={{ objectPosition: "55% 45%" }}
            />
            <div className="rx-mem-page-veil" />

            <div className="rx-mem-page-ghost" data-n="1">
              <em>Without memory</em>
              <span>{withoutMemory?.title ?? "Release to OTA now"}</span>
            </div>
            <div className="rx-mem-page-ghost" data-n="2">
              <em>Same conditions</em>
              <span>
                {CANON_OTA.property} · 89% · OTA +11 pts · 4 premium open
              </span>
            </div>
            <div className="rx-mem-page-now">
              <em>With memory · event-weekend playbook</em>
              <strong>{withMemory?.title ?? "Hold premium direct 72h"}</strong>
              <p>{CANON_OTA.learning.lesson}</p>
              <span className="rx-mem-page-playbook">
                {CANON_OTA.learning.playbookTo.toUpperCase()}
              </span>
            </div>
            <div className="rx-mem-page-auto">
              <em>Playbook v3</em>
              <strong>Auto-stage now allowed</strong>
              <span>Within policy · material send still asks</span>
            </div>
          </div>

          <div className="rx-shell">
            <div className="rx-mem-compare">
              <div className="rx-mem-compare-col" data-side="cold">
                <em>Without memory</em>
                <strong>{withoutMemory?.title}</strong>
                <p>{withoutMemory?.note}</p>
              </div>
              <div className="rx-mem-compare-col" data-side="warm">
                <em>With memory</em>
                <strong>{withMemory?.title}</strong>
                <p>{withMemory?.note}</p>
              </div>
            </div>
            <p className="rx-plat10-muted" style={{ marginTop: "1.25rem" }}>
              Illustrative memory context · DEMO — 18 similar event nights · 6
              early OTA · 12 direct holds
            </p>
            <div className="rx-learn-forecast">
              <span>Forecast error</span>
              <strong>14.2% → 6.8%</strong>
              <em>Illustrative · DEMO</em>
            </div>
            <p className="rx-plat10-playbook-tag">PATTERN RESOLVED</p>
            <div className="rx-ch-ctas">
              <NextLink href="/app" className="rx-btn rx-btn-primary">
                See what RADR learned <span aria-hidden="true">→</span>
              </NextLink>
              <NextLink href="/contact" className="rx-btn rx-btn-ghost">
                {CTAS.primarySales}
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
