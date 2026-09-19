import { describe, expect, it } from "vitest";
import {
  RADR_LOOP_STAGES,
  RADR_LOOP_LABELS,
  buildRetainedOutcome,
  loopStageFromIndex,
  loopStageIndexFromValueState,
  loopStageStates,
} from "@/lib/radr/loop";
import { RADR_LOOP_DEMO } from "@/components/marketing/data/radrLoopDemo";
import {
  getInterventionOutcome,
  retainCancellationRecoveryOutcome,
} from "@/lib/radr/outcomeHistory";
import { HOMEPAGE_DEMO } from "@/components/marketing/data/homepageDemo";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("THE RADR LOOP", () => {
  it("defines eight canonical stages that close the loop", () => {
    expect(RADR_LOOP_STAGES).toEqual([
      "observe",
      "detect",
      "understand",
      "quantify",
      "prepare",
      "act",
      "verify",
      "learn",
    ]);
    expect(RADR_LOOP_LABELS.learn).toBe("Learn");
    expect(loopStageFromIndex(0)).toBe("observe");
    expect(loopStageFromIndex(7)).toBe("learn");
  });

  it("maps value states into loop stages without inventing execution", () => {
    expect(loopStageIndexFromValueState("IDENTIFIED", "DETECTED", false)).toBe(1);
    expect(loopStageIndexFromValueState("PREPARED", "OPEN", true)).toBe(4);
    expect(loopStageIndexFromValueState("ACTIONABLE", "OPEN", true)).toBe(4);
    expect(loopStageIndexFromValueState("ACTIONED")).toBe(5);
    expect(loopStageIndexFromValueState("OBSERVED")).toBe(6);
    expect(loopStageIndexFromValueState("PENDING_VERIFICATION")).toBe(6);
    expect(loopStageIndexFromValueState("VERIFIED")).toBe(7);
    const states = loopStageStates(4);
    expect(states.prepare).toBe("current");
    expect(states.quantify).toBe("complete");
    expect(states.act).toBe("pending");
  });

  it("retains expected vs actual without claiming model learning", () => {
    const record = buildRetainedOutcome({
      id: "t1",
      findingId: "f1",
      organizationId: "org",
      locationId: "loc",
      contextSummary: "test",
      predictionSummary: "potential 192",
      expectedValueMajor: 192,
      recommendedActionSummary: "waitlist",
      observedValueMajor: 184,
      verifiedValueMajor: 184,
    });
    expect(record.varianceMajor).toBe(-8);
    expect(record.learningStatus).toBe("retained");
    expect(record.learningNote).toMatch(/No automatic model update/i);
  });

  it("stores cancellation recovery outcomes for future estimates", () => {
    retainCancellationRecoveryOutcome({
      findingId: "cancel_test",
      organizationId: "org",
      locationId: "loc",
      expectedValueMajor: 192,
      observedValueMajor: 184,
      verifiedValueMajor: 184,
    });
    const got = getInterventionOutcome("cancel_test");
    expect(got?.verifiedValueMajor).toBe(184);
    expect(got?.learningStatus).toBe("retained");
  });

  it("marketing loop demo uses canonical recover money", () => {
    expect(RADR_LOOP_DEMO.stages).toHaveLength(8);
    expect(RADR_LOOP_DEMO.stages[3]!.money?.value).toBe("$192");
    expect(RADR_LOOP_DEMO.stages[6]!.money?.value).toBe("$184");
    expect(RADR_LOOP_DEMO.stages[7]!.learn?.expected).toBe("$192");
    expect(RADR_LOOP_DEMO.stages[7]!.learn?.observed).toBe("$184");
    expect(RADR_LOOP_DEMO.stages[7]!.learn?.variance).toBe("$8");
    expect(HOMEPAGE_DEMO.verified.amount).toBe(184);
    expect(HOMEPAGE_DEMO.findings.recover.potential).toBe(192);
  });

  it("homepage mounts the six-section editorial story", () => {
    const page = readFileSync(
      join(process.cwd(), "app/[locale]/page.tsx"),
      "utf8",
    );
    expect(page).toContain("SectionProblem");
    expect(page).toContain("SectionWatchFlow");
    expect(page).toContain("SectionFindings");
    expect(page).toContain("SectionValueFlow");
    expect(page).toContain("SectionClose");
    expect(page).not.toContain("SectionOperatingModel");
    expect(page).not.toContain("SectionRadrLoop");
    expect(page).not.toContain("SectionProductStory");
  });
});
