export const DEMO_INVITATION_KEY = "radr.demo.invitation.v1";
export const DEMO_INVITATION_DELAY_MS = 4 * 60 * 1000;
export const DEMO_EXPLORED_DELAY_MS = 2 * 60 * 1000;
export const DEMO_INVITATION_QUIET_MS = 8000;

export type DemoInvitationProgress = {
  version: 1;
  activeMs: number;
  interacted: boolean;
  shown: boolean;
  dismissed: boolean;
  areas: string[];
};
export function emptyDemoInvitation(): DemoInvitationProgress {
  return {
    version: 1,
    activeMs: 0,
    interacted: false,
    shown: false,
    dismissed: false,
    areas: [],
  };
}
export function readDemoInvitation(raw: string | null): DemoInvitationProgress {
  try {
    const value = JSON.parse(raw || "null");
    if (
      value?.version !== 1 ||
      !Number.isFinite(value.activeMs) ||
      value.activeMs < 0
    )
      return emptyDemoInvitation();
    return {
      version: 1,
      activeMs: Math.min(value.activeMs, 86400000),
      interacted: value.interacted === true,
      shown: value.shown === true,
      dismissed: value.dismissed === true,
      areas: Array.isArray(value.areas)
        ? [
            ...new Set<string>(
              value.areas.filter(
                (v: unknown) =>
                  typeof v === "string" && /^[a-z-]{1,32}$/.test(v),
              ),
            ),
          ].slice(0, 20)
        : [],
    };
  } catch {
    return emptyDemoInvitation();
  }
}
export function demoInvitationEligible(
  progress: DemoInvitationProgress,
  quietMs: number,
  blocked: boolean,
) {
  if (
    progress.shown ||
    progress.dismissed ||
    !progress.interacted ||
    blocked ||
    quietMs < DEMO_INVITATION_QUIET_MS
  )
    return false;
  return (
    progress.activeMs >= DEMO_INVITATION_DELAY_MS ||
    (progress.activeMs >= DEMO_EXPLORED_DELAY_MS && progress.areas.length >= 3)
  );
}
