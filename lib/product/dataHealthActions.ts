import {DH_CAPS,DH_SCORE_WEIGHTS,type EvidenceSource} from "@/lib/radr/product/dataHealthProofEngine";
export function sourceImprovement(source:EvidenceSource){
 const checks=[
  {id:"freshness",label:"Freshness",score:source.freshnessScore,weight:DH_SCORE_WEIGHTS.freshness,fix:`Check credentials and source availability; refresh ${source.name}.`,verify:`A successful source update within the ${source.freshnessSla} freshness SLA.`},
  {id:"completeness",label:"Completeness",score:source.completenessScore,weight:DH_SCORE_WEIGHTS.completeness,fix:`Reconcile expected and received ${source.datasets.join(", ")} records; backfill missing records.`,verify:"Record counts and required fields reconcile against the source system."},
  {id:"consistency",label:"Consistency",score:source.conflictScore,weight:DH_SCORE_WEIGHTS.conflicts,fix:source.conflict?`Resolve ${source.conflict}; check identifiers, timestamps and mappings.`:"Audit identifiers, timestamps and source mappings.",verify:"Conflicting records are reconciled and the next validation check passes."},
  {id:"coverage",label:"Coverage",score:source.coverageScore,weight:DH_SCORE_WEIGHTS.coverage,fix:"Map the missing locations and verify that their datasets are included.",verify:`All ${source.locationTotal} locations in this source cohort supply expected data.`},
 ];
 let score=checks.reduce((s,c)=>s+c.score*c.weight,0);if(source.conflictCritical)score=Math.min(score,DH_CAPS.criticalConflict);if(source.status==="STALE"&&source.required)score=Math.min(score,DH_CAPS.staleRequired);
 return {checks,calculatedScore:Math.round(score),gaps:checks.filter(c=>c.score<95).sort((a,b)=>(100-b.score)*b.weight-(100-a.score)*a.weight),owner:source.domain==="Accounting"?"Finance / integration owner":source.domain==="Delivery"?"Delivery operations / integration owner":"Source / integration owner"};
}
