"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RadrLogo } from "@/components/marketing/RadrLogo";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { writeWorkspaceBrand } from "@/lib/onboarding/brand";

/**
 * One familiar system at a time - operators know product names, not data categories.
 * Pattern: Plaid/Ramp logo pick + hospitality white-glove (“we’ll set it up”).
 */
const SYSTEMS = [
  { id: "sevenrooms", name: "SevenRooms", use: "Bookings" },
  { id: "opentable", name: "OpenTable", use: "Bookings" },
  { id: "resy", name: "Resy", use: "Bookings" },
  { id: "toast", name: "Toast", use: "Sales" },
  { id: "lightspeed", name: "Lightspeed", use: "Sales" },
  { id: "square", name: "Square", use: "Sales" },
  { id: "deputy", name: "Deputy", use: "Staff" },
  { id: "7shifts", name: "7shifts", use: "Staff" },
  { id: "other", name: "Something else", use: "Other" },
  { id: "unsure", name: "I’m not sure", use: "Help" },
] as const;

type SystemId = (typeof SYSTEMS)[number]["id"];

type Props = {
  orgName: string;
  locationName: string;
};

export function ConnectOperation({ orgName, locationName }: Props) {
  const router = useRouter();
  const [picked, setPicked] = useState<(typeof SYSTEMS)[number] | null>(null);
  const [pending, startTransition] = useTransition();

  function enterProduct(opts: {
    systemId?: SystemId;
    systemName?: string;
    requested: boolean;
  }) {
    startTransition(async () => {
      writeWorkspaceBrand({
        orgName,
        locationName,
        demo: true,
      });

      if (opts.systemId) {
        trackOnboarding("integration_selected", { category: opts.systemId });
      }
      if (opts.requested && opts.systemId) {
        trackOnboarding("integration_started", { category: opts.systemId });
      }

      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "done",
          demoEnabled: true,
          completedAt: new Date().toISOString(),
          ...(opts.systemId
            ? {
                pendingSystem: opts.systemId,
                pendingSystemLabel: opts.systemName,
              }
            : {}),
        }),
      });

      router.push("/app?welcome=1");
      router.refresh();
    });
  }

  return (
    <div className="ob-root">
      <header className="ob-chrome">
        <RadrLogo size="md" variant="plain" surface="light" as="p" />
        <button
          type="button"
          className="ob-btn ob-btn-ghost"
          onClick={() => enterProduct({ requested: false })}
          disabled={pending}
        >
          Skip for now →
        </button>
      </header>

      <main className="ob-main" style={{ maxWidth: "36rem" }}>
        {!picked ? (
          <section className="ob-panel" aria-labelledby="ob-connect-title">
            <p className="ob-step">Connect</p>
            <h1 id="ob-connect-title" className="ob-title">
              Which system should we start with?
            </h1>
            <p className="ob-copy">
              Pick one you already use. We handle the rest. You can add more
              later.
            </p>

            <div className="ob-system-grid" role="list">
              {SYSTEMS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="listitem"
                  className="ob-system"
                  onClick={() => setPicked(s)}
                >
                  <strong>{s.name}</strong>
                  <span>{s.use}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="ob-panel" aria-labelledby="ob-next-title">
            <p className="ob-step">Next</p>
            {picked.id === "unsure" ? (
              <>
                <h1 id="ob-next-title" className="ob-title">
                  No problem.
                </h1>
                <p className="ob-copy">
                  Explore RADR with demo data first. When you know which system
                  to connect, we’ll walk you through it in a few taps.
                </p>
                <div className="ob-actions">
                  <button
                    type="button"
                    className="ob-btn ob-btn-primary"
                    disabled={pending}
                    onClick={() => enterProduct({ requested: false })}
                  >
                    Enter RADR <span aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    className="ob-btn ob-btn-ghost"
                    onClick={() => setPicked(null)}
                  >
                    Back
                  </button>
                </div>
              </>
            ) : picked.id === "other" ? (
              <>
                <h1 id="ob-next-title" className="ob-title">
                  Tell us what you use.
                </h1>
                <p className="ob-copy">
                  We’ll set it up for {orgName}. Most connections take a short
                  approval from whoever manages that system - often your GM or
                  accountant, not IT.
                </p>
                <div className="ob-reassure">
                  <p>
                    You’ll get a clear checklist inside RADR. No technical setup
                    on your side.
                  </p>
                </div>
                <div className="ob-actions">
                  <button
                    type="button"
                    className="ob-btn ob-btn-primary"
                    disabled={pending}
                    onClick={() =>
                      enterProduct({
                        systemId: "other",
                        systemName: "Something else",
                        requested: true,
                      })
                    }
                  >
                    Request setup <span aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    className="ob-btn ob-btn-ghost"
                    onClick={() => setPicked(null)}
                  >
                    Back
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 id="ob-next-title" className="ob-title">
                  We’ll set up {picked.name}.
                </h1>
                <p className="ob-copy">
                  For {orgName} · {locationName}. Someone on your team may need
                  to approve access - usually whoever already logs into{" "}
                  {picked.name}.
                </p>
                <div className="ob-reassure">
                  <p>
                    While that finishes, you can explore RADR with demo data.
                    Your live numbers replace the demo once {picked.name} is
                    connected.
                  </p>
                </div>
                <div className="ob-actions">
                  <button
                    type="button"
                    className="ob-btn ob-btn-primary"
                    disabled={pending}
                    onClick={() =>
                      enterProduct({
                        systemId: picked.id,
                        systemName: picked.name,
                        requested: true,
                      })
                    }
                  >
                    Continue into RADR <span aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    className="ob-btn ob-btn-ghost"
                    onClick={() => setPicked(null)}
                  >
                    Pick a different system
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
