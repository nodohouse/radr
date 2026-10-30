import type { DecisionRecord } from "@/lib/radr/decision/record";
import { attentionBandOf } from "@/lib/radr/decision/lifecycle";
import { buildDataHealthOverview } from "./dataHealthProofEngine";

/** Existing source dependencies constrain active recommendations, never sealed outcomes. */
export function applyDecisionEvidenceHealth(record: DecisionRecord): DecisionRecord {
  const band=record.attentionOverride??attentionBandOf(record.status);
  if(band==="verified"||band==="learned")return record;
  const affected=buildDataHealthOverview().sources.filter(source=>source.status!=="HEALTHY"&&source.affectedDecisions.some(decision=>decision.id===record.id));
  if(!affected.length)return record;
  const stale=affected.some(source=>["STALE","ERROR","DISCONNECTED"].includes(source.status));
  const ceiling=stale?"LOW":"MEDIUM";
  const rank={LOW:0,MEDIUM:1,HIGH:2};
  const cap=(value:"LOW"|"MEDIUM"|"HIGH")=>rank[value]>rank[ceiling]?ceiling:value;
  const detail=`Evidence health: ${affected.map(source=>`${source.name} ${source.status.toLowerCase()}`).join(", ")}. ${stale?"Prepare only until source evidence is refreshed.":"Human approval required; automatic execution is unavailable."}`;
  return {...record,confidence:{...record.confidence,data:cap(record.confidence.data),dataFreshness:record.confidence.dataFreshness?cap(record.confidence.dataFreshness):undefined,evidenceCoverage:record.confidence.evidenceCoverage?cap(record.confidence.evidenceCoverage):undefined,decision:cap(record.confidence.decision),userFacing:cap(record.confidence.userFacing),explanation:record.confidence.explanation.includes("Evidence health:")?record.confidence.explanation:`${record.confidence.explanation} ${detail}`},autonomy:{...record.autonomy,level:Math.min(record.autonomy.level,stale?2:3) as DecisionRecord["autonomy"]["level"],reason:detail}};
}
