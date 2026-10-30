# Memory Reference Map — Self-Improving Operating Memory

**Route:** `/app/memory`  
**Status:** PASS 1–9 complete · Overview + Playbooks + Learnings + DNA + Year · Playwright `tests/e2e/memory-engine.spec.ts`  
**Visual SSOT:** attached Operating Memory mockups (hero + What Changed + Learnings + DNA)

## Thesis

Memory converts Decisions + Verified outcomes + Misses into Learnings → Playbooks → Operating DNA → better future Decisions.

Not: notes archive · chat history · Finding dump · AI brain aesthetic.

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Calibration series | `CalibrationChart.tsx` · `CALIBRATION_SERIES` | **KEEP** — 14.2% → 5.4% · N=24 |
| MemoryService | `lib/radr/product/services.ts` | **KEEP** — scoped learnings from Decision.lesson |
| Peak / playbook | `CANON_PEAK` · peak demo · D-1911 | **KEEP** — V4 Friday peak rules |
| Value miss → learning | `valueMiss.ts` D-4410 | **KEEP** — miss-derived learning |
| Year on RADR | `YearOnRadr.tsx` | **MOVE TO DETAIL** — Year view (PASS 7) |
| OperatingMemory builder | `operatingMemory.ts` | **KEEP LOGIC** — wire later; Overview uses deterministic demo SSOT |
| Location lessons | `locationMemory.ts` | **KEEP** — DNA / location scope later |

## Old presentation (REMOVE / RECOMPOSE)

| Old (`app/app/memory/page.tsx`) | Disposition |
|--------------------------------|-------------|
| Monolith lenses + pale-green blocks | **RECOMPOSE** — Daylight Memory shell |
| Repeated “Berlin Mitte” giant headings | **REMOVE DUPLICATE** |
| Inline DNA / playbook forks | **RECOMPOSE** into engine model |
| Parallel lab Memory | **LEAVE** — do not replace product with lab |

## Canonical Overview demo

| | |
|--|--|
| Forecast error | **14.2% → 5.4%** |
| Improvement | **62%** ((14.2−5.4)/14.2) |
| Sample | **24 comparable Friday-peak services** |
| Playbook | **V4 LIVE** (from V3) |
| Before / After accuracy impact | **11.8% → 5.4%** (−6.4pp) |

## Component plan

```
components/product/memory/engine/
  MemoryShell.tsx
  MemoryOverview.tsx
  MemoryCalChart.tsx
  memory-engine.css
lib/radr/product/memoryProofEngine.ts
```

## Implementation order

1. ~~PASS 1 — this map~~
2. ~~PASS 2 — Overview · `tmp/memory-pass2-1512x982.png`~~
3. ~~PASS 3–9 — chart/period · learnings evidence · playbooks · DNA · Year · cross-links · Playwright~~
