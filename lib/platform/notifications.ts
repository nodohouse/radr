/**
 * Notification architecture - preferences + rules. Email first; no fake Slack.
 */

import type { FindingUrgency } from "@/lib/radr/domain";

export type NotificationChannel = "email" | "slack" | "teams" | "push";

export type NotificationEventType =
  | "ACT_NOW"
  | "TODAY"
  | "WATCH"
  | "VERIFIED_VALUE"
  | "SYNC_FAILURE"
  | "MORNING_BRIEF";

export type NotificationPreference = {
  userId: string;
  organizationId: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  enabled: boolean;
};

export type NotificationDraft = {
  eventType: NotificationEventType;
  channel: NotificationChannel;
  userId: string;
  title: string;
  body: string;
  href?: string;
  interrupt: boolean;
};

const DEFAULT_RULES: Record<
  NotificationEventType,
  { interrupt: boolean; defaultEnabled: boolean }
> = {
  ACT_NOW: { interrupt: true, defaultEnabled: true },
  TODAY: { interrupt: false, defaultEnabled: true },
  WATCH: { interrupt: false, defaultEnabled: false },
  VERIFIED_VALUE: { interrupt: false, defaultEnabled: false },
  SYNC_FAILURE: { interrupt: true, defaultEnabled: true },
  MORNING_BRIEF: { interrupt: false, defaultEnabled: true },
};

export function shouldNotify(input: {
  urgency?: FindingUrgency;
  eventType: NotificationEventType;
  preference?: NotificationPreference | null;
}): boolean {
  const rule = DEFAULT_RULES[input.eventType];
  if (input.preference) return input.preference.enabled;
  return rule.defaultEnabled;
}

export function draftFindingNotification(input: {
  userId: string;
  urgency: FindingUrgency;
  title: string;
  locationName: string;
  href?: string;
}): NotificationDraft | null {
  const eventType =
    input.urgency === "ACT_NOW"
      ? "ACT_NOW"
      : input.urgency === "TODAY"
        ? "TODAY"
        : "WATCH";
  if (!shouldNotify({ eventType, urgency: input.urgency })) return null;

  return {
    eventType,
    channel: "email",
    userId: input.userId,
    title: `[RADR ${eventType.replace("_", " ")}] ${input.locationName}`,
    body: input.title,
    href: input.href,
    interrupt: DEFAULT_RULES[eventType].interrupt,
  };
}
