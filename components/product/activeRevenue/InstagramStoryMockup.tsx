"use client";

import type {
  SocialRecoveryPreview,
  StoryVisualStyle,
} from "@/lib/radr/activeRevenue";

export type StoryDraft = {
  headline: string;
  time: string;
  partyLabel: string;
  location: string;
  cta: string;
};

type Props = {
  preview: SocialRecoveryPreview;
  visual: StoryVisualStyle;
  draft: StoryDraft;
  handle?: string;
  /** When true, fields are contentEditable-style via parent inputs - story still shows live */
  editing?: boolean;
};

function sceneExtras(visual: StoryVisualStyle) {
  switch (visual) {
    case "candlelit":
      return (
        <>
          <div className="rp-ig-scene-candles" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="rp-ig-scene-glasses" aria-hidden="true">
            <i /><i />
          </div>
          <div className="rp-ig-scene-linen" aria-hidden="true" />
        </>
      );
    case "terrace":
      return (
        <>
          <div className="rp-ig-scene-sky" aria-hidden="true" />
          <div className="rp-ig-scene-plants" aria-hidden="true">
            <i /><i /><i />
          </div>
          <div className="rp-ig-scene-stringlights" aria-hidden="true" />
        </>
      );
    case "linen":
      return (
        <>
          <div className="rp-ig-scene-softlight" aria-hidden="true" />
          <div className="rp-ig-scene-plate" aria-hidden="true" />
          <div className="rp-ig-scene-cutlery" aria-hidden="true" />
        </>
      );
    case "chef":
      return (
        <>
          <div className="rp-ig-scene-steam" aria-hidden="true" />
          <div className="rp-ig-scene-plating" aria-hidden="true" />
          <div className="rp-ig-scene-herbs" aria-hidden="true" />
        </>
      );
    case "bar":
      return (
        <>
          <div className="rp-ig-scene-bottles" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <div className="rp-ig-scene-neon" aria-hidden="true" />
          <div className="rp-ig-scene-stool" aria-hidden="true" />
        </>
      );
  }
}

/**
 * Hospitality Instagram Story mock - atmospheric venue scenes, live draft overlay.
 */
export function InstagramStoryMockup({
  preview,
  visual,
  draft,
  handle = "northstar.berlin",
  editing = false,
}: Props) {
  return (
    <div
      className="rp-ig-story"
      data-visual={visual}
      data-editing={editing ? "true" : undefined}
      aria-label="Instagram Story preview"
    >
      <div className="rp-ig-story-phone">
        <div className="rp-ig-story-stage">
          <div className="rp-ig-story-bg" aria-hidden="true">
            <div className="rp-ig-story-bg-depth" />
            <div className="rp-ig-story-bg-glow" />
            <div className="rp-ig-story-bg-table" />
            {sceneExtras(visual)}
            <div className="rp-ig-story-bg-vignette" />
          </div>

          <div className="rp-ig-story-progress" aria-hidden="true">
            <span data-active="true" />
            <span />
            <span />
          </div>

          <header className="rp-ig-story-chrome">
            <div className="rp-ig-story-avatar" aria-hidden="true">
              N
            </div>
            <div className="rp-ig-story-meta">
              <strong>{handle}</strong>
              <span>Just now</span>
            </div>
            <span className="rp-ig-story-close" aria-hidden="true">
              ×
            </span>
          </header>

          <div className="rp-ig-story-body">
            <p className="rp-ig-story-eyebrow">Tonight</p>
            <p className="rp-ig-story-headline">{draft.headline}</p>
            <div className="rp-ig-story-card">
              {draft.time ? (
                <p className="rp-ig-story-time">{draft.time}</p>
              ) : null}
              {draft.partyLabel ? (
                <p className="rp-ig-story-party">{draft.partyLabel}</p>
              ) : null}
              {draft.location ? (
                <p className="rp-ig-story-place">{draft.location}</p>
              ) : null}
            </div>
            <div className="rp-ig-story-sticker">{draft.cta || "Reserve →"}</div>
          </div>

          <footer className="rp-ig-story-reply" aria-hidden="true">
            <span>Send message</span>
            <span className="rp-ig-story-icons">♡ ➤</span>
          </footer>
        </div>
      </div>
      <p className="rp-ig-story-caption">
        {preview.assetLabel} · mock preview · approval required
      </p>
    </div>
  );
}

export function draftFromCopy(
  copy: string,
  fallback: {
    time: string;
    partySize: number;
    locationName: string;
    cta: string;
  },
): StoryDraft {
  const lines = copy
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const headline =
    lines.find((l) => /table|opened|available|tonight|seats|terrace|love/i.test(l)) ??
    lines[0] ??
    "One table opened tonight.";
  return {
    headline,
    time: fallback.time,
    partyLabel: `${fallback.partySize} guests`,
    location: fallback.locationName,
    cta: fallback.cta,
  };
}
