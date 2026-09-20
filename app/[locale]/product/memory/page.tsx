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
import "../../../radr-public.css";

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

const NIGHTS = [
  {
    night: "Night 01",
    error: "14.2% forecast error",
    band: "wide" as const,
    width: "92%",
  },
  {
    night: "Night 05",
    error: "Uncertainty narrowing",
    band: "mid" as const,
    width: "68%",
  },
  {
    night: "Night 12",
    error: "Pattern consolidating",
    band: "mid" as const,
    width: "48%",
  },
  {
    night: "Night 18",
    error: "6.8% forecast error",
    band: "tight" as const,
    width: "28%",
  },
] as const;

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
              14.2% → 6.8%.
              <br />
              Calibration — not chat history.
            </h1>
          </div>

          <div className="rx-shell">
            <ol className="rx-mem-calibrate-visual" aria-label="Night calibration">
              {NIGHTS.map((n) => (
                <li key={n.night} data-band={n.band}>
                  <em>{n.night}</em>
                  <strong>{n.error}</strong>
                  <span
                    className="rx-mem-band"
                    style={{ width: n.width }}
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ol>

            <div className="rx-mem-playbook">
              <p className="rx-ch-kicker">Playbook v3</p>
              <h2 className="rx-mem-playbook-h">
                {withMemory?.title ?? "Wait 12 minutes"}
              </h2>
              <p>
                Auto-stage now allowed within policy. The operation learned —
                so the next peak night starts with narrower uncertainty.
              </p>
            </div>

            <div className="rx-ch-ctas" style={{ marginTop: "2.5rem" }}>
              <NextLink href="/demo" className="rx-btn rx-btn-primary">
                {CTAS.primaryProduct} <span aria-hidden="true">→</span>
              </NextLink>
              <NextLink href="/product/value" className="rx-btn rx-btn-ghost">
                Verified Value
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
