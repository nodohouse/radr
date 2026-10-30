# RELEASE_BASELINE

**Captured:** 2026-10-05 · Final launch pass Phase 0  
**Live reference:** https://prep-ten-zeta.vercel.app/app?stay=1  
**Design source:** https://prep-ten-zeta.vercel.app/en  

## Artifact paths

| Pack | Path |
|------|------|
| Launch freeze screenshots + manifest | `docs/baselines/2026-10-05/` |
| Capture harness | `tests/e2e/launch-baseline-capture.spec.ts` |
| Visual polish pack (secondary) | `tmp/visual-baselines/` via `tests/e2e/visual-polish-baselines.spec.ts` |

Re-capture:

```bash
PRODUCT_QA_BASE_URL=https://prep-ten-zeta.vercel.app \
  npx playwright test tests/e2e/launch-baseline-capture.spec.ts --project=desktop-1440
```

## No-regression contract

These surfaces are APPROVED. Fixes must not downgrade them.

| Surface | Route | Guard |
|---------|-------|-------|
| Control Center compression | `/app` | Disposition totals must reconcile; keep hierarchy |
| Global operating header | `/app` | Header = CC brief = Needs judgment = Value verified |
| 8-location portfolio | `/app/locations` | Group = sum of locations |
| Location money bridges | `/app/locations/[id]` | Contribution bridge intact |
| Menu Intelligence | `/app/intelligence/menu` | SELL × MARGIN × CAPACITY × INVENTORY |
| Decision → Futures → Action | `/app/decisions/[id]` | Domain-correct Futures |
| Verified Value | `/app/value` | TRACE THIS EURO · honest miss · mode sums |
| Operating Memory | `/app/memory` | Playbook V4; envelope 14.2%→5.4% |
| Workforce Decision | `/app/decisions/dec_labor_berlin` | D-1920 peer · LEARNED |
| Hotel readiness | `/app/decisions/dec_hotel_readiness_canal` | D-HK-1402 · HK policy deep-link |
| Estate compare | `/app/compare` | Transfer brief resolves · never infinite Loading |
| Data Health estate | `/app/data-health` | Group coverage |
| Back of House | `/app/house` | Standards vs capture; not stock ledger |

## Screenshot baseline routes (Phase 0)

- `/app?stay=1` — Control Center
- `/app/decisions` — Ledger
- `/app/decisions/dec_peak_berlin` — D-1911
- `/app/decisions/dec_caster_sugar_berlin` — D-8204
- `/app/decisions/dec_supplier_berlin` — D-4102 (id may alias)
- `/app/decisions/dec_hotel_readiness_canal` — D-HK-1402
- `/app/value` · `/app/house` · `/app/service`
- `/app/locations` · `/app/locations/loc_berlin_mitte`
- `/app/intelligence` · `/app/intelligence/menu`
- `/app/memory` · `/app/connections` · `/app/data-health`
- `/app/settings` · `/app/dashboards`
- Hotel enter → Control Center (`cc-hotel@1440.png`)

## Interaction smoke (must stay green)

- Needs You open → Futures → Approve path
- Learn from estate → Compare test resolves (no infinite Loading)
- Metric Why → Intelligence Explorer depth
- Menu Pulse scroll to item 5
- History calendar month/year + prev/next
- Role GM / COO / CFO · Restaurants / Hotels
- Legacy `/app/findings` · `/app/signals` · `/app/controls` → Decision Ledger redirects

## Compression invariant

```
evaluated = no_action + watching + handling + need_judgment (+ verifying if shown)
```

Never display an unreconciled executive total.

## Vocabulary (customer)

SIGNAL · WATCH · DECISION · ACTION · OUTCOME · VERIFIED · MEMORY  

Do not surface Findings / Signals / Controls as peer chrome objects.
