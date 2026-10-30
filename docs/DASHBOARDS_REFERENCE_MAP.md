# Dashboards Reference Map — Visual Operating View Builder

**Route:** `/app/dashboards`  
**Status:** PASS 1–9 complete · Library + builder + Ask RADR + share/autosave + e2e  



**Visual SSOT:** attached RADR Dashboards mockups (Daylight · sans · pinned hero · template grid)  
**Screenshot:** `tmp/dashboards-pass2-1512x982.png`

## Thesis

Dashboards = **Canva of hospitality operating views** — not a static template gallery.

Library → Builder → Preview → Pin to nav. Core product routes stay canonical.

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Dashboard model + persistence | `lib/product/dashboards.ts` | **KEEP LOGIC** — templates · pin · duplicate · delete · localStorage |
| Layout / grid | `lib/product/dashboardLayout.ts` | **KEEP** — MOVE TO BUILDER (PASS 4–5) |
| Builder shell | `DashboardBuilder.tsx` + CSS | **RECOMPOSE** — later passes |
| Widget modules | `DashboardModule.tsx` / grid | **KEEP** — live canvas widgets |
| Add to dashboard | `AddToDashboardButton.tsx` | **KEEP** — deep-link entry |
| Vertical filter | restaurant vs hotel template IDs | **KEEP** — do not mix |

## Old presentation (RECOMPOSE / REMOVE)

| Old (`app/app/dashboards/page.tsx`) | Disposition |
|-------------------------------------|-------------|
| Plain `rp-dash-lib` text cards | **RECOMPOSE** → `dashboards/engine/*` |
| Underlined Open / Duplicate / Pin links | **REMOVE** → dark-green buttons + secondary |
| No tabs / no search / no role filter | **RECOMPOSE** |
| No mini live previews | **RECOMPOSE** — SVG/HTML previews per template |
| Huge whitespace | **FIX** — composed ~1500px content |

## Canonical Library composition (PASS 2)

1. Header — Dashboards · subtitle · search · role filter · + Create  
2. Tabs — Pinned · My dashboards · Templates · Recently used  
3. Pinned hero — mint wash · mini live preview · Open dashboard  
4. Templates — category pills · sort · rich cards · Open template / Duplicate  

## Component plan

```
components/product/dashboards/engine/
  DashboardsShell.tsx
  DashboardsLibrary.tsx
  DashboardMiniPreview.tsx
  dashboards-engine.css
lib/radr/product/dashboardsProofEngine.ts
```

## Implementation order

1. ~~PASS 1 — this map~~
2. ~~PASS 2 — Library · `tmp/dashboards-pass2-1512x982.png`~~
3. ~~PASS 3 — pin · duplicate · delete · open · template use · nav pins · manage reorder~~  
4. ~~PASS 4 — Builder shell (top bar · autosave · Share · inspector · widget library)~~  
5. ~~PASS 5 — drag / drop / resize · snap · constraints · Auto arrange · drop hint~~  
6. ~~PASS 6 — widget config (viz · scope · period · comparison · display · AI tip)~~  
7. ~~PASS 7 — Ask RADR generation · `tmp/dashboards-pass7-ask-1512x982.png` · `tmp/dashboards-pass7-generated-1512x982.png`~~  
8. ~~PASS 8 — sharing · permissions · autosave · `tmp/dashboards-pass8-share-1512x982.png`~~  
9. ~~PASS 9 — Playwright · `tests/e2e/dashboards-engine.spec.ts` · `tmp/dashboards-pass9-*-1512x982.png`~~  
