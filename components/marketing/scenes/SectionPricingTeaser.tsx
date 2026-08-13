import Link from "next/link";

export function SectionPricingTeaser() {
  return (
    <section
      className="radr-section radr-section-dark"
      id="pricing-teaser"
      data-nav-theme="dark"
    >
      <div className="radr-shell radr-pricing-teaser">
        <p className="radr-cat">Pricing</p>
        <h2 className="radr-h2">
          Put your operation
          <br />
          on RADR.
        </h2>
        <p className="radr-lead-inv">
          Built for operators who want to know where the money is going — before
          it&apos;s gone.
        </p>
        <div className="radr-ctas">
          <Link href="/pricing" className="radr-btn radr-btn-primary">
            View pricing{" "}
            <span className="radr-btn-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
