# COPY_QA

**Date:** 2026-09-30 · Wave A6

## Rule

No customer-visible: hover / rail / fixture / mock / TODO / role column / Size · revenue.  
No glued legends (N0114.2%, V2→V3 body dump).

## Fixed / verified

- Role column priority (locations)
- Size · revenue → “Point size scales with revenue”
- Memory V2→V3 as labeled transformation
- Memory forecast envelope: N= nodes separate from %
- MenuPulse: MetricLabel / MetricValue nodes (no `80 sold €1,136 contrib` single string)
- Location strip: Rev↑ Contrib↓ and exposure as Metric nodes
- Estate learning: source ≠ target (Hamburg→Berlin, Düsseldorf→Frankfurt)

## Automated

`tests/customer-copy-hygiene.test.ts` — **PASS** (2026-09-30)
