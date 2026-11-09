import { describe, expect, it } from "vitest";
import {
  emptyDemoInvitation,
  readDemoInvitation,
  demoInvitationEligible,
  DEMO_INVITATION_DELAY_MS,
  DEMO_EXPLORED_DELAY_MS,
} from "@/lib/marketing/demoInvitation";
describe("optional demo invitation timing", () => {
  it("never invites a brand-new or unengaged visitor", () => {
    expect(demoInvitationEligible(emptyDemoInvitation(), 999999, false)).toBe(
      false,
    );
    expect(
      demoInvitationEligible(
        { ...emptyDemoInvitation(), activeMs: 999999 },
        999999,
        false,
      ),
    ).toBe(false);
  });
  it("waits four minutes of viewing plus a quiet moment", () => {
    const p = {
      ...emptyDemoInvitation(),
      interacted: true,
      activeMs: DEMO_INVITATION_DELAY_MS - 1,
    };
    expect(demoInvitationEligible(p, 9000, false)).toBe(false);
    p.activeMs++;
    expect(demoInvitationEligible(p, 7999, false)).toBe(false);
    expect(demoInvitationEligible(p, 8000, false)).toBe(true);
  });
  it("allows an earlier invitation only after sustained exploration of three areas", () => {
    const p = {
      ...emptyDemoInvitation(),
      interacted: true,
      activeMs: DEMO_EXPLORED_DELAY_MS,
      areas: ["control-center", "live"],
    };
    expect(demoInvitationEligible(p, 9000, false)).toBe(false);
    p.areas.push("decisions");
    expect(demoInvitationEligible(p, 9000, false)).toBe(true);
    p.activeMs--;
    expect(demoInvitationEligible(p, 9000, false)).toBe(false);
  });
  it("never interrupts a blocked task or repeats after showing/dismissal", () => {
    const p = { ...emptyDemoInvitation(), interacted: true, activeMs: 999999 };
    expect(demoInvitationEligible(p, 9000, true)).toBe(false);
    expect(demoInvitationEligible({ ...p, shown: true }, 9000, false)).toBe(
      false,
    );
    expect(demoInvitationEligible({ ...p, dismissed: true }, 9000, false)).toBe(
      false,
    );
  });
  it("restores a frequency cap without personal details and rejects malformed progress", () => {
    expect(readDemoInvitation("bad")).toEqual(emptyDemoInvitation());
    expect(
      readDemoInvitation(JSON.stringify({ version: 1, activeMs: -1 })),
    ).toEqual(emptyDemoInvitation());
    const p = readDemoInvitation(
      JSON.stringify({
        version: 1,
        activeMs: 999999999,
        interacted: true,
        shown: true,
        areas: ["live", "live", "person@example.com", 44, "decisions"],
      }),
    );
    expect(p.activeMs).toBe(86400000);
    expect(p.areas).toEqual(["live", "decisions"]);
    expect(demoInvitationEligible(p, 99999, false)).toBe(false);
  });
});
