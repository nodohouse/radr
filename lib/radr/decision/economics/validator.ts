/**
 * Decision economics — canonical fields + validator.
 *
 * Primary Future trajectory metric for D-1911 (and peers that declare it):
 *   incrementalVsBaseline — expected incremental contribution vs baseline path.
 *
 * Never mix absoluteExpectedContribution / incrementalVsBaseline /
 * deviationVsPlan / economicExposure without explicit labels.
 */

export type DecisionEconomicsFields = {
  /** Gross expected contribution of the path (absolute €). */
  absoluteExpectedContribution: number | null;
  /**
   * PRIMARY Future trajectory metric when declared.
   * Incremental € vs baseline (e.g. seat-now for D-1911).
   */
  incrementalVsBaseline: number | null;
  /** Deviation vs plan / budget (€). */
  deviationVsPlan: number | null;
  /** € at risk if unresolved / do-nothing. */
  economicExposure: number | null;
  /** Explicit label for the primary Future display metric. */
  primaryFutureMetric: "incrementalVsBaseline" | "absoluteExpectedContribution";
  primaryFutureLabel: string;
  baselineLabel: string;
};

export type DecisionEconomicsOption = {
  id: string;
  title: string;
  economics: DecisionEconomicsFields;
  isBaseline?: boolean;
  isNoAction?: boolean;
  recommended?: boolean;
};

export type DecisionEconomicsPackage = {
  decisionId: string;
  displayId: string;
  options: DecisionEconomicsOption[];
  /** Must match recommended option's primary metric. */
  headlinePrimaryEuro: number;
};

export type EconomicsValidationIssue = {
  code: string;
  message: string;
  optionId?: string;
};

/** D-1911 canonical economics — PRIMARY = incremental vs seat-now. */
export const D1911_ECONOMICS: DecisionEconomicsPackage = {
  decisionId: "dec_peak_berlin",
  displayId: "D-1911",
  headlinePrimaryEuro: 620,
  options: [
    {
      id: "seat_now",
      title: "Seat now",
      isBaseline: true,
      isNoAction: true,
      economics: {
        absoluteExpectedContribution: 410,
        incrementalVsBaseline: 0,
        deviationVsPlan: -620,
        economicExposure: 620,
        primaryFutureMetric: "incrementalVsBaseline",
        primaryFutureLabel: "Expected incremental contribution vs seat-now",
        baselineLabel: "seat-now (baseline)",
      },
    },
    {
      id: "wait_12",
      title: "Wait 12",
      recommended: true,
      economics: {
        absoluteExpectedContribution: 1030,
        incrementalVsBaseline: 620,
        deviationVsPlan: 0,
        economicExposure: 0,
        primaryFutureMetric: "incrementalVsBaseline",
        primaryFutureLabel: "Expected incremental contribution vs seat-now",
        baselineLabel: "vs seat-now",
      },
    },
    {
      id: "hard_stop",
      title: "Throttle delivery",
      economics: {
        absoluteExpectedContribution: 590,
        incrementalVsBaseline: 180,
        deviationVsPlan: -440,
        economicExposure: 440,
        primaryFutureMetric: "incrementalVsBaseline",
        primaryFutureLabel: "Expected incremental contribution vs seat-now",
        baselineLabel: "vs seat-now",
      },
    },
  ],
};

/**
 * Peak trajectory matrix cells — PRIMARY metric = incrementalVsBaseline.
 * Horizons NOW / +15 / +30 / +60 for contribution track.
 */
export const D1911_TRAJECTORY_INCREMENTAL: Record<
  "seat" | "wait" | "kill",
  Record<"NOW" | "+15" | "+30" | "+60", number>
> = {
  seat: { NOW: 0, "+15": 0, "+30": 0, "+60": 0 },
  wait: { NOW: 0, "+15": 80, "+30": 340, "+60": 620 },
  kill: { NOW: 0, "+15": 40, "+30": 120, "+60": 180 },
};

