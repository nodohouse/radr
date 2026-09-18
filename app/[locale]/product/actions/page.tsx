import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { CTAS } from "@/lib/marketing/brand";
import { CANON_OTA } from "@/lib/radr/decision/demo/canonical";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../../product-chapters.css";
import "../../../econ.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Prepared Actions — RADR",
    description:
      "The value of a decision decays while you execute it. RADR shortens the gap.",
    alternates: buildAlternatesForLocale(locale, "/product/actions"),
  };
}

const FAN_OUT = [
  "Housekeeping",
  "Front desk",
  "Room inventory",
  "Channel",
  "Guest communication",
] as const;

/**
 * Prepared Actions — two clocks racing. No timestamp tables.
 */
export default async function ActionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const decisionLabel = displayDecisionId(DECISION_IDS.ota);
  const hold =
    CANON_OTA.scenarios.find((s) => s.id === "hold_72h") ??
    CANON_OTA.scenarios[0]!;

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section className="rx-act-cinema" data-nav-theme="dark">
          <Image
            src="/demo/facilities/canal-classic-queen.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="rx-act-cinema-img"
            style={{ objectPosition: "50% 42%" }}
          />
          <div className="rx-act-cinema-veil" />
          <div className="rx-shell rx-act-cinema-copy">
            <p className="rx-ch-kicker" style={{ color: "#00d978" }}>
              Prepared Actions
            </p>
            <h1 className="rx-ch-title" style={{ color: "#f7faf8" }}>
              One Decision.
              <br />
              The operation moves with it.
            </h1>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <div className="rx-act-one-decision">
              <em>{decisionLabel}</em>
              <strong>
                {hold.title} · {CANON_OTA.property}
              </strong>
              <p>
                RADR prepares the coordinated response. You approve the action.
              </p>
            </div>

            <div className="rx-act-fanout" aria-label="Decision fan-out">
              <div className="rx-act-fanout-root">
                <em>Decision</em>
                <strong>{hold.title}</strong>
              </div>
              <ul className="rx-act-fanout-branches">
                {FAN_OUT.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
              <p className="rx-act-fanout-ready">READY FOR APPROVAL</p>
            </div>

            <p className="rx-act-timing-label">Illustrative workflow timing</p>

            <div className="rx-act-race-visual">
              <div className="rx-act-race-track" data-tone="manual">
                <em>Manual</em>
                <div className="rx-act-race-bar" style={{ ["--pct" as string]: "100%" }}>
                  <span />
                </div>
                <strong>28 min</strong>
                <p>Decision ········ Ready</p>
              </div>
              <div className="rx-act-race-track" data-tone="radr">
                <em>RADR</em>
                <div className="rx-act-race-bar" style={{ ["--pct" as string]: "14%" }}>
                  <span />
                </div>
                <strong>4 min</strong>
                <p>{decisionLabel} · Ready for approval</p>
              </div>
            </div>

            <p className="rx-pain-punch" style={{ marginTop: "2rem" }}>
              RADR prepares the response. You approve the move.
            </p>
            <p className="rx-plat10-muted">Awaiting approval · Illustrative DEMO</p>

            <div className="rx-ch-ctas">
              <NextLink href="/demo" className="rx-btn rx-btn-primary">
                See prepared action <span aria-hidden="true">→</span>
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
