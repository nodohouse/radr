import Link from "next/link";
import type { ReactNode } from "react";
import { AuthSignalPreview } from "@/components/AuthSignalPreview";
import { RadrWordmark } from "@/components/marketing/RadrWordmark";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Show product atmosphere panel (desktop) */
  showcase?: boolean;
};

/**
 * Auth front door — product atmosphere + form.
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
              <RadrWordmark size="nav" />
            </Link>
            <div className="rx-auth-stage-copy">
              <p className="rx-kicker">Margin intelligence</p>
              <h2 className="rx-auth-stage-title">
                Nothing off
                <br />
                the RADR.
              </h2>
              <AuthSignalPreview />
            </div>
            <p className="rx-auth-stage-note">
              Built first for complex hospitality operations.
            </p>
          </aside>
        ) : null}

        <main className="rx-auth-panel">
          {!showcase ? (
            <Link href="/" className="rx-auth-panel-mark" aria-label="RADR home">
              <RadrWordmark size="nav" />
            </Link>
          ) : (
            <Link href="/" className="rx-auth-panel-mark rx-auth-panel-mark--mobile" aria-label="RADR home">
              <RadrWordmark size="nav" />
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
