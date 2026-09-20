"use client";

import { use } from "react";
import { LabCenterCanvas } from "@/components/product/lab/LabCenterCanvas";
import { LabDecisionStub } from "@/components/product/lab/LabDecisionStub";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

/**
 * Decision immersion inside LAB shell.
 * Peak (D-1911) uses the operating model; other IDs use a compact stub.
 */
export default function LabDecisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const key = id.toLowerCase();
  const isPeak =
    key === "d-1911" ||
    key === "peak" ||
    key === DECISION_IDS.peak;

  if (isPeak) return <LabCenterCanvas />;
  return <LabDecisionStub slug={key} />;
}
