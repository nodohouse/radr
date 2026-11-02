import Image from "next/image";
import { MARKETING_IMAGES } from "@/lib/marketing/publicImagery";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";

type Props = { kind: "company" | "pricing" | "solutions" };
/** Supporting context, never a fabricated customer testimonial or live integration. */
export function MarketingHeroVisual({ kind }: Props) {
  if (kind === "company")
    return (
      <aside className="rm-page-hero-visual rm-company-visual">
        <Image
          src={MARKETING_IMAGES.companyHero.src}
          alt={MARKETING_IMAGES.companyHero.alt}
          fill
          sizes="(max-width:720px) 100vw, 520px"
          priority
        />
        <div>
          <FrozenRadrLogo variant="mark" theme="dark" width={35} />
          <p>
            Systems record.
            <br />
            RADR connects the decision.
            <br />
            <strong>People provide the hospitality.</strong>
          </p>
        </div>
      </aside>
    );
  if (kind === "pricing")
    return (
      <aside className="rm-page-hero-visual rm-scope-visual">
        <p className="rm-eyebrow">A COMMERCIAL MODEL THAT FOLLOWS THE WORK</p>
        <h3>
          Prove it.
          <br />
          Then expand it.
        </h3>
        <ol>
          <li>
            <span>01</span>
            <div>
              <strong>Define the scope</strong>
              <p>Locations, evidence, and a clear Decision class.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Review the economics</strong>
              <p>Expected value, operating cost, and responsibilities.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Expand on evidence</strong>
              <p>Broader scope when the proof supports it.</p>
            </div>
          </li>
        </ol>
        <small>
          Scoped pricing. No invented savings or guaranteed returns.
        </small>
      </aside>
    );
  return (
    <aside id="lenses" className="rm-page-hero-visual rm-scope-visual">
      <p className="rm-eyebrow">ONE CONNECTED ECONOMIC PICTURE</p>
      <h3>
        Find the leak.
        <br />
        Follow the evidence.
      </h3>
      <div className="rm-lens-grid">
        {[
          ["BUY", "Supplier terms & actual costs"],
          ["LABOR", "Preparation & coverage"],
          ["SELL", "Demand & service capacity"],
          ["RECOVER", "Reconciliation & evidence"],
        ].map(([title, body]) => (
          <div key={title}>
            <span>{title}</span>
            <p>{body}</p>
          </div>
        ))}
      </div>
      <p className="rm-caption">
        Four economic lenses. One adaptive decision system.
      </p>
    </aside>
  );
}
