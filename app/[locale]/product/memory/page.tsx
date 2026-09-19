import type { Metadata } from "next";
import NextLink from "next/link";
import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { CTAS } from "@/lib/marketing/brand";
import {
  CANON_PEAK,
  canonScenario,
} from "@/lib/radr/decision/demo/canonical";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../../product-chapters.css";
import "../../../econ.css";
import "../../../kinetic.css";

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
  const withMemory = canonScenario(CANON_PEAK, "wait_12");

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">
              Platform · Operating Memory · Historical · D-1911
            </p>
            <h1 className="rx-ch-title">
              Night 01 to Night 18.
              <br />
              Calibration — not chat history.
            </h1>
            <p className="rx-ch-lead" style={{ marginTop: "1rem", maxWidth: "36rem" }}>
              The operation should not have to learn the same lesson twice.
              Uncertainty narrows. The playbook earns trust.
            </p>
          </div>

          <div className="rx-mem-page-stage rx-mem-page-stage-solid">
            <ol className="rx-mem-history rx-mem-calibrate" aria-label="Night calibration">
              <li data-band="wide">
                <em>Night 01</em>
                <strong>14.2% forecast error</strong>
                <span className="rx-mem-band" aria-hidden="true" />
              </li>
              <li>
                <em>Night 05</em>
                <strong>Wait held · kitchen protected</strong>
              </li>
              <li>
                <em>Night 12</em>
                <strong>Pattern consolidating</strong>
              </li>
              <li data-band="tight">
                <em>Night 18</em>
                <strong>6.8% forecast error</strong>
                <span className="rx-mem-band" aria-hidden="true" />
              </li>
              <li data-on="true">
                <em>Playbook v3</em>
                <strong>Auto-stage now allowed</strong>
              </li>
            </ol>
            <div className="rx-mem-page-now">
              <em>Converged · Historical · D-1911</em>
              <strong>{withMemory?.title ?? "Wait 12 minutes"}</strong>
              <p>{CANON_PEAK.learning.lesson}</p>
              <span className="rx-mem-page-playbook">PLAYBOOK V3</span>
            </div>
          </div>

          <div className="rx-shell">
            <div className="rx-ch-ctas">
              <NextLink href="/product" className="rx-btn rx-btn-primary">
                See D-1911 on Platform <span aria-hidden="true">→</span>
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
