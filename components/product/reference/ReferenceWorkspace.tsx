"use client";

import { usePathname,useSearchParams } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { useDemoOrg } from "../useDemoOrg";
import { resolveCanonicalDecisionId } from "@/lib/radr/decision/aliases";
import { getDecisionRecord,getDecisionStoreSnapshot,subscribeDecisionStore } from "@/lib/radr/decision/store";
import { ReferenceCenter,ReferenceValue,ReferenceMemory,ReferenceHealth,ReferenceIntelligence,ReferenceLive,ReferenceOperations,ReferenceSupplier } from "./ReferencePages";

export function ReferenceWorkspace({children}:{children:ReactNode}) {
  const path=usePathname();const search=useSearchParams();const {isHotel}=useDemoOrg();
  useSyncExternalStore(subscribeDecisionStore,getDecisionStoreSnapshot,getDecisionStoreSnapshot);
  // Existing detailed screens remain the destination for filters, records and actions.
  if(search.get('layout')==='detail')return <>{children}</>;
  if(path==='/app'&&!search.get('focus')&&!search.get('view'))return <ReferenceCenter />;
  if(path==='/app/value'&&!search.get('view')&&!search.get('class'))return <ReferenceValue />;
  if(path==='/app/memory'&&!search.get('view')&&!search.get('learning')&&!search.get('playbook'))return <ReferenceMemory />;
  if(path==='/app/intelligence'&&!search.get('finding')&&!search.get('domain'))return <ReferenceIntelligence />;
  if(path==='/app/data-health'&&!search.get('source')&&!search.get('decision'))return <ReferenceHealth />;
  if(path==='/app/live'&&!isHotel&&!search.get('zone'))return <ReferenceLive />;
  if(path==='/app/service'&&!isHotel&&!search.get('view')&&!search.get('table'))return <ReferenceOperations />;
  if(path.startsWith('/app/decisions/')) {
    const id=resolveCanonicalDecisionId(path.split('/').pop()||'');const record=getDecisionRecord(id);
    if(record&&/supplier|invoice|contract/i.test(`${record.decisionType} ${record.title}`))return <ReferenceSupplier record={record} />;
  }
  return <>{children}</>;
}
