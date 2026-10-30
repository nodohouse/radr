import { describe, expect, it } from "vitest";
import {
  invokeTool,
  listGatewayTools,
  listMcpTools,
  euroTraceForSupplier,
  TOOL_GATEWAY_VERSION,
} from "@/lib/radr/tools";
import { getContributionBridge } from "@/lib/radr/finance/contributionBridge";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

describe("Tool Gateway", () => {
  it("lists read tools and versions envelopes", () => {
    const tools = listGatewayTools();
    expect(tools.some((t) => t.name === "explain_variance")).toBe(true);
    expect(tools.some((t) => t.gated)).toBe(true);
    const pulse = invokeTool("get_group_pulse", { role: "cfo" }, { enforceAuth: false });
    expect(pulse.version).toBe(TOOL_GATEWAY_VERSION);
    expect(pulse.error).toBeNull();
    expect(pulse.data).toBeTruthy();
    const proof = (pulse.data as { systemProof: { requireJudgment: number } })
      .systemProof;
    expect(proof.requireJudgment).toBeGreaterThanOrEqual(0);
  });

  it("explain_variance matches contribution bridge SoT", () => {
    const bridge = getContributionBridge();
    const env = invokeTool("explain_variance", {}, { enforceAuth: false });
    expect(env.error).toBeNull();
    const data = env.data as {
      varianceAmount: number;
      identityOk: boolean;
      conclusion: string;
    };
    expect(data.identityOk).toBe(true);
    expect(data.varianceAmount).toBe(bridge.varianceAmount);
    expect(data.conclusion.toLowerCase()).toContain("revenue");
  });

  it("get_verified_value uses Decision ledger SoT", () => {
    const agg = deriveValueAggregate("cfo");
    const env = invokeTool("get_verified_value", { role: "cfo" }, { enforceAuth: false });
    expect(env.error).toBeNull();
    const data = env.data as { verifiedTotal: number; euroTrace: { verifiedEuro: number } };
    expect(data.verifiedTotal).toBe(agg.verifiedTotal);
    expect(data.euroTrace.verifiedEuro).toBe(273);
  });

  it("get_decision and get_decision_trace return structured objects", () => {
    const dec = invokeTool(
      "get_decision",
      { id: "D-1911" },
      { enforceAuth: false },
    );
    expect(dec.error).toBeNull();
    const d = dec.data as { id: string; displayId: string; recommendation: string | null };
    expect(d.id).toBe(DECISION_IDS.peak);
    expect(d.displayId).toBe("D-1911");

    const trace = invokeTool(
      "get_decision_trace",
      { id: "D-4102" },
      { enforceAuth: false },
    );
    expect(trace.error).toBeNull();
    const t = trace.data as {
      euroTrace: { chain: { step: string }[] };
    };
    expect(t.euroTrace.chain.length).toBeGreaterThanOrEqual(5);
    expect(euroTraceForSupplier()?.verifiedEuro).toBe(273);
  });

  it("write tools are gated", () => {
    const env = invokeTool("approve_decision", { id: "D-1911" }, { enforceAuth: false });
    expect(env.gated).toBe(true);
    expect(env.data).toBeNull();
  });

  it("MCP adapter exposes radr.* read tools only", () => {
    const mcp = listMcpTools();
    expect(mcp.every((t) => t.name.startsWith("radr."))).toBe(true);
    expect(mcp.some((t) => t.name.includes("approve"))).toBe(false);
  });

  it("get_live_service includes join story", () => {
    const env = invokeTool("get_live_service", {}, { enforceAuth: false });
    expect(env.error).toBeNull();
    const join = (env.data as { join: { decision: { displayId: string } } }).join;
    expect(join.decision.displayId).toBe("D-1911");
  });
});
