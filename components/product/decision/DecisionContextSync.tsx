"use client";

/**
 * On Decision deep link: align demo org + Product store scope with the Record.
 * Never forces CFO / All locations.
 */

import { useEffect, useRef } from "react";
import { useProduct } from "@/lib/product/store";
import type { LocationScope } from "@/lib/product/demo/dashboard";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import {
  applyDecisionContextFromId,
  resolveDecisionContext,
} from "@/lib/product/radrContext/resolveEntityContext";
import type { DecisionRecord } from "@/lib/radr/decision/record";

export function DecisionContextSync({
  decisionId,
  record,
}: {
  decisionId: string;
  record?: DecisionRecord | null;
}) {
  const { locationScope, setLocationScope, contextReady } = useProduct();
  const { session } = useDemoOrg();
  const applied = useRef<string | null>(null);

  useEffect(() => {
    if (!contextReady || !decisionId) return;
    if (applied.current === decisionId) return;

    applyDecisionContextFromId(decisionId);
    const resolved = resolveDecisionContext(decisionId, record);
    if (!resolved) return;

    applied.current = decisionId;

    if (
      resolved.scopeId !== "all" &&
      locationScope !== resolved.scopeId
    ) {
      setLocationScope(resolved.scopeId as LocationScope);
    }
  }, [
    contextReady,
    decisionId,
    record,
    locationScope,
    setLocationScope,
    session.vertical,
  ]);

  return null;
}
