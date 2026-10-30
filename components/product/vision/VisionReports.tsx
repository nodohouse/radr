"use client";

import Link from "next/link";
import { useState } from "react";

type ReportBrief = {
  id: string;
  title: string;
  purpose: string;
  audience: string;
  body: string;
  cadence: string;
  href: string;
  accent: "exec" | "ops" | "finance" | "guest";
};

const BRIEFS: ReportBrief[] = [
  {
    id: "executive",
    title: "Executive Summary",
    purpose: "Leadership narrative since last check",
    audience: "Group",
    body:
      "What needed judgment, what RADR handled, and verified value with evidence — one calm read.",
    cadence: "Weekly · Mon 07:00",
    href: "/app?stay=1",
    accent: "exec",
  },
  {
    id: "location",
    title: "Location Performance",
    purpose: "Estate margin and attention load",
    audience: "COO",
    body:
      "Margin vs plan, attention load, and data health by venue — calm vs intervention.",
    cadence: "Daily",
    href: "/app/locations",
    accent: "ops",
  },
  {
    id: "contribution",
    title: "Contribution",
    purpose: "Finance bridge aligned to Brief",
    audience: "CFO",
    body:
      "Revenue, COGS, labor, and channel mix with contribution bridge — same numbers the Brief uses.",
    cadence: "Daily close",
    href: "/app/value",
    accent: "finance",
  },
  {
    id: "verified",
    title: "Verified Value",
    purpose: "Board proof of sealed outcomes",
    audience: "Board",
    body:
      "Recovered, protected, and created value with verification status and euro trace.",
    cadence: "Monthly",
    href: "/app/value",
    accent: "finance",
  },
  {
    id: "labor",
    title: "Labor vs Demand",
    purpose: "Pre-shift staffing judgment",
    audience: "GM",
    body:
      "Scheduled hours against covers and pace, overtime risk, and autonomy outcomes.",
    cadence: "Pre-shift",
    href: "/app/intelligence",
    accent: "ops",
  },
  {
    id: "guest",
    title: "Guest Experience",
    purpose: "Service risk before the floor feels it",
    audience: "GM · service",
    body:
      "Satisfaction, return, spend segments, and floor issues — who is at risk tonight and why.",
    cadence: "Live service",
    href: "/app/guests",
    accent: "guest",
  },
  {
    id: "pace",
    title: "Hotel Pace",
    purpose: "30-day pickup and decision days",
    audience: "Revenue",
    body:
      "Occupancy, ADR, RevPAR, pickup windows, and decision days for the next 30.",
    cadence: "Daily",
    href: "/app?stay=1",
    accent: "ops",
  },
  {
    id: "decisions",
    title: "Decision Audit",
    purpose: "Material judgments and forks not taken",
    audience: "Group · audit",
    body:
      "Approval trail, cost of doing nothing, and evidence links for each sealed Decision.",
    cadence: "Weekly",
    href: "/app/decisions",
    accent: "exec",
  },
];

const GROUPS: { label: string; ids: string[] }[] = [
  { label: "Executive", ids: ["executive", "decisions"] },
  { label: "Operations", ids: ["location", "labor", "pace"] },
  { label: "Finance", ids: ["contribution", "verified"] },
  { label: "Guests", ids: ["guest"] },
];

export function VisionReports() {
  const [selected, setSelected] = useState<string | null>(null);
  const byId = Object.fromEntries(BRIEFS.map((b) => [b.id, b]));

  return (
    <div className="rv-page rv-reports-workspace">
      <header className="rv-page-head">
        <h1>Reports</h1>
        <p>
          Briefings from operating memory — select a template to preview, generate,
          or schedule.
        </p>
      </header>

      <div className="rv-reports-desk" aria-label="Report templates">
        {GROUPS.map((group) => (
          <section key={group.label} className="rv-reports-group">
            <h2 className="rv-reports-group-label">{group.label}</h2>
            <div className="rv-report-template-grid">
              {group.ids.map((id) => {
                const t = byId[id];
                if (!t) return null;
                const active = selected === t.id;
                return (
                  <article
                    key={t.id}
                    className="rv-report-template"
                    data-accent={t.accent}
                    data-selected={active ? "true" : undefined}
                    tabIndex={0}
                    onMouseEnter={() => setSelected(t.id)}
                    onFocus={() => setSelected(t.id)}
                    onClick={() =>
                      setSelected((cur) => (cur === t.id ? null : t.id))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected((cur) => (cur === t.id ? null : t.id));
                      }
                    }}
                  >
                    <div className="rv-report-template-preview" aria-hidden="true">
                      <span className="rv-report-template-sheet" />
                      <span className="rv-report-template-lines" />
                    </div>
                    <div className="rv-report-template-copy">
                      <p className="rv-report-purpose">{t.purpose}</p>
                      <h3>{t.title}</h3>
                      <p className="rv-report-meta">
                        {t.audience} · {t.cadence}
                      </p>
                      <p className="rv-report-body">{t.body}</p>
                    </div>
                    <div className="rv-report-template-actions">
                      <Link className="rv-btn" href={t.href}>
                        Preview
                      </Link>
                      <button type="button" className="rv-btn">
                        Generate
                      </button>
                      <button type="button" className="rv-btn" data-primary="true">
                        Schedule
                      </button>
                      <button type="button" className="rv-btn" data-quiet="true">
                        Export
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
