import { displayDecisionId } from "@/lib/radr/decision/ids";
import { resolveCanonicalDecisionId } from "@/lib/radr/decision/aliases";
const TITLES: Record<string,string> = { live:"Live",decisions:"Decisions",service:"Operations",operations:"Operations",intelligence:"Intelligence",value:"Value",memory:"Memory","data-health":"Data Health",locations:"Locations",connections:"Connections",settings:"Settings",house:"Back of house",guests:"Guests",dashboards:"Dashboards" };
export function appPageTitle(path: string): string {
  const parts=path.replace(/\/$/,"").split("/").filter(Boolean);
  if(parts.length===1)return "RADR · Control Center";
  if(parts[1]==="decisions"&&parts[2])return `RADR · Decision ${displayDecisionId(resolveCanonicalDecisionId(parts[2]))}`;
  return `RADR · ${TITLES[parts[1]]??"Workspace"}`;
}
