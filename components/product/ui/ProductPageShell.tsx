import type { ReactNode } from "react";

type Width = "default" | "wide" | "narrow";

type Props = {
  children: ReactNode;
  /** default = 1120 · wide = 1360 · narrow = 720 */
  width?: Width;
  className?: string;
  /** Optional kicker above the page title band */
  kicker?: string;
  title?: string;
  sub?: string;
  actions?: ReactNode;
};

/**
 * Canonical product page frame — one left edge, one max-width, one header rhythm.
 * Prefer this over ad-hoc padding / max-width on individual routes.
 */
export function ProductPageShell({
  children,
  width = "default",
  className = "",
  kicker,
  title,
  sub,
  actions,
}: Props) {
  const showHead = Boolean(kicker || title || sub || actions);
  return (
    <div
      className={`rp-page-shell ${className}`.trim()}
      data-width={width}
    >
      {showHead ? (
        <header className="rp-page-shell-head">
          <div className="rp-page-shell-copy">
            {kicker ? <p className="rp-page-shell-kicker">{kicker}</p> : null}
            {title ? <h1 className="rp-page-shell-title">{title}</h1> : null}
            {sub ? <p className="rp-page-shell-sub">{sub}</p> : null}
          </div>
          {actions ? (
            <div className="rp-page-shell-actions">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <div className="rp-page-shell-body">{children}</div>
    </div>
  );
}
