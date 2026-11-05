// Run from the RADR repository: npx tsx scripts/demo-reference-ingestion.ts
// Local synthetic example. No public API, provider credentials or network calls.
import { DemoReservationAdapter } from "@/lib/integrations/demo/DemoReservationAdapter";
import { normalizeExternalReservation } from "@/lib/integrations/normalize/reservation";

async function main() {
  const adapter = new DemoReservationAdapter();
  const context = { tenantId: "org_demo", connectionId: "conn_demo" };
  const { reservations } = await adapter.syncReservations(context);
  const normalized = reservations.map((record) =>
    normalizeExternalReservation(
      record,
      context.connectionId,
      adapter.providerId,
    ),
  );
  console.log(
    JSON.stringify(
      {
        mode: "local-reference",
        records: normalized.length,
        provider: adapter.providerId,
        statuses: normalized.map((record) => record.status),
        provenancePresent: normalized.every((record) =>
          Boolean(record.provenance.sourceConnectionId),
        ),
      },
      null,
      2,
    ),
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
