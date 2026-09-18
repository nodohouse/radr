import Link from "next/link";
import type { ReactNode } from "react";
import { RADRLogo } from "@/components/radr/RADRLogo";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Show product atmosphere panel (desktop) */
  showcase?: boolean;
};

/**
 * Auth front door: quiet product identity + form.
 * No Google CTA (not implemented).
 */
export function AuthPageShell({
  title,
  subtitle,
  children,
  showcase = true,
}: Props) {
  return (
    <div className="radr rx-auth">
      <div className="rx-auth-grid" data-showcase={showcase ? "true" : "false"}>
        {showcase ? (
          <aside className="rx-auth-stage" aria-hidden="true">
            <div className="rx-auth-stage-atm" />
            <Link href="/" className="rx-auth-stage-mark" tabIndex={-1}>
              <RADRLogo size="nav" variant="luminous" surface="dark" />
            </Link>
            <div className="rx-auth-stage-copy">
              <p className="rx-kicker">The adaptive decision system</p>
              <h2 className="rx-auth-stage-title">
                Operating judgment
                <br />
                for hospitality.
              </h2>
              <ul className="rx-auth-territories">
                <li>BUY</li>
                <li>LABOR</li>
                <li>SELL</li>
                <li>RECOVER</li>
              </ul>
            </div>
            <p className="rx-auth-stage-note">
              Connect · Understand · Detect · Explain · Act · Control · Verify
            </p>
          </aside>
        ) : null}

        <main className="rx-auth-panel">
          {!showcase ? (
            <Link href="/" className="rx-auth-panel-mark" aria-label="RADR home">
              <RADRLogo size="nav" variant="luminous" surface="dark" />
            </Link>
          ) : (
            <Link
              href="/"
              className="rx-auth-panel-mark rx-auth-panel-mark--mobile"
              aria-label="RADR home"
            >
              <RADRLogo size="nav" variant="luminous" surface="dark" />
            </Link>
          )}
          <header className="rx-auth-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          <div className="rx-auth-body">{children}</div>
        </main>
      </div>
    </div>
  );
}
