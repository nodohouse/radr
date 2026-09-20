/**
 * VerifiedStamp — green only when verified.
 */

type Props = {
  verified: boolean;
  label?: string;
  pendingLabel?: string;
  className?: string;
};

export function VerifiedStamp({
  verified,
  label = "Verified",
  pendingLabel = "Pending verification",
  className = "",
}: Props) {
  return (
    <span
      className={`rx-vs ${className}`.trim()}
      data-on={verified ? "true" : "false"}
    >
      <i className="rx-vs-dot" aria-hidden="true" />
      {verified ? label : pendingLabel}
    </span>
  );
}
