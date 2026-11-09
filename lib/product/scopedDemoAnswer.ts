import type { ButlerResponse } from "@/lib/radr/butler/types";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { recordAttention } from "@/lib/radr/product/roleScope";
import { hotelLivePropertyModel, roomStateLabel } from "@/lib/radr/product/hotelLive";
import { hotelGuestNeeds } from "./hotelGuestNeeds";

/** Grounded, read-only answers over the selected fictional workspace. No provider writes. */
export function scopedDemoAnswer(query: string, records: DecisionRecord[], scope: string, hotel: boolean, locationId: string): ButlerResponse {
  const words = query.toLowerCase();
  const roomQuestion = hotel && /room|arrival|allerg|guest|birthday|housekeep|readiness/.test(words);
  const match = /supplier|invoice|stock|buy/.test(words) ? /supplier|invoice|stock|linen|amenit/i
    : /value|verif|recover|outcome/.test(words) ? /verif|credit|recover|outcome/i
    : roomQuestion ? /room|arrival|readiness|housekeep|linen/i
    : /labor|staff/.test(words) ? /labor|staff|coverage|housekeep/i : null;
  const ranked = [...records].sort((a,b) => Number(recordAttention(b)==="needs_you")-Number(recordAttention(a)==="needs_you"));
  const matched = match ? ranked.filter(r=>match.test(`${r.title} ${r.decisionType} ${r.verifiedValue ? "verified outcome" : ""}`)) : ranked;
  const chosen = (matched.length ? matched : ranked).slice(0,3);
  const primary = chosen[0];
  const metric = primary ? formatPrimaryMetric(primary) : null;
  const reply: ButlerResponse = {
    title: primary ? primary.title : "No matching decision in this scope",
    summary: primary ? `${primary.recommendationHeadline || primary.title}. Review the source evidence before acting.` : `There are no decision records for ${scope} in this selection. Choose another location or inspect Connections.`,
    answer: primary ? primary.contextLine || primary.title : "No result has been borrowed from another property.",
    responseKind: "executive_summary", topic: "attention", toolUsed: "scoped_demo_records",
    ...(metric ? { primaryMetric: { label: metric.caption, value: metric.money, hint: "Expected and verified outcomes remain separate." } } : {}),
    evidence: chosen.map(r=>({label:`${displayDecisionId(r.id)} · ${r.property}`,value:`${r.evidenceRefs.length} evidence items · ${r.confidence.userFacing.toLowerCase()} confidence`})),
    actions: chosen.map(r=>({label:`Review ${displayDecisionId(r.id)}`,href:`/app/decisions/${r.id}`})),
    sources: [{system:"Selected demo decisions",detail:`${scope} · ${records.length} records · fictional operating snapshot`}],
    warnings: [{message:"Read-only demo analysis. Nothing has been sent, booked or changed in an external system.",severity:"info"}],
    followUps: hotel ? ["Which rooms need attention before arrivals?","What guest needs should the team reconfirm?","Which decisions need my attention?"] : ["Which decisions need my attention?","What value has been verified?","Which supplier evidence needs review?"],
  };
  if (roomQuestion && (locationId === "loc_canal_house" || locationId === "all")) {
    const property = hotelLivePropertyModel();
    const guestQuestion = /allerg|guest|birthday|special|request/.test(words);
    const rooms = guestQuestion ? property.rooms.filter(r=>hotelGuestNeeds(r)) : property.rooms.filter(r=>r.arrivalAt && r.state!=="ready" && r.state!=="occupied").slice(0,4);
    reply.title = guestQuestion ? "Reconfirm guest needs before arrival" : "Start with the rooms due next";
    reply.summary = guestQuestion ? "The incoming stay in Room 310 includes a guest-reported shellfish allergy. Reconfirm it with the guest and brief the teams serving food. It is not an acknowledgement of safety clearance." : `${property.ready} of ${property.due} rooms in the arrival wave are ready. ${property.atRisk} are at risk in the illustrative snapshot.`;
    reply.answer = "Open Live to review the room, assigned owner, dependencies and arrival timeline.";
    delete reply.primaryMetric;
    reply.metrics = [{label:"Arrival wave ready",value:`${property.ready} / ${property.due}`},{label:"Arrivals today",value:String(property.arrivalsToday)},{label:"At risk",value:String(property.atRisk),tone:"watch"}];
    reply.evidence = rooms.map(r=>{const needs=hotelGuestNeeds(r);return {label:`Room ${r.number} · ${r.arrivalAt} arrival`,value:guestQuestion && needs ? [...(needs.allergies || []).map(a=>`${a.allergen} · guest-reported`),...(needs.occasions || []),...needs.requests].join(" · ") : `${roomStateLabel(r.state)} · ${r.assigned || "Owner not recorded"} · target ${r.expectedReadyAt || "not recorded"}`};});
    reply.actions = [{label:"Open room readiness and guest details",href:"/app/live?view=floor&floor=3&room=room_310"},...reply.actions.slice(0,2)];
    reply.sources = [{system:"Hotel operating snapshot",detail:`${property.propertyLabel} · ${property.clockLabel} · illustrative rooms and incoming stays`}];
  }
  return reply;
}
