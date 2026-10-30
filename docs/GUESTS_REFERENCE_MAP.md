# Guests Reference Map — Guest Operating Intelligence

**Route:** `/app/guests`  
**Status:** PASS 1–5 wired · Overview / Floor / Profile / Segments / Feedback live  
**Visual SSOT:** four attached references (Overview / Floor / Profile / Segments)

## Thesis

RADR Guests = **live guest operating intelligence** — not a CRM, loyalty ledger, reservation list, or feedback inbox.

Loop: **KNOW → ANTICIPATE → PERSONALISE → RECOVER → GROW VALUE → VERIFY → REMEMBER**

## Source logic (KEEP)

| Source | Path | Disposition |
|--------|------|-------------|
| Tonight aggregate | `lib/radr/guest/demoTonight.ts` (`DEMO_GUEST_TONIGHT_AGG`) | **KEEP LOGIC** — 118 covers · 42 returning · 31 first · €460 recovery story |
| Guest records | `demoBerlinGuestsTonight()` | **KEEP + EXTEND** — identity, value, booking, preferences, notes |
| Guest types / contract | `lib/radr/guest/types.ts`, `CONTRACT.md` | **KEEP** — explainable tiers · no creepy scoring · role access |
| Access rules | `lib/radr/guest/access.ts` | **KEEP** |
| Floor guest bridge | `lib/radr/guest/floorGuest.ts` | **KEEP** — align table IDs with Operations / Live |
| Brief builder | `lib/radr/guest/brief.ts` | **RECOMPOSE UI** — Brief Team surface |
| Decision link | `DECISION_IDS.guestVoice` / D-7401 | **KEEP** — Open judgment / Take action |
| Berlin floor geometry | Operations / Live floor assets | **REUSE** — Guest Floor overlay only |

## Old presentation (REMOVE / RECOMPOSE)

| Old surface (`VisionGuests.tsx`) | Disposition |
|----------------------------------|-------------|
| Static triptych (segments / feedback / RADR read) | **REPLACE** with Overview REF 01 composition |
| Huge text-only RADR Read block | **MOVE** into Insight hero + chart |
| Flat Feedback list (3 items) | **RECOMPOSE** as Live guest signals + Feedback view |
| 4 KPIs only (no recoverable) | **EXTEND** to 5 KPIs per REF 01 |
| Generic judgment card | **RECOMPOSE** as Prepared Judgment + Compare Impact |
| No floor / profile / segments views | **ADD** as canonical views |
| Long empty vertical stack | **REMOVE** |

## Views → references

| View | URL | Reference | Primary content |
|------|-----|-----------|-----------------|
| Overview | `?view=overview` | REF 01 | KPIs · insight + value window · judgment · segments · signals · high-value · recovery |
| Live Floor | `?view=floor` | REF 02 | Guest-intelligence floor overlay · table inspector · arrivals |
| Segments | `?view=segments` | REF 04 | Segment KPIs · value window · recommendations · themes |
| Feedback | `?view=feedback` | REF 01 signals + themes | Material signals · themes · sentiment |
| Guest Profile | `/app/guests/profile/[id]` | REF 03 | Sofia Meyer flagship · memory · tonight recs · history |

## Data alignment notes

| Spec | Current demo | Action |
|------|--------------|--------|
| Recoverable €460 | Judgment copy only | Surface as 5th KPI + recovery rows |
| Return on books 36% | ~36% from 42/118 | Keep |
| Expected check €52 | Derived from agg | Keep / display €52 |
| Sofia Meyer profile | Sophie Laurent etc. | **ADD** `guest_sofia_meyer` flagship (fictional) |
| Table 12 allergy | Sophie Table 3 shellfish | **ALIGN** Table 12 ↔ allergy signal across Guests / Ops / Live |
| Occasion dining segment | Missing in VisionGuests | **ADD** fifth segment |
| Value window 20:10–20:40 | Text only | **ADD** chart |

## Persona

| Persona | Emphasis |
|---------|----------|
| GM (default) | recovery · high-value · risk · repeat |
| FOH / Service Manager | allergies · waits · occasions · table actions |
| CFO | segment economics · recoverable · retention |

Do **not** force CFO on Guests entry.

## Cross-product links

| From | To |
|------|----|
| Take action / Open judgment | `/app/decisions/{guestVoice}` |
| View floorplan | `/app/guests?view=floor` + `/app/service` / `/app/live` |
| Verified outcome | `/app/value` |
| Memory insights | `/app/memory` |
| Service problem | `/app/service` |

## Implementation order

1. ~~PASS 1 — this map~~
2. PASS 2 — static Overview (REF 01) — **await visual approval**
3. PASS 3 — Guest Floor (REF 02)
4. PASS 4 — Guest Profile (REF 03)
5. PASS 5 — Segments (REF 04)
6. PASS 6 — shared guest state + URL
7. PASS 7 — Decisions / Ops / Live / Value / Memory links
8. PASS 8 — Playwright + visual QA

## Component plan

```
components/product/guests/
  GuestShell.tsx
  GuestOverview.tsx
  GuestFloor.tsx
  GuestSegments.tsx
  GuestFeedback.tsx
  GuestProfile.tsx
  guest.css
  parts/
    GuestMetric.tsx
    GuestInsightHero.tsx
    ValueWindowChart.tsx
    PreparedJudgment.tsx
    SegmentTable.tsx
    GuestSignalRow.tsx
    HighValueTableRow.tsx
    RecoveryOpportunity.tsx
```
