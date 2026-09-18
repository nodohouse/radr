"use client";

import Link from "next/link";
import { useProduct } from "@/lib/product/store";
import type { TimeFormatPref } from "@/lib/radr/operatingCanvas";
import {
  DEMO_PERSONA_ORDER,
  DEMO_PERSONAS,
  personaFromRoleView,
} from "@/lib/radr/product/personas";
import { DEMO_ORG } from "@/lib/radr/product/demoOrg";
import { PageHeader } from "@/components/product/PageHeader";

const TIME_FORMATS: { id: TimeFormatPref; label: string }[] = [
  { id: "12h", label: "AM / PM" },
  { id: "24h", label: "24-hour" },
];

const SECTIONS = [
  {
    name: "Organization",
    detail: DEMO_ORG.name,
  },
  {
    name: "Users & permissions",
    detail: "Placeholder — live RBAC comes with auth",
  },
  {
    name: "Attention preferences",
    detail: "How RADR asks for your attention",
  },
  {
    name: "Data connections",
    detail: "Source health and coverage",
    href: "/app/integrations",
  },
] as const;

export default function SettingsPage() {
  const { roleView, setRoleView, timeFormat, setTimeFormat } = useProduct();
  const active = personaFromRoleView(roleView);

  return (
    <div className="rp-attention">
      <PageHeader
        title="Settings"
        sub="Account, organization, and demo persona."
      />

      <section className="rp-settings-block" aria-label="Demo persona">
        <p className="rp-today-section-label">Demo persona</p>
        <div className="rp-settings-roles">
          {DEMO_PERSONA_ORDER.map((id) => {
            const p = DEMO_PERSONAS[id];
            return (
              <button
                key={id}
                type="button"
                className="rp-btn-secondary"
                data-active={id === active ? "true" : undefined}
                onClick={() => setRoleView(p.role)}
              >
                {p.shortLabel}
              </button>
            );
          })}
        </div>
        <p className="rp-attention-meta" style={{ marginTop: "0.75rem" }}>
          Demo only — same Decision objects, different scope and priority.
        </p>
      </section>

      <section className="rp-settings-block" aria-label="Time format">
        <p className="rp-today-section-label">Preferences</p>
        <div className="rp-settings-roles">
          {TIME_FORMATS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="rp-btn-secondary"
              data-active={timeFormat === t.id ? "true" : undefined}
              onClick={() => setTimeFormat(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <ul className="rp-settings-list" aria-label="Settings sections">
        {SECTIONS.map((s) => (
          <li key={s.name}>
            {"href" in s && s.href ? (
              <Link href={s.href} className="rp-settings-row">
                <div>
                  <p className="rp-settings-name">{s.name}</p>
                  <p className="rp-settings-detail">{s.detail}</p>
                </div>
              </Link>
            ) : (
              <div className="rp-settings-row">
                <div>
                  <p className="rp-settings-name">{s.name}</p>
                  <p className="rp-settings-detail">{s.detail}</p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
