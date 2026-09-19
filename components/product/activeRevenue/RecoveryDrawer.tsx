"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/radr/money";
import type { CancellationOpportunity } from "@/lib/radr/activeRevenue";
import {
  composeSocialPreview,
  demoRecoveryTemplates,
  storyVisualLabel,
} from "@/lib/radr/activeRevenue";
import { WhyLine } from "@/components/product/WhyLine";
import {
  InstagramStoryMockup,
  draftFromCopy,
  type StoryDraft,
} from "./InstagramStoryMockup";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Panel = "preview" | "edit" | "templates";

type Props = {
  opportunity: CancellationOpportunity;
  onClose: () => void;
  onApproved?: (id: string) => void;
};

/**
 * Compact recovery drawer - editable Story mock + template picker.
 */
export function RecoveryDrawer({ opportunity: r, onClose, onApproved }: Props) {
  const templates = useMemo(
    () =>
      demoRecoveryTemplates().filter((t) =>
        t.supportedChannels.includes("instagram"),
      ),
    [],
  );

  const initial = r.socialPreview;
  const [approved, setApproved] = useState(false);
  const [panel, setPanel] = useState<Panel>("preview");
  const [templateId, setTemplateId] = useState(
    initial?.templateId ?? templates[0]?.id ?? "",
  );
  const [draft, setDraft] = useState<StoryDraft>(() =>
    draftFromCopy(initial?.copy ?? "", {
      time: r.reservationTime,
      partySize: r.partySize,
      locationName: r.locationName,
      cta: initial?.bookingLinkLabel ?? "Reserve →",
    }),
  );

  const activeTemplate =
    templates.find((t) => t.id === templateId) ?? templates[0]!;

  const preview = useMemo(() => {
    const base = composeSocialPreview({
      time: draft.time || r.reservationTime,
      partySize: r.partySize,
      locationName: draft.location || r.locationName,
      template: activeTemplate,
    });
    return {
      ...base,
      copy: [draft.headline, draft.time, draft.partyLabel, draft.location, draft.cta]
        .filter(Boolean)
        .join("\n"),
      bookingLinkLabel: draft.cta,
    };
  }, [activeTemplate, draft, r.locationName, r.partySize, r.reservationTime]);

  const eventLabel =
    r.status === "VERIFIED" || r.status === "REBOOKED"
      ? "RECOVERED"
      : r.status === "EXPIRED"
        ? "EXPIRED"
        : r.trigger === "NO_SHOW"
          ? "NO-SHOW"
          : "CANCELLED";

  const atRisk = r.remainingRevenueExposure || r.originalExpectedRevenue;
  const showSocial = Boolean(r.socialPreview) || Boolean(initial);

  function applyTemplate(id: string) {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setTemplateId(id);
    const composed = composeSocialPreview({
      time: r.reservationTime,
      partySize: r.partySize,
      locationName: r.locationName,
      template: tpl,
    });
    setDraft(
      draftFromCopy(composed.copy, {
        time: r.reservationTime,
        partySize: r.partySize,
        locationName: r.locationName,
        cta: tpl.ctaStyle,
      }),
    );
    setPanel("preview");
  }

  function approve() {
    setApproved(true);
    onApproved?.(r.id);
  }

  function patchDraft(partial: Partial<StoryDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  return (
    <div className="rp-lrr-drawer" role="dialog" aria-label="Recovery plan">
      <button
        type="button"
        className="rp-lrr-drawer-scrim"
        onClick={onClose}
        aria-label="Close recovery drawer"
      />
      <aside className="rp-lrr-drawer-card">
        <header className="rp-lrr-drawer-head">
          <div>
            <p className="rp-ari-kicker">{eventLabel}</p>
            <h2 className="rp-lrr-drawer-title">
              {r.tableLabel.toUpperCase()} · {r.partySize} GUESTS
            </h2>
            <p className="rp-ari-meta">
              {r.reservationTime}
              {r.minutesLate != null && r.minutesLate > 0
                ? ` · ${r.minutesLate} min late`
                : ""}
            </p>
          </div>
          <button type="button" className="rp-btn-secondary" onClick={onClose}>
            Close
          </button>
        </header>

        <dl className="rp-lrr-facts">
          <div>
            <dt>Original expected revenue</dt>
            <dd>{eur(r.originalExpectedRevenue)}</dd>
          </div>
          <div>
            <dt>Expected contribution</dt>
            <dd>{eur(r.originalExpectedContribution)}</dd>
          </div>
          {r.minutesToService > 0 ? (
            <div>
              <dt>Time to slot</dt>
              <dd>{r.minutesToService} min</dd>
            </div>
          ) : null}
          {r.status === "VERIFIED" ? (
            <div data-signal="true">
              <dt>Verified recovered</dt>
              <dd>{eur(r.verifiedRecoveredValue ?? 0)}</dd>
            </div>
          ) : (
            <div data-signal="true">
              <dt>Expected revenue at risk</dt>
              <dd>{eur(atRisk)}</dd>
            </div>
          )}
        </dl>

        {r.waitlistMatches.length > 0 && r.status !== "VERIFIED" ? (
          <section aria-label="Waitlist">
            <p className="rp-ari-kicker">Waitlist</p>
            <p className="rp-lrr-drawer-lead">
              {r.waitlistMatches.length} match
              {r.waitlistMatches.length === 1 ? "" : "es"}
            </p>
            {r.waitlistMatches[0] ? (
              <p className="rp-ari-row-match">
                Best: {r.waitlistMatches[0].label} ·{" "}
                {r.waitlistMatches[0].acceptanceProbabilityPct}% acceptance
              </p>
            ) : null}
          </section>
        ) : null}

        <section aria-label="Best move">
          <p className="rp-ari-kicker">Best move</p>
          <p className="rp-lrr-drawer-lead">
            {r.recommendedStrategy === "WAITLIST"
              ? "Offer waitlist now"
              : r.recommendedStrategy === "WALK_IN_HOLD"
                ? "Hold for walk-ins"
                : r.recommendedStrategy.replace(/_/g, " ")}
          </p>
          <ol className="rp-lrr-plan">
            {r.plan.steps.map((s) => (
              <li key={s.id} data-status={s.status}>
                <span className="rp-lrr-plan-when">{s.whenLabel}</span>
                <strong>{s.label}</strong>
                <em>{s.detail}</em>
              </li>
            ))}
          </ol>
          <WhyLine why={r.strategyWhy[0]} />
        </section>

        {showSocial ? (
          <section className="rp-lrr-social" aria-label="Promote this table">
            <p className="rp-ari-kicker">Social recommended</p>
            <p className="rp-lrr-drawer-lead">
              Instagram Story · {activeTemplate.name}
            </p>
            <p className="rp-ari-row-match">
              {storyVisualLabel(activeTemplate.storyVisual)}
              {activeTemplate.favorite ? " · ★ Favorite" : ""}
              {" · "}
              {activeTemplate.fillRatePct}% historical fill
            </p>
            <WhyLine why={preview.why[0]} />

            <div className="rp-lrr-preview" data-panel={panel}>
              <div className="rp-lrr-preview-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={panel === "preview"}
                  data-active={panel === "preview" ? "true" : undefined}
                  onClick={() => setPanel("preview")}
                >
                  Story
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={panel === "edit"}
                  data-active={panel === "edit" ? "true" : undefined}
                  onClick={() => setPanel("edit")}
                >
                  Edit
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={panel === "templates"}
                  data-active={panel === "templates" ? "true" : undefined}
                  onClick={() => setPanel("templates")}
                >
                  Templates
                </button>
              </div>

              {panel === "templates" ? (
                <div className="rp-lrr-templates-pick" role="listbox" aria-label="Story templates">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="option"
                      aria-selected={t.id === templateId}
                      className="rp-lrr-template-card"
                      data-active={t.id === templateId ? "true" : undefined}
                      data-visual={t.storyVisual}
                      onClick={() => applyTemplate(t.id)}
                    >
                      <span className="rp-lrr-template-thumb" aria-hidden="true">
                        <InstagramStoryMockup
                          preview={{
                            ...preview,
                            templateId: t.id,
                            templateName: t.name,
                            storyVisual: t.storyVisual,
                            assetLabel: t.assetRules,
                            bookingLinkLabel: t.ctaStyle,
                          }}
                          visual={t.storyVisual}
                          draft={{
                            headline:
                              t.brandVoice === "PREMIUM"
                                ? "An unexpected table this evening"
                                : t.brandVoice === "WARM"
                                  ? "A table just opened"
                                  : t.storyVisual === "terrace"
                                    ? "Terrace table opened"
                                    : t.storyVisual === "bar"
                                      ? "Bar seats tonight"
                                      : "One table opened tonight",
                            time: r.reservationTime,
                            partyLabel: `${r.partySize} guests`,
                            location: r.locationName,
                            cta: t.ctaStyle,
                          }}
                        />
                      </span>
                      <span className="rp-lrr-template-meta">
                        <strong>
                          {t.favorite ? "★ " : ""}
                          {t.name}
                        </strong>
                        <em>
                          {storyVisualLabel(t.storyVisual)} · {t.fillRatePct}% fill
                        </em>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rp-lrr-story-workspace">
                  <InstagramStoryMockup
                    preview={preview}
                    visual={activeTemplate.storyVisual}
                    draft={draft}
                    editing={panel === "edit"}
                  />
                  {panel === "edit" ? (
                    <form
                      className="rp-lrr-story-edit"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setPanel("preview");
                      }}
                    >
                      <label>
                        Headline
                        <input
                          value={draft.headline}
                          onChange={(e) =>
                            patchDraft({ headline: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Time
                        <input
                          value={draft.time}
                          onChange={(e) => patchDraft({ time: e.target.value })}
                        />
                      </label>
                      <label>
                        Party
                        <input
                          value={draft.partyLabel}
                          onChange={(e) =>
                            patchDraft({ partyLabel: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Location
                        <input
                          value={draft.location}
                          onChange={(e) =>
                            patchDraft({ location: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        CTA
                        <input
                          value={draft.cta}
                          onChange={(e) => patchDraft({ cta: e.target.value })}
                        />
                      </label>
                      <div className="rp-lrr-preview-actions">
                        <button type="submit" className="rp-btn-primary">
                          Done editing
                        </button>
                        <button
                          type="button"
                          className="rp-btn-secondary"
                          onClick={() => setPanel("templates")}
                        >
                          Change template
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="rp-lrr-preview-actions">
                      <button
                        type="button"
                        className="rp-btn-secondary"
                        onClick={() => setPanel("edit")}
                      >
                        Edit story
                      </button>
                      <button
                        type="button"
                        className="rp-btn-secondary"
                        onClick={() => setPanel("templates")}
                      >
                        Change template
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        ) : null}

        <footer className="rp-lrr-drawer-foot">
          {approved ? (
            <p className="rp-lrr-approved" role="status">
              Recovery plan approved. RADR is handling the next steps.
            </p>
          ) : r.status === "VERIFIED" ? null : (
            <button type="button" className="rp-btn-primary" onClick={approve}>
              {r.plan.oneTapApprove
                ? "Approve recovery plan"
                : "Approve"}
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
}
