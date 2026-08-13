type Props = {
  className?: string;
  locations?: number;
};

/** Demo status — not live customer telemetry */
export function RadrLive({ className = "", locations = 18 }: Props) {
  return (
    <div className={`radr-live ${className}`.trim()} aria-hidden="true">
      <span className="radr-live-dot" />
      <span className="radr-live-label">RADR live</span>
      <span className="radr-live-meta">
        Demo / {locations} locations
      </span>
    </div>
  );
}
