/**
 * DecisionObject — shared anatomy shell for public Decision proof.
 */

import type { ReactNode } from "react";

type Props = {
  displayId: string;
  title: string;
  amount: string;
  amountLabel: string;
  verified?: boolean;
  children?: ReactNode;
  className?: string;
};

export function DecisionObject({
  displayId,
  title,
  amount,
  amountLabel,
  verified = false,
  children,
  className = "",
}: Props) {
  return (
    <article
      className={`rx-do ${className}`.trim()}
      data-verified={verified ? "true" : undefined}
    >
      <header className="rx-do-head">
        <div>
          <p className="rx-do-id">{displayId}</p>
          <h3 className="rx-do-title">{title}</h3>
        </div>
        <div
          className="rx-do-amount"
          data-tone={verified ? "verified" : undefined}
        >
          <strong>{amount}</strong>
          <em>{amountLabel}</em>
        </div>
      </header>
      {children ? <div className="rx-do-body">{children}</div> : null}
    </article>
  );
}
