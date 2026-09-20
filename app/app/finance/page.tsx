"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProduct } from "@/lib/product/store";
import {
  canAccessFinanceLayer,
  composeBerlinFinanceOperatingBrief,
} from "@/lib/radr/finance";
import {
  canAccessChannelEconomics,
  composeBerlinChannelEconomics,
} from "@/lib/radr/channels";
import { FinanceOperatingLayer } from "@/components/product/finance/FinanceOperatingLayer";
import { ChannelEconomicsLayer } from "@/components/product/channels/ChannelEconomicsLayer";
import { PageHeader } from "@/components/product/PageHeader";
import { StatusCalm } from "@/components/product/StatusCalm";
import { isLiveShiftEnabled, liveShiftMode } from "@/lib/radr/live";
import { useDemoLiveShift } from "@/components/product/live/useDemoLiveShift";
import { getRadrEnvironment, isSyntheticData } from "@/lib/radr/env";

/**
 * Financial Operating Layer + Channel Economics.
 * Finance roles see both; GM sees channel economics for floor decisions.
 */
export default function FinancePage() {
  const { roleView } = useProduct();
  const synthetic = isSyntheticData(getRadrEnvironment());
  const liveOn = isLiveShiftEnabled();
  const liveMode = liveShiftMode();
  const { state: liveState } = useDemoLiveShift(
    liveOn && liveMode === "illustrative" && synthetic,
  );

  const financeState = useMemo(
    () => composeBerlinFinanceOperatingBrief(liveState?.netSales),
    [liveState?.netSales],
  );
  const channelState = useMemo(
    () => composeBerlinChannelEconomics(liveState?.netSales),
    [liveState?.netSales],
  );

  const financeOk = canAccessFinanceLayer(roleView);
  const channelsOk = canAccessChannelEconomics(roleView);

  if (!financeOk && !channelsOk) {
    return (
      <div className="rp-attention">
        <PageHeader
          title="Finance"
          sub="Financial operating layer for CFO, finance, owner, COO, and GM channel view."
        />
        <StatusCalm
          message="This surface is for finance and operating leadership."
          detail="Switch Viewing as to CFO, Finance, Owner, COO, or GM."
        />
        <p className="rp-fol-gate-links">
          <Link href="/app">Control Center</Link>
          <Link href="/app/value">Verified Value</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rp-attention rp-fol-page">
      <PageHeader
        title={financeOk ? "Finance" : "Channel economics"}
        sub={
          financeOk
            ? "Live contribution, channel quality, and reconciliation - before the books close."
            : "Which channel creates value tonight - revenue quality for the floor."
        }
      />
      {financeOk ? <FinanceOperatingLayer state={financeState} /> : null}
      {channelsOk ? (
        <ChannelEconomicsLayer state={channelState} roleView={roleView} />
      ) : null}
    </div>
  );
}
