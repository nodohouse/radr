import Image from "next/image";
import type { ReactNode } from "react";
import { PageShell } from "@/components/marketing/MarketingShell";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showcase?: boolean;
};
export function AuthPageShell({
  title,
  subtitle,
  children,
  showcase = true,
}: Props) {
  return (
    <PageShell>
      <section
        className="rp-auth-layout"
        data-showcase={showcase ? "true" : "false"}
      >
        {showcase && (
          <aside className="rp-auth-atmosphere">
            <div>
              <p className="rp-kicker">HOSPITALITY OPERATING INTELLIGENCE</p>
              <h2>
                Your operation.
                <br />
                On{" "}
                <Image
                  src="/brand/radr-wordmark-balanced-white.svg"
                  alt="RADR"
                  width={250}
                  height={57}
                />
                <span>.</span>
              </h2>
              <p>
                A clearer picture.
                <br />
                Every next decision.
              </p>
            </div>
          </aside>
        )}
        <div className="rp-auth-panel">
          <p className="rp-kicker">WELCOME TO RADR</p>
          <header>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          <div className="rp-auth-body">{children}</div>
        </div>
      </section>
    </PageShell>
  );
}
