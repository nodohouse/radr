"use client";

/** Soft hero accent only — light fields, not a second page wash. */
export function SilkAtmosphere({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rx30-silk rx30-silk--fields ${className}`.trim()}
      aria-hidden="true"
    >
      <span className="rx30-silk-field rx30-silk-field--blue" />
      <span className="rx30-silk-field rx30-silk-field--cyan" />
      <span className="rx30-silk-field rx30-silk-field--green" />
    </div>
  );
}
