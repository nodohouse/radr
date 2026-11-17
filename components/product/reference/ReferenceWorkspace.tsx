"use client";

import { usePathname,useSearchParams } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { useDemoOrg } from "../useDemoOrg";
import { resolveCanonicalDecisionId } from "@/lib/radr/decision/aliases";
import { getDecisionRecord,getDecisionStoreSnapshot,subscribeDecisionStore } from "@/lib/radr/decision/store";
import { ReferenceValue,ReferenceMemory,ReferenceHealth,ReferenceIntelligence,ReferenceOperations,ReferenceSupplier } from "./ReferencePages";

import { ControlCenterPremium } from "./ControlCenterPremium";
import { ReferenceDecisions } from "./ReferenceDecisions";
import { useProduct } from "@/lib/product/store";
import { locationInSelection } from "@/lib/radr/product/selectedScope";
import { ScopedSnapshotUnavailable } from "./ScopedSnapshotUnavailable";

export function ReferenceWorkspace({children}:{children:ReactNode}) {
  const path=usePathname();const search=useSearchParams();const {isHotel}=useDemoOrg();
  const { locationScope, comparisonLocationIds } = useProduct();
  useSyncExternalStore(subscribeDecisionStore,getDecisionStoreSnapshot,getDecisionStoreSnapshot);
  const snapshotId = isHotel ? "loc_canal_house" : "loc_berlin_mitte";
  if ((["/app/live", "/app/service", "/app/house"].includes(path) || path === "/app/guests" && !isHotel) &&
    !locationInSelection(snapshotId, locationScope, comparisonLocationIds)) {
    return <ScopedSnapshotUnavailable locationId={snapshotId} />;
  }
  if(path==='/app/data-health')return <ReferenceHealth />;
  // Existing detailed screens remain the destination for filters, records and actions.
  if(search.get('layout')==='detail')return <>{children}</>;
  if(path==='/app'&&!search.get('focus')&&!search.get('view'))return <ControlCenterPremium />;
  if(path==='/app/decisions')return <ReferenceDecisions />;
  if(path==='/app/value'&&!search.get('view')&&!search.get('class'))return <ReferenceValue />;
  if(path==='/app/memory'&&!search.get('view')&&!search.get('learning')&&!search.get('playbook'))return <ReferenceMemory />;
  if(path==='/app/intelligence'&&!search.get('domain'))return <ReferenceIntelligence />;
  if(path==='/app/service'&&!isHotel&&!search.get('view')&&!search.get('table'))return <ReferenceOperations />;
  if(path.startsWith('/app/decisions/')) {
    const id=resolveCanonicalDecisionId(path.split('/').pop()||'');const record=getDecisionRecord(id);
    if(record)return <ReferenceSupplier record={record} />;
  }
  return <>{children}</>;
}
