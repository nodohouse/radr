import Image from "next/image";

type OverlayLine = {
  label: string;
  value: string;
  tone?: "ink" | "risk" | "verified" | "mute";
};

type Props = {
  src: string;
  alt?: string;
  position?: string;
  kicker?: string;
  title?: string;
  lines: OverlayLine[];
  className?: string;
};

/**
 * Hospitality scene + one sharp RADR intelligence layer.
 * Chaos outside · clarity on top.
 */
export function PhotoOverlay({
  src,
  alt = "",
  position = "50% 50%",
  kicker,
  title,
  lines,
  className = "",
}: Props) {
  return (
    <figure className={`rx-photo-overlay ${className}`.trim()}>
      <div className="rx-photo-overlay-media" aria-hidden="true">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 980px) 100vw, 48vw"
          className="rx-photo-overlay-img"
          style={{ objectPosition: position }}
        />
        <div className="rx-photo-overlay-veil" />
      </div>
      <figcaption className="rx-photo-overlay-card">
        {kicker ? <p className="rx-photo-overlay-kicker">{kicker}</p> : null}
        {title ? <p className="rx-photo-overlay-title">{title}</p> : null}
        <ul>
          {lines.map((l) => (
            <li key={l.label} data-tone={l.tone ?? "ink"}>
              <strong>{l.value}</strong>
              <span>{l.label}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
