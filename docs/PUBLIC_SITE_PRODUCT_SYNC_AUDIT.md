# Public Website → Product Reality Sync Audit

**Date:** 2026-10-21  
**Mode:** Copy / product truth only. **Visual design FROZEN.**  
**Allowed under marketing freeze:** factual corrections when product capability made public claims inaccurate (`docs/MARKETING_SITE_FREEZE.md`).

Product SSOT: `lib/radr/demo/estateRegistry.ts` · `docs/GLOBAL_ESTATE_FINAL_QA.md` · `docs/PRODUCT_REALITY_AUDIT.md`  
Public copy SSOT: `lib/marketing/publicCanon.ts`

---

## Executive verdict (post-sync)

| Check | Status |
|-------|--------|
| Global NYC heroes (Soho · NY / Mercer House · NY) | **SYNCED** |
| Recovery = wedge, not whole product | **SYNCED** — pricing + Platform close + hero |
| Decisions ≠ dashboards | **CORRECT** |
| Expected ≠ Verified | **CORRECT** |
| Live represented | **SYNCED** — Platform hero + nav surface |
| Autonomy ladder 0–5 | **SYNCED** — `GovernanceButlerStrip` + publicCanon |
| Data Health | **SYNCED** — Trust principles + nav Evidence & Data Health |
| Europe-first leakage | **CLEARED** on EN public surfaces (Amsterdam remains as one EU site in group demo) |
| Restaurant / Hotel equal weight | **SYNCED** — Company taxonomy |
| Currency coherence | **SYNCED** — public EN demos USD for NYC heroes |

---

## Canonical targets (locked)

| Role | Public canon |
|------|----------------|
| Restaurant hero | **Soho · New York** · Dinner · D-1911 · **USD** |
| Hotel hero | **Mercer House · New York** · Check-in wave · **USD** |
| Supplier proof | D-4102 · Soho · New York · **$273** verified |
| Group reporting | Explicit **GROUP REPORTING · USD** when portfolio |
| Public loop | OBSERVE → UNDERSTAND → DECIDE → ACT → VERIFY → LEARN |
| Autonomy | L0 Observe · L1 Explain · L2 Prepare · L3 Recommend/Approve · L4 Execute within policy · L5 Execute + Verify within policy |
| Progression | Recover → Prevent → Optimize → Governed execution |

---

## Page inventory (after sync)

### Homepage
Hero visual frozen · support lines updated · Decision film / Recovery / RH / Progression / Governance / Pulse use NYC + USD + publicCanon.

### Platform
Loop Observe→Learn · Live + Data Health in hero copy · Recovery wedge clarified · Futures D-1911 USD · Value filters global (NY / London / Tokyo / Dubai / Singapore).

### Where Value Leaks / Industries
Global city mix · USD on EN.

### Pricing
“Recovery is where customers can start. It is not where RADR ends.”

### Company
Supported now: restaurants & hotels (groups). Architecture supports: apartments, resorts, bars, other. Founder story kept. Systems of record line kept.

### Trust / Security
Data Health → confidence → allowed action · human override · D-4102 Soho · USD miss story.

### Nav / CTAs
Governed execution (not Autopilot label) · Live surface · See RADR in action → `/signup?intent=demo&next=/app/enter` · no stale Vercel URLs.

---

## Implementation log

1. ~~Audit (this doc)~~  
2. ~~`lib/marketing/publicCanon.ts`~~  
3. ~~Homepage spine + EN locales + pulse~~  
4. ~~Platform / Futures / Value / How~~  
5. ~~Value Leaks + Industries~~  
6. ~~Pricing / Company / Security~~  
7. ~~Grep sweep Berlin Mitte / Canal / Autopilot / € on EN public~~  
8. ~~Cross-page consistency QA~~  

**Out of scope this pass:** non-EN locale bulk remaps · visual redesign · screenshot automation harness · renaming internal IDs (`loc_berlin_mitte`, `dec_peak_berlin`, `buildBerlinOperatingMemory`).

---

## Definition of Done

- [x] Website looks the same visually (copy-only; no layout/art-direction changes)
- [x] Soho · New York + Mercer House · New York are public heroes
- [x] No Europe-first default demo story on EN public
- [x] D-1911 / D-4102 public currency coherent (USD at NYC)
- [x] Expected ≠ Verified preserved
- [x] Recovery remains wedge; not whole product
- [x] Live + Data Health represented in existing copy slots
- [x] Autonomy 0–5 / governed execution
- [x] Autopilot reduced on public EN surfaces
- [x] Hotel-native / Restaurant-native language respected in hero stories
- [x] CTAs valid
- [x] Website and `/app/enter` tell the same company story (NYC / USD / Decision loop)
