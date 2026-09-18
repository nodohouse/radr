type Props = {
  message?: string;
  detail?: string;
};

/** Signature calm close - operator can stop checking. */
export function StatusCalm({
  message = "Everything else is on track.",
  detail,
}: Props) {
  return (
    <p className="rp-today-calm rp-status-calm">
      <span className="rp-today-check" aria-hidden="true">
        ✓
      </span>
      <span>
        {message}
        {detail ? (
          <span className="rp-attention-done-sub">{detail}</span>
        ) : null}
      </span>
    </p>
  );
}
