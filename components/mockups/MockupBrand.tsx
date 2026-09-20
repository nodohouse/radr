"use client";

import { RadrWordmark } from "@/components/radr/RadrWordmark";
import { RadrDeltaGlyph } from "@/components/radr/RadrDeltaGlyph";

type Props = {
  /** Small corner lockup */
  corner?: boolean;
  /** Large centered mark */
  center?: boolean;
  label?: string;
};

export function MockupBrand({ corner = true, center, label }: Props) {
  return (
    <>
      {corner ? (
        <div className="mk-brand-corner">
          <RadrWordmark size="lg" variant="luminous" surface="dark" />
          {label ? <span className="mk-brand-label">{label}</span> : null}
        </div>
      ) : null}
      {center ? (
        <div className="mk-brand-center" aria-hidden="true">
          <span className="mk-brand-delta">
            <RadrDeltaGlyph />
          </span>
        </div>
      ) : null}
    </>
  );
}
