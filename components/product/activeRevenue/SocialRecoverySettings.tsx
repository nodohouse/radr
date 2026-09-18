"use client";

import type { ActiveRevenueBrief } from "@/lib/radr/activeRevenue";
import { brandVoiceLabel } from "@/lib/radr/activeRevenue";
import { formatMoney } from "@/lib/radr/money";
import { WhyLine } from "@/components/product/WhyLine";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Props = {
  brief: ActiveRevenueBrief;
};

/**
 * Settings → Social & Recovery Channels (demo surface).
 */
export function SocialRecoverySettings({ brief }: Props) {
  const { config, socialProviders, templates, socialRoi } = brief;
  const favorites = templates.filter((t) => t.favorite);

  return (
    <div className="rp-lrr-settings">
      <section aria-label="Social channels">
        <p className="rp-today-section-label">Social & recovery channels</p>
        <WhyLine why="Social is an escalation tool - never the default first move" />
        <ul className="rp-lrr-settings-channels">
          {socialProviders.map((p) => (
            <li key={p.id} data-connected={p.connected ? "true" : "false"}>
              <div>
                <p className="rp-settings-name">{p.name}</p>
                <p className="rp-settings-detail">
                  {p.connected
                    ? [
                        p.canPublishStory ? "Stories" : null,
                        p.canPublishPost ? "Posts" : null,
                        p.canSendMessage ? "Messages" : null,
                        p.supportsDraftOnly ? "Draft only" : null,
                        p.requiresApproval ? "Approval required" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Not connected"}
                </p>
              </div>
              <span className="rp-lrr-sync">
                {p.connected ? p.lastSyncLabel ?? "Connected" : " - "}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Recovery rules">
        <p className="rp-today-section-label">Recovery rules</p>
        <ul className="rp-ari-month-grid rp-lrr-rules">
          <li>
            <span>No-show grace</span>
            <strong>{config.noShow.gracePeriodMinutes} min</strong>
          </li>
          <li>
            <span>Max social posts / day</span>
            <strong>
              {config.socialPostsToday}/{config.maxSocialPostsPerDay}
            </strong>
          </li>
          <li>
            <span>Min recovery value</span>
            <strong>{eur(config.minSocialRecoveryValue)}</strong>
          </li>
          <li>
            <span>Brand voice</span>
            <strong>{brandVoiceLabel(config.defaultBrandVoice)}</strong>
          </li>
          <li>
            <span>Automation</span>
            <strong>{config.noShow.automationLevel}</strong>
          </li>
        </ul>
      </section>

      <section aria-label="Favorite templates">
        <p className="rp-today-section-label">Favorite templates</p>
        <ul className="rp-lrr-templates">
          {favorites.map((t) => (
            <li key={t.id}>
              <strong>★ {t.name}</strong>
              <span>
                {t.fillRatePct}% fill · {eur(t.verifiedRecoveredRevenue)} verified
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Social recovery ROI">
        <p className="rp-today-section-label">Social recovery · this month</p>
        <ul className="rp-ari-month-grid">
          <li>
            <span>Posts</span>
            <strong>{socialRoi.posts}</strong>
          </li>
          <li>
            <span>Tables filled</span>
            <strong>{socialRoi.tablesFilled}</strong>
          </li>
          <li>
            <span>Recovery rate</span>
            <strong>
              {socialRoi.recoveryRatePct.toFixed(1).replace(".", ",")}%
            </strong>
          </li>
          <li data-signal="true">
            <span>Verified recovered</span>
            <strong>{eur(socialRoi.verifiedRecoveredRevenue)}</strong>
          </li>
          <li>
            <span>Top channel</span>
            <strong>{socialRoi.topChannel}</strong>
          </li>
          <li>
            <span>Top template</span>
            <strong>{socialRoi.topTemplate}</strong>
          </li>
        </ul>
      </section>
    </div>
  );
}
