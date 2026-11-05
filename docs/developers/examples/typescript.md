# Runnable TypeScript reference

From the RADR repository with dependencies installed:

```sh
npx tsx scripts/demo-reference-ingestion.ts
```

The source is `scripts/demo-reference-ingestion.ts`. It uses the implemented local `DemoReservationAdapter` and `normalizeExternalReservation`; the public quickstart renders that source directly. It produces two synthetic normalized reservations and reports provenance presence. It does not contact a provider or persist a Decision.

The public `/v1` API and typed `RADR` client shown elsewhere are interface proposals. No public client package or API key issuance is documented. `https://api.example.invalid` is deliberately non-routable. Never put credentials in browser code or `NEXT_PUBLIC_*`.
