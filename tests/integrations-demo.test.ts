import { describe, expect, it } from "vitest";
import { DemoReservationAdapter } from "@/lib/integrations/demo/DemoReservationAdapter";
import { normalizeExternalReservation } from "@/lib/integrations/normalize/reservation";
import { getProvider, INTEGRATION_PROVIDERS } from "@/lib/integrations/registry";

describe("integration registry", () => {
  it("marks only demo + files as available", () => {
    const available = INTEGRATION_PROVIDERS.filter((p) => p.status === "available");
    expect(available.map((p) => p.id).sort()).toEqual([
      "files-csv",
      "radr-demo-reservations",
    ]);
  });

  it("does not claim Toast as available", () => {
    const toast = getProvider("toast");
    expect(toast?.status).toBe("partner_access");
  });
});

describe("DemoReservationAdapter", () => {
  const adapter = new DemoReservationAdapter();
  const ctx = {
    tenantId: "org_demo",
    connectionId: "conn_demo",
  };

  it("syncs synthetic reservations without secrets", async () => {
    const result = await adapter.syncReservations(ctx);
    expect(result.records).toBeGreaterThan(0);
    expect(result.health.status).toBe("HEALTHY");
    const cancelled = result.reservations.find((r) =>
      r.externalId.includes("cancelled"),
    );
    expect(cancelled?.status).toBe("cancelled");
  });

  it("normalizes to RADR reservation model", async () => {
    const { reservations } = await adapter.syncReservations(ctx);
    const radr = normalizeExternalReservation(
      reservations[0]!,
      ctx.connectionId,
      adapter.providerId,
    );
    expect(radr.provenance.sourceProvider).toBe("radr-demo-reservations");
    expect(radr.partySize).toBeGreaterThan(0);
    expect(radr.provenance.externalId).toContain("org_demo");
  });
});
