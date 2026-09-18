"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { readWorkspaceBrand } from "@/lib/onboarding/brand";
import { trackOnboarding } from "@/lib/onboarding/analytics";

export function SetupChecklist() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [demo, setDemo] = useState(false);
  const [tourActive, setTourActive] = useState(false);

  useEffect(() => {
    const brand = readWorkspaceBrand();
    setDemo(Boolean(brand?.demo));
    const d = localStorage.getItem("radr.checklistDismissed") === "1";
    setDismissed(d);
    try {
      // Hide while demo coach is eligible (not dismissed).
      const tourDismissed = localStorage.getItem("radr.tour.dismissed") === "1";
      setTourActive(Boolean(brand?.demo) && !tourDismissed);
    } catch {
      setTourActive(false);
    }
  }, []);

  // One setup surface at a time - guided tour owns the corner while active.
  if (dismissed || tourActive || pathname.startsWith("/app/service")) return null;

  const items = [
    { done: true, label: "Workspace created" },
    { done: true, label: "First location" },
    {
      done: false,
      label: "Connect a system you already use",
      href: "/onboarding/connect",
    },
    { done: false, label: "Invite your team", href: "/app/settings" },
  ];
  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="ob-check-wrap">
      <button
        type="button"
        className="ob-check-pill"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        RADR setup {doneCount}/{items.length}
        {demo ? " DEMO" : ""}
      </button>
      {open ? (
        <div className="ob-check-panel" role="region" aria-label="Setup checklist">
          <ul>
            {items.map((item) => (
              <li key={item.label} data-done={item.done ? "true" : "false"}>
                <span>{item.done ? "✓" : "○"}</span>
                {item.href && !item.done ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  item.label
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="ob-btn ob-btn-ghost"
            onClick={() => {
              localStorage.setItem("radr.checklistDismissed", "1");
              setDismissed(true);
              trackOnboarding("checklist_dismissed");
              void fetch("/api/onboarding", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ checklistDismissed: true }),
              }).catch(() => undefined);
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
