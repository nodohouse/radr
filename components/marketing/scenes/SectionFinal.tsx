import Link from "next/link";
import { GradientFlow } from "../primitives/GradientFlow";

export function SectionFinal() {
  return (
    <section className="rx-final" data-nav-theme="dark">
      <GradientFlow variant="edge" />
      <div className="rx-shell rx-final-inner">
        <h2 className="rx-final-title">
          What&apos;s off
          <br />
          your RADR?
        </h2>
        <Link href="/signup" className="rx-btn rx-btn-primary">
          Find out <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
