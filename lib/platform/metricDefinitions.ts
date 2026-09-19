/**
 * Configurable metric definitions - never bury only in code.
 */

export type MetricDefinition = {
  id: string;
  label: string;
  description: string;
  defaultFormula: string;
  configurable: boolean;
};

export const DEFAULT_METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    id: "operating_margin",
    label: "Operating margin",
    description: "Contribution / revenue after agreed cost bases.",
    defaultFormula: "contribution / revenue",
    configurable: true,
  },
  {
    id: "labor_cost_pct",
    label: "Labor cost %",
    description: "Labor cost as share of revenue for the service period.",
    defaultFormula: "labor_cost / revenue",
    configurable: true,
  },
  {
    id: "group_booking_threshold",
    label: "Group booking threshold",
    description: "Party size at or above which a booking is a group.",
    defaultFormula: "party_size >= location.groupBookingThreshold",
    configurable: true,
  },
  {
    id: "late_cancellation_window",
    label: "Late cancellation window",
    description: "Hours before service that mark a cancellation as late.",
    defaultFormula: "hours_before_service <= location.cancellationWindowHours",
    configurable: true,
  },
  {
    id: "occupancy",
    label: "Occupancy",
    description: "Covers seated or forecast vs seat capacity.",
    defaultFormula: "covers / seat_count",
    configurable: true,
  },
];

export function getMetricDefinition(id: string): MetricDefinition | undefined {
  return DEFAULT_METRIC_DEFINITIONS.find((m) => m.id === id);
}
