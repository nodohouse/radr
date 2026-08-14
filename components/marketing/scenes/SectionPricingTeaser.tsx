import Link from "next/link";

export function SectionPricingTeaser() {
  return (
    <section className="rx-section rx-section-tight rx-light" id="pricing-teaser">
      <div className="rx-shell" style={{ maxWidth: "36rem" }}>
        <p className="rx-kicker rx-ink">Pricing</p>
        <h2 className="rx-display rx-display-sm">
          Put your operation
          <br />
          on RADR.
        </h2>
        <p className="rx-lead rx-lead-short">
          See what RADR would find — then decide.
        </p>
        <div className="rx-ctas">
          <Link href="/pricing" className="rx-btn rx-btn-ink">
            View pricing <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
