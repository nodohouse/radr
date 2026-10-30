# Visual Parity QA — /en → /app

**Pass:** Design inheritance master (editorial instrumentation)  
**Date:** 2026-09-24  
**Preview:** https://prep-r2e78gld4-nodo13.vercel.app  
**Prior preview:** https://prep-jenbgw21r-nodo13.vercel.app  
**Marketing SSOT (unchanged):** https://prep-ten-zeta.vercel.app/en

---

## Global

| Check | Result | Notes |
| --- | --- | --- |
| Shared tokens file | PASS | `radr-brand-tokens.css` |
| Instrument Sans on /app | PASS | next/font + body className |
| Canvas `#F7FAF8` | PASS | |
| Brand green `#00D978` | PASS | signal only |
| Marketing freeze | PASS | no /en redesign |
| “RADR read” / Insight kicker | PASS | removed from `RadrRead` + CSS hide |

---

## Routes

### /en (reference)

| Field | Value |
| --- | --- |
| Marketing principle | Editorial storytelling, warm mineral, statement-first |
| Screenshot | Production /en (CDP 2026-09-24) |
| Remaining | FROZEN — do not change |
| **PASS / FAIL** | **PASS** (SSOT) |

### /app · Overview (Control Center)

| Field | Value |
| --- | --- |
| Marketing principle inherited | Hero statement + asymmetric 8/4 + compression motif |
| Old mismatch | Equal-weight KPI cards; bold nav; Insight kickers |
| New implementation | Editorial brief · ContributionBridge · judgment handoff · pulse rail · quieter tier 2/3 · nav Control/Operate/System |
| Screenshot | `/app` Overview |
| Remaining | Live D-1911 handoff depends on period=Live + needsYou; quiet state OK when within range |
| **PASS / FAIL** | **PASS** (composition); re-verify after deploy |

### /app · Live

| Field | Value |
| --- | --- |
| Marketing principle | Story over time; TIME as protagonist |
| Old mismatch | Monitoring chart / dense chrome |
| New implementation | Operating day hero + timeline grammar (VS3 + operating-day.css) |
| Remaining | Full NOW/NEXT editorial panel polish ongoing |
| **PASS / FAIL** | **PARTIAL** |

### /app · Performance

| Field | Value |
| --- | --- |
| Principle | Editorial financial story |
| Remaining | Hero statement + waterfall before tables |
| **PASS / FAIL** | **PARTIAL** |

### Decision / Verified / Memory / Locations / Intelligence

| Route | Status | Remaining |
| --- | --- | --- |
| Decision Room | PARTIAL | Causal Why Now + Futures viz polish |
| Verified Value | PARTIAL | Proof path visual echo |
| Memory | PARTIAL | Learning curve / narrowing band |
| Locations | PARTIAL | Performance × exposure matrix first |
| Location detail | PARTIAL | Vertical-native flows |
| Intelligence / Menu | PARTIAL | Domain-native viz; no Insight kicker |
| Service Map | PARTIAL | Physical instrument chrome |
| Connections / Data Health | PARTIAL | Quiet system surfaces |
| Settings | PASS | All demo categories clickable |

### Shell

| Field | Value |
| --- | --- |
| Sidebar | Quieter weights; Control / Operate / System groups |
| Context bar | Light org/role/period |
| **PASS / FAIL** | **PASS** after deploy |

---

## Tests

| Test | Result |
| --- | --- |
| Logo removal (same company?) | PASS on Overview when statement + mineral canvas present |
| Grafana / Datadog / Power BI | Overview improved; Live/Performance still watch for gridlines |
| Typography match | PASS (family); body 16px fix in this pass |
| Responsive pocket briefing | PARTIAL — MobileTabBar exists; full recompose backlog |

---

## Release standard

Not complete because “font matches” alone.  
Complete when operators feel: **the marketing site came alive.**

This pass closes: shared SSOT docs · type parity · quieter nav · Overview editorial inheritance · Insight removal · token/CSS inheritance layer.

Next backlog slices: Live NOW/NEXT, Decision causal, Locations matrix, Memory learning curve, full screenshot matrix 1440/1280/430.
