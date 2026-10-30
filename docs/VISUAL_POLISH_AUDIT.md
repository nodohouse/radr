# Visual Polish Audit — RELEASE COHERENCE 8.5 → 9.5

**Alias:** https://prep-ten-zeta.vercel.app/app?stay=1  
**Pass date:** 2026-09-28  
**Scope:** Coherence only — no new features, no redesign, no downgrades.

## P0 — release blockers

| Item | Status | Evidence |
|------|--------|----------|
| CC ↔ Live ↔ Ledger same counts (3 / 146) | PASS | Berlin Mitte: Command Stage + Live Focus (`?focus=live`) + Ledger all show **3** / **146** · `selectNeedsJudgment` SSOT · nav badges now location-scoped |
| Command Stage signature | PASS | “3 signals need your judgment” · 146 / 141 / 1 / 1 · firstName · CC-only |
| Estate Compare (no infinite Loading) | PASS | Hamburg→Berlin + `xfer_wine_hamburg` · Transfer playbook · Futures · Create test Decision |
| Location AttentionState one source | PASS | Frankfurt / Kreuzberg header = Actionable · `deriveLocationAttention` |
| Location money bridge × 8 | PASS | Gross − deductions (incl. other variable) === contribution |
| Ordinals | PASS | 43rd / 52nd · `formatOrdinal` |
| Raw ISO operator UI | PASS | D-8204 “Decide before 19:25” |
| Policy deep-links D-1911 / D-8204 | PASS | SERVICE CAPACITY · SUPPLIER EMERGENCY ORDER |
| Nav / scope coherence | PASS | Badge copy “signals need your judgment” · badges filter by `locationScope` |

## P1 — polish

| Item | Status | Notes |
|------|--------|-------|
| Service Map | PASS | Table = number + state · Current vs Seat-now labeled |
| Menu images | PASS | Roast Chicken / Delivery Burger distinct · Beef Tartare no longer shares salmon |
| Memory | PASS | Calibration micro-chart · V2→V3 |
| Settings | PASS | Policies + deep-links |
| Live Focus attention in focus density | PASS | Same 3 / 146 line as Command Stage |
| Hotel parity | PASS | Hotel Live Focus uses same hotel needs/handling SSOT as HotelCockpit |

## Live verification (Berlin Mitte)

- Command Stage: 3 signals · 146 evaluated · 141 no action · 1 handling · 1 watching
- Live Focus: identical attention line
- Decision Ledger: Needs judgment **3**
- Mobile Center: “3 signals need your judgment”
- D-1911: +€620 expected incremental

## Invariant

```
mainCenter.counts === liveFocus.counts === decisionLedger.counts
```

Same org · world · role · scope · DemoClock.

**Canonical scope for the release story:** Berlin Mitte.

146 = 141 no action + 1 handling + 1 watching + 3 need judgment.

## Surfaces preserved

D-1911 · D-8204 · Verified Value · Menu Intelligence · BOH · Service Map · Policies · Connections / Data Health · Locations · Decision Ledger
