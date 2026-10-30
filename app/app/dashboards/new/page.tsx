"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DASHBOARD_TEMPLATES,
  createDashboardFromTemplate,
  createEmptyDashboard,
  moduleTitle,
  saveDashboard,
} from "@/lib/product/dashboards";
import {
  askDashboardStarters,
  createDashboardFromAsk,
  generateAskDashboardDraft,
} from "@/lib/product/askDashboardGenerator";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import "@/components/product/dashboards/dashboard-builder.css";
import "@/components/product/dashboards/engine/dashboards-engine.css";

type StartMode = "blank" | "template" | "ask";

function NewDashboard() {
  const router = useRouter();
  const search = useSearchParams();
  const { isHotel } = useDemoOrg();

  const templates = useMemo(
    () =>
      DASHBOARD_TEMPLATES.filter((t) => {
        if (isHotel) {
          return (
            t.id.startsWith("dash_hotel_") && t.id !== "dash_hotel_coo"
          );
        }
        return !t.id.startsWith("dash_hotel_");
      }),
    [isHotel],
  );

  const starters = useMemo(
    () => askDashboardStarters(isHotel ? "hotel" : "restaurant"),
    [isHotel],
  );

  const initialTemplate = search.get("template");
  const initialMode = (search.get("mode") as StartMode | null) ?? null;
  const initialPrompt = search.get("prompt") ?? "";

  const [mode, setMode] = useState<StartMode>(() => {
    if (initialMode === "ask" || initialMode === "blank" || initialMode === "template") {
      return initialMode;
    }
    if (initialTemplate) return "template";
    if (initialPrompt) return "ask";
    return "ask";
  });
  const [templateId, setTemplateId] = useState(
    initialTemplate && DASHBOARD_TEMPLATES.some((t) => t.id === initialTemplate)
      ? initialTemplate
      : templates[0]?.id ?? "dash_gm",
  );
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [creating, setCreating] = useState(false);

  const draft = useMemo(
    () =>
      prompt.trim()
        ? generateAskDashboardDraft(
            prompt,
            isHotel ? "hotel" : "restaurant",
          )
        : null,
    [prompt, isHotel],
  );

  const chosenTemplate =
    templates.find((t) => t.id === templateId) ?? templates[0] ?? null;

  const create = () => {
    if (creating) return;
    setCreating(true);
    try {
      if (mode === "ask") {
        const text = prompt.trim();
        if (!text) {
          setCreating(false);
          return;
        }
        let dash = createDashboardFromAsk(
          text,
          isHotel ? "hotel" : "restaurant",
        );
        if (name.trim() && name.trim() !== dash.name) {
          dash = { ...dash, name: name.trim() };
          saveDashboard(dash);
        }
        router.push(`/app/dashboards/${dash.id}/edit`);
        return;
      }
      if (mode === "template" && chosenTemplate) {
        const finalName =
          name.trim() || `${chosenTemplate.name} (copy)`;
        const dash = createDashboardFromTemplate(
          DASHBOARD_TEMPLATES.findIndex((t) => t.id === chosenTemplate.id),
          finalName,
        );
        router.push(`/app/dashboards/${dash.id}/edit`);
        return;
      }
      const dash = createEmptyDashboard(name.trim() || "Untitled dashboard");
      router.push(`/app/dashboards/${dash.id}/edit`);
    } catch {
      setCreating(false);
    }
  };

  return (
    <div className="db-root db-new" data-dashboard-new="true">
      <header className="db-head">
        <div>
          <Link href="/app/dashboards" className="db-link">
            ← Dashboards
          </Link>
          <h1 style={{ marginTop: 8 }}>Create dashboard</h1>
          <p>How do you want to start?</p>
        </div>
      </header>

      <div className="db-new-modes" role="tablist" aria-label="Start mode">
        {(
          [
            ["ask", "Ask RADR", "Describe the view — RADR builds the first layout."],
            ["template", "From template", "Start from a proven role or moment."],
            ["blank", "Blank", "Empty canvas. Add only what you need."],
          ] as const
        ).map(([id, label, blurb]) => (
          <button
            key={id}
            type="button"
            role="tab"
            data-mode={id}
            data-active={mode === id ? "true" : undefined}
            aria-selected={mode === id}
            onClick={() => setMode(id)}
          >
            <strong>{label}</strong>
            <span>{blurb}</span>
          </button>
        ))}
      </div>

      <div className="db-new-body">
        <label className="db-new-field">
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              mode === "ask"
                ? draft?.name ?? "Ask RADR will suggest a name"
                : mode === "template"
                  ? chosenTemplate?.name ?? "Untitled dashboard"
                  : "Untitled dashboard"
            }
            aria-label="Dashboard name"
          />
        </label>

        {mode === "ask" ? (
          <section className="db-new-ask" aria-label="Ask RADR">
            <label className="db-new-field">
              <span>What do you want to run the operation around?</span>
              <textarea
                rows={4}
                value={prompt}
                data-testid="ask-dashboard-prompt"
                placeholder={
                  isHotel
                    ? 'e.g. “Build me a hotel CFO dashboard for all properties this month.”'
                    : 'e.g. “Build me a CFO view for all restaurants showing contribution, labor, exposure and Verified Value.”'
                }
                onChange={(e) => setPrompt(e.target.value)}
                autoFocus
              />
            </label>

            <div className="db-new-starters" aria-label="Starter prompts">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="db-btn-ghost"
                  onClick={() => setPrompt(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {draft ? (
              <div className="db-new-preview" data-ask-preview="true">
                <h3>RADR will build</h3>
                <p>
                  <strong>{name.trim() || draft.name}</strong> ·{" "}
                  {draft.moduleIds.length} widgets
                  {draft.roleTemplate ? ` · ${draft.roleTemplate.toUpperCase()}` : ""}
                </p>
                <ul>
                  {draft.moduleIds.map((id) => (
                    <li key={id}>{moduleTitle(id)}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="db-new-hint">
                Type a request or pick a starter. RADR maps it to live operating
                widgets — no SQL.
              </p>
            )}
          </section>
        ) : null}

        {mode === "template" ? (
          <section className="db-new-templates" aria-label="Templates">
            <ul className="db-new-tpl-list">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="db-new-tpl"
                    data-active={templateId === t.id ? "true" : undefined}
                    onClick={() => setTemplateId(t.id)}
                  >
                    <strong>{t.name}</strong>
                    <span>{t.description}</span>
                    <em>
                      {t.widgets
                        .slice(0, 4)
                        .map((w) => moduleTitle(w.intelligenceModuleId))
                        .join(" · ")}
                    </em>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {mode === "blank" ? (
          <p className="db-new-hint">
            Starts empty. Use the widget library in the builder to compose the
            view.
          </p>
        ) : null}

        <div className="db-new-actions">
          <button
            type="button"
            className="db-btn-primary"
            data-testid="create-and-customize"
            disabled={
              creating || (mode === "ask" && !prompt.trim())
            }
            onClick={create}
          >
            {mode === "ask" ? "Generate & customize" : "Create and customize"}
          </button>
          <Link href="/app/dashboards" className="db-btn-secondary">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NewDashboardPage() {
  return (
    <Suspense fallback={<div className="db-root" aria-busy="true" />}>
      <NewDashboard />
    </Suspense>
  );
}
