import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { ControlValueDemo } from "@/components/marketing/pricing/ControlValueDemo";
import { FeatureCompare } from "@/components/marketing/pricing/FeatureCompare";
import { PricingFaq } from "@/components/marketing/pricing/PricingFaq";
import { PricingTiers } from "@/components/marketing/pricing/PricingTiers";
import { pricingConfig } from "@/components/marketing/pricing/config";
import "@/app/prep.css";
import "@/app/pricing.css";

export const metadata: Metadata = {
  title: "RADR Pricing — Try, Run, Scale",
  description: `Try RADR free. Run RADR Control at ${pricingConfig.control.priceLabel} ${pricingConfig.control.unit}. Scale across the group.`,
};

export default function PricingPage() {
  const { free, control, scale } = pricingConfig;

  return (
    <div className="radr prep px-page">
      <SiteNav variant="pricing" />

      <section className="px-hero">
        <div className="prep-shell">
          <p className="prep-kicker">Pricing</p>
          <h1 className="px-hero-title">
            Put your
            <br />
            operation
            <br />
            on RADR.
          </h1>
          <p className="px-hero-lead">
            RADR scales with the size and complexity of your operation.
          </p>
          {free.noCardRequired ? (
            <p className="prep-tag">No credit card required.</p>
          ) : null}
          <div className="px-hero-ctas">
            <Link href={free.cta.href} className="prep-btn prep-btn-primary">
              Start free <span aria-hidden="true">→</span>
            </Link>
            <a href="#plans" className="prep-btn prep-btn-ghost">
              See plans
            </a>
          </div>
        </div>
      </section>

      <PricingTiers />
      <ControlValueDemo />
      <FeatureCompare />
      <PricingFaq />

      <section className="px-final">
        <div className="prep-shell">
          <p className="prep-kicker">Not sure?</p>
          <p className="px-final-small">Start free.</p>
          <h2 className="px-final-title">Ready?</h2>
          <p className="px-final-price">
            Control · {control.priceLabel} / location / month
          </p>
          <div className="px-hero-ctas">
            <Link href={control.cta.href} className="prep-btn prep-btn-primary">
              {control.cta.label} <span aria-hidden="true">→</span>
            </Link>
            <Link href={scale.cta.href} className="prep-btn prep-btn-ghost">
              Multi-site? {scale.cta.label} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
