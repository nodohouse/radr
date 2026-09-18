"use client";

/**
 * Signature brand close — stacked "Nothing off the RADR."
 * Lives on the homepage spine; not a footer afterthought.
 */
export function NothingOffTheRadr({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rx-notr ${className}`.trim()}
      aria-label="Nothing off the RADR"
    >
      <span className="rx-notr-line">Nothing</span>
      <span className="rx-notr-line">off the</span>
      <span className="rx-notr-stack" aria-hidden="true">
        <span>R</span>
        <span>A</span>
        <span>D</span>
        <span>R</span>
      </span>
    </p>
  );
}
