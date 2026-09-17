import Link from "next/link";
import { formatEuro } from "@/lib/lab/format";
import type { MoneyGrade, Wedge } from "@/lib/lab/types";

type Props = {
  id?: string;
  displayId: string;
  title: string;
  euro?: number;
  euroLabel?: string;
  grade: MoneyGrade | string;
  because: string;
  clock?: string;
  wedge?: Wedge | string;
  href?: string;
  cta?: string;
  onCta?: () => void;
  blurb?: string;
  pinned?: boolean;
  onPin?: () => void;
  emphasize?: boolean;
};

export function StoryCard({
  displayId,
  title,
  euro,
  euroLabel,
  grade,
  because,
  clock,
  wedge,
  href,
  cta = "Open",
  onCta,
  blurb,
  pinned,
  onPin,
  emphasize,
}: Props) {
  return (
    <article className="lab-story" data-grade={grade} data-emphasize={emphasize || undefined}>
      <div className="lab-story-top">
        <em>{displayId}</em>
        {wedge ? <span className="lab-story-wedge">{wedge}</span> : null}
      </div>
      <h3>{title}</h3>
      <p className="lab-story-euro" data-grade={grade}>
        {euro && euro > 0 ? <strong>{formatEuro(euro)}</strong> : <strong>{euroLabel ?? "—"}</strong>}
        <span>{grade}</span>
      </p>
      <p className="lab-story-because">because {because}</p>
      {clock ? <p className="lab-story-clock">{clock}</p> : null}
      {blurb ? <p className="lab-story-blurb">{blurb}</p> : null}
      <div className="lab-story-actions">
        {onCta ? (
          <button type="button" className="lab-story-cta" onClick={onCta}>
            {cta}
          </button>
        ) : href ? (
          <Link href={href} className="lab-story-cta">
            {cta}
          </Link>
        ) : null}
        {onPin ? (
          <button type="button" className="lab-story-pin" data-on={pinned || undefined} onClick={onPin}>
            {pinned ? "Pinned" : "Pin"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
