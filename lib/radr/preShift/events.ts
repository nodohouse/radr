/**
 * Local events → operating impact (explainable, not magic).
 */

export type LocalEventImpact = {
  id: string;
  kind: string;
  title: string;
  distanceLabel: string;
  attendance: number;
  doors: string;
  endsApprox: string;
  preEventWalkIns: number;
  postEventDemand: number;
  revenueOpportunity: number;
  recommendation: string;
};

export function demoBerlinConcertImpact(): LocalEventImpact {
  return {
    id: "evt_ber_concert_0819",
    kind: "Concert",
    title: "Arena concert",
    distanceLabel: "8 min walk",
    attendance: 18_000,
    doors: "19:00",
    endsApprox: "22:30",
    preEventWalkIns: 18,
    postEventDemand: 27,
    revenueOpportunity: 1860,
    recommendation: "Hold kitchen capacity until 23:00.",
  };
}