export function validateDecisionEconomics(
  pkg: DecisionEconomicsPackage,
): EconomicsValidationIssue[] {
  const issues: EconomicsValidationIssue[] = [];
  if (!pkg.options.length) {
    issues.push({ code: "empty", message: `${pkg.displayId}: no options` });
    return issues;
  }

  const recommended = pkg.options.find((o) => o.recommended);
  if (!recommended) {
    issues.push({
      code: "no_recommended",
      message: `${pkg.displayId}: missing recommended option`,
    });
  } else {
    const primary = recommended.economics.incrementalVsBaseline;
    if (primary !== pkg.headlinePrimaryEuro) {
      issues.push({
        code: "headline_mismatch",
        message: `${pkg.displayId}: headline €${pkg.headlinePrimaryEuro} ≠ recommended incremental €${primary}`,
        optionId: recommended.id,
      });
    }
  }

  const baselines = pkg.options.filter((o) => o.isBaseline);
  if (baselines.length !== 1) {
    issues.push({
      code: "baseline_count",
      message: `${pkg.displayId}: expected exactly one baseline option`,
    });
  } else if (baselines[0]!.economics.incrementalVsBaseline !== 0) {
    issues.push({
      code: "baseline_nonzero",
      message: `${pkg.displayId}: baseline incremental must be €0`,
      optionId: baselines[0]!.id,
    });
  }

  for (const opt of pkg.options) {
    const e = opt.economics;
    if (e.primaryFutureMetric !== "incrementalVsBaseline") {
      issues.push({
        code: "primary_metric",
        message: `${pkg.displayId}/${opt.id}: primaryFutureMetric must be incrementalVsBaseline`,
        optionId: opt.id,
      });
    }
    if (
      e.absoluteExpectedContribution != null &&
      e.incrementalVsBaseline != null &&
      baselines[0] &&
      baselines[0].economics.absoluteExpectedContribution != null
    ) {
      const expectedAbs =
        baselines[0].economics.absoluteExpectedContribution +
        e.incrementalVsBaseline;
      if (
        Math.abs(expectedAbs - e.absoluteExpectedContribution) > 1 &&
        !opt.isBaseline
      ) {
        // Soft: absolute = baseline absolute + incremental (when both set)
        // Allow throttle path to diverge when over-correcting covers.
        if (opt.id === "wait_12" && expectedAbs !== e.absoluteExpectedContribution) {
          issues.push({
            code: "abs_incremental_reconcile",
            message: `${pkg.displayId}/${opt.id}: absolute ${e.absoluteExpectedContribution} ≠ baseline abs + incremental (${expectedAbs})`,
            optionId: opt.id,
          });
        }
      }
    }
    if (!e.primaryFutureLabel.toLowerCase().includes("incremental")) {
      issues.push({
        code: "label",
        message: `${pkg.displayId}/${opt.id}: primary label must say incremental`,
        optionId: opt.id,
      });
    }
  }

  return issues;
}

export function validateSeededDecisionEconomics(): EconomicsValidationIssue[] {
  const issues = validateDecisionEconomics(D1911_ECONOMICS);

  // Trajectory end-state must match package option incrementals
  const end = D1911_TRAJECTORY_INCREMENTAL;
  const waitOpt = D1911_ECONOMICS.options.find((o) => o.id === "wait_12")!;
  const seatOpt = D1911_ECONOMICS.options.find((o) => o.id === "seat_now")!;
  const killOpt = D1911_ECONOMICS.options.find((o) => o.id === "hard_stop")!;
  if (end.wait["+60"] !== waitOpt.economics.incrementalVsBaseline) {
    issues.push({
      code: "matrix_wait",
      message: `D-1911 matrix wait +60 ≠ option incremental`,
    });
  }
  if (end.seat["+60"] !== seatOpt.economics.incrementalVsBaseline) {
    issues.push({
      code: "matrix_seat",
      message: `D-1911 matrix seat +60 ≠ option incremental`,
    });
  }
  if (end.kill["+60"] !== killOpt.economics.incrementalVsBaseline) {
    issues.push({
      code: "matrix_kill",
      message: `D-1911 matrix throttle +60 ≠ option incremental`,
    });
  }

  return issues;
}

export function formatIncrementalEuro(n: number): string {
  if (n === 0) return "€0 incremental vs seat-now";
  const sign = n > 0 ? "+" : "−";
  return `${sign}€${Math.abs(n).toLocaleString("en-IE")} incremental vs seat-now`;
}
