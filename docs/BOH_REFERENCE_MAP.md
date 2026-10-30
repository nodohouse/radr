# BOH Reference Map — Kitchen Operating Intelligence

**Route:** `/app/house`  
**Status:** PASS 3–7 wired · Captures / Critical / Prep / Deliveries / Waste live  
**Visual SSOT:** four attached references (Overview / Captures / Critical Action / Prep & Line)

## Thesis

RADR BOH = operating intelligence for the kitchen — not inventory software, not a stock ledger, not a long report.

Loop: OBSERVE → INTERPRET → RECONCILE → PREDICT → DECIDE → ACT → VERIFY → LEARN

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Canonical demo model | `lib/radr/product/houseAttention.ts` | **KEEP LOGIC** — gaps, stock, prep, deliveries, waste, verifications, suppliers, futures, D-8204 |
| Capture simulation | `lib/radr/product/houseCapture.ts` | **KEEP LOGIC** — localStorage inbox, voice/camera/document/manual stubs |
| Decision link | `DECISION_IDS.casterSugar` / D-8204 | **KEEP** — Open Decision → `/app/decisions/...` |
| Temporal invariant | `findTemporalContradictions` | **KEEP** — never unresolved gap + verified for same item |
| Hotel variant | `houseAttentionFor("hotel")` | **KEEP LOGIC** — separate hotel experience; restaurant is default demo |
| Capture confirm/correct | `page.tsx` CaptureTrust | **RECOMPOSE UI** — move into Captures view |
| Stock receive/ack | `page.tsx` stockActs | **RECOMPOSE UI** — Stock / Critical Action |
| Area filters | RESTAURANT_AREAS / HOTEL_AREAS | **MERGE** into Stock / Overview filters |

## Old presentation (REMOVE / RECOMPOSE)

| Old surface (`page.tsx` / `house.css`) | Disposition |
|----------------------------------------|-------------|
| Giant vertical scroll of all sections | **REMOVE** — replace with view tabs |
| Long kicker / quiet paragraphs | **REMOVE DUPLICATE** |
| Expanded-by-default gap panels | **MOVE TO DETAIL** — Critical Stock Action |
| Duplicate evidence dumps | **MERGE** into Captures |
| Route-level duplicate chrome | **REMOVE** — AppShell only |
| Old `rp-house-*` layout | **REPLACE** with Daylight `boh-*` system |
| Document-like standards prose | **REMOVE** |

## Views → references

| View | URL | Reference | Primary content |
|------|-----|-----------|-----------------|
| Overview | `?view=overview` | REF 01 | Status pills · readiness strip · Needs You hero · handling · captures preview · stock table · prep · verified |
| Captures | `?view=captures` | REF 02 | Capture feed · needs review · conflicts · sources |
| Stock | `?view=stock` | REF 01 table + REF 03 | Stock/par table · item deep link |
| Critical Action | `?view=stock&item=caster-sugar` | REF 03 | Futures · image · Open D-8204 |
| Prep & Line | `?view=prep` | REF 04 | Prep hero · forecast chart · deliveries · waste · estate pattern |
| Deliveries | `?view=deliveries` | REF 04 left | Delivery rows + detail |
| Waste | `?view=waste` | REF 04 right | Waste patterns |

## Data alignment notes

| Spec | Current demo data | Action |
|------|-------------------|--------|
| Recommended future = Redistribute Kreuzberg | `topup` marked recommended | **ALIGN** — set `transfer` recommended for REF 03 |
| Capture channels include Document/Manual | voice/camera/note (+ document sim) | **EXTEND** capture types in model |
| Stock burn 0.4 kg/h in copy | `burnPerHour: 0.37` | Keep numeric; display rounded |
| Estate pattern Kreuzberg −42% | In verification / copy | Surface on Overview + Prep |
| Sugar hero image | Missing | **ADD** high-res fictional asset under `/public/house/` |

## Persona

| Persona | Emphasis |
|---------|----------|
| Head Chef / Kitchen Manager (default BOH lens) | readiness · stock · prep · deliveries · actions |
| GM | service risk · guest impact · value · Decision |
| CFO | exposure · waste · procurement · estate pattern |

Do **not** force global persona to CFO on BOH entry. Overview copy defaults to chef language.

## Cross-product links

| From | To |
|------|----|
| Open D-8204 / Open Decision | `/app/decisions/{id}` |
| Verified outcome | `/app/value` |
| Estate pattern | `/app/memory` |
| Service consequence | `/app/service` |
| Spatial kitchen | `/app/live` |

## Implementation order

1. ~~PASS 1 — this map~~
2. PASS 2 — static Overview (REF 01) — **await visual approval**
3. PASS 3 — Captures (REF 02)
4. PASS 4 — Critical Stock Action (REF 03)
5. PASS 5 — Prep & Line (REF 04)
6. PASS 6 — shared interactions + URL state
7. PASS 7 — Decisions / Value / Memory / Operations links
8. PASS 8 — Playwright + visual QA

## Component plan

```
components/product/house/
  BohShell.tsx
  BohOverview.tsx
  BohCaptures.tsx
  BohStock.tsx
  BohCriticalAction.tsx
  BohPrep.tsx
  BohDeliveries.tsx
  BohWaste.tsx
  boh.css
  parts/
    BohStatusPills.tsx
    BohReadinessStrip.tsx
    BohCriticalHero.tsx
    BohHandlingCard.tsx
    BohCaptureRow.tsx
    BohStockTable.tsx
    BohPrepCard.tsx
    BohVerifiedOutcome.tsx
    BohNav.tsx
```
