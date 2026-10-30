/**
 * Final cinematic CTA — deep forest + restrained light fields.
 * No dense telecom network.
 */

import { Link } from "@/i18n/navigation";
import { CTAS } from "@/lib/marketing/brand";
import { HeadlineRadr } from "@/components/brand/HeadlineRadr";

export function HomeCloseCta() {
  return (
    <section className="rx-close rx-chapter" aria-labelledby="rx30-close-title">
      <div className="rx-close-glow rx-close-glow--blue" aria-hidden />
      <div className="rx-close-glow rx-close-glow--green" aria-hidden />
      <svg className="rx-close-accent" viewBox="0 0 400 280" aria-hidden>
        <circle cx="280" cy="140" r="56" fill="none" stroke="rgba(0,230,118,0.28)" strokeWidth="1.2" />
        <circle cx="280" cy="140" r="18" fill="none" stroke="rgba(0,230,118,0.4)" strokeWidth="1.4" />
        <circle cx="280" cy="140" r="5" fill="#00E676" opacity="0.9" />
        <path
          d="M40 80 C120 100 180 120 240 138"
          fill="none"
          stroke="rgba(75,159,255,0.35)"
          strokeWidth="1.2"
        />
        <path
          d="M60 200 C140 180 200 160 250 145"
          fill="none"
          stroke="rgba(0,230,118,0.3)"
          strokeWidth="1.15"
        />
      </svg>

      <div className="rx30-shell rx-close-inner">
        <p className="rx-close-kicker">Hospitality Operating Intelligence</p>
        <h2 id="rx30-close-title" className="rx-close-h1">
          NOTHING OFF THE <HeadlineRadr onDark />
          <span className="rx30-period rx30-period--on-dark">.</span>
        </h2>
        <p className="rx-close-lead">
          Hospitality operating intelligence. From signal to outcome.
        </p>
        <div className="rx30-ctas">
          <Link href={CTAS.seeInActionHref} className="rx30-btn rx30-btn-primary">
            See RADR in action <span aria-hidden>→</span>
          </Link>
          <Link
            href={CTAS.primarySalesHref}
            className="rx30-btn rx30-btn-ghost rx30-btn-ghost--on-dark"
          >
            Book a demo
          </Link>
        </div>
      </div>
    </section>
  );
}
