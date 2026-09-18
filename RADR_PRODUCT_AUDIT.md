# RADR Product Audit

Master quality pass · 2026-08-18

## Scope

Public marketing site + authenticated `/app` Control Center vision product.

Quality bar: CFO / enterprise buyer / VC / senior designer; not “good for an MVP.”

---

## KEEP (do not destroy)

- **△ / Nothing off the RADR** brand system and wordmark (`RadrWordmark`)
- **BUY · LABOR · SELL · RECOVER** territory model
- **Expected vs actual → Δ → impact → control → verify** thesis
- **Honest ingest statuses** LIVE / EARLY ACCESS / PLANNED
- **Control Center command hierarchy** (ON COURSE, margin heading, territory rail, Requires attention): refined, not rebuilt
- Shared product primitives: `SignalCard`, `TerritoryIntel`, `ProductShell`, `CommandPalette`
- Northstar demo catalog coherence (€18,620 FreshCo story)

## REFINE (done this pass)

| Area | Change |
|---|---|
| Demo honesty | `RADR / LIVE` → **`RADR / DEMO`** on product shell, CC, marketing hero/radar/typewriter; territories `… / Demo` |
| Product nav | Command / Signals / Control / System grouping; role label in foot; DEMO environment badge |
| Financial vocab | Shared `lib/product/finance.ts`; Verified Value page aligned to Identified → Actioned → Realized → Verified → Protected |
| Settings security | Removed false LIVE claims for `/app`; points to SECURITY_TODO.md |
| Signals empty | Filter-empty state with clear action |
| Signal detail | Explicit `SIGNAL · ID` header |
| Brand copy | Shorter product explanation; mission no longer duplicates paragraph |
| Hero CTAs | See RADR → signup; How it works |
| Footer social | Hide Follow when no real URLs |
| SiteNav spy | Removed broken `#how` home observer |
| How it works | Full loop Connect → … → Learn (8 stages) with matching visuals |

## REBUILD (still needed)

| Area | Why |
|---|---|
| Homepage density | Hero still has typewriter + feed + long copy; further cull for 5-second CFO clarity |
| Pricing visual system | Still dual CSS language (`prep.css` cream vs dark `radr`) |
| Solutions scanning sequence | Overflow / interactive scan not fully rebuilt |
| Signal detail forensic depth | Needs confidence %, richer evidence UX, non-no-op Assign |
| Data import wizard | Steps exist as mock; not full validate/preview pipeline |
| Auth gate for `/app` | Still public client demo |
| Real RBAC | View-as is cosmetic only |
| Dead marketing components | Orphan files remain (Radar.tsx, Typewriter.tsx, etc.); cleanup pending |

## REMOVE (candidates; not all deleted this pass)

- Unused marketing leftovers under `components/marketing/` (orphan scene helpers)
- Starter `public/next.svg` etc. if still present
- Dual “LIVE” language anywhere it implies customer production data

---

## WHAT WAS WRONG

1. Product chrome said **LIVE** while data was illustrative demo.
2. Settings claimed **server auth / org isolation LIVE** for an ungated client shell.
3. Control Center had been fixed as a command center. Brief asked not to regress to greeting-dashboard; preserved.
4. How page loop omitted Connect / Understand / Learn.
5. Footer showed dead social icons without URLs.
6. Financial stage names drifted between CC ledger and Value page.
7. Nav scroll-spy watched a non-existent `#how` on the homepage.

## WHAT WAS CHANGED

See REFINE table above. Primary files:

- `components/product/ProductNav.tsx`, `ProductShell.tsx`, `ControlCenter.tsx`
- `lib/product/finance.ts`, `SECURITY_TODO.md`
- Territory pages kickers; `settings`, `signals`, `value`, signal detail
- Marketing: `brand.ts`, `HeroProduct.tsx`, `HowPage.tsx`, `SiteNav.tsx`, `SiteFooter.tsx`, `socialLinks.ts`, radar/typewriter DEMO labels
- `app/product.css` demo status chrome

## WHAT STILL NEEDS WORK

1. Full pixel audit at all breakpoints (320→1920)
2. Pricing restyled into `radr` system
3. Homepage section cull (System vs Sees duplication)
4. Gate or permanently brand `/app` as public demo
5. Server-backed data model for signals/controls/evidence
6. Loading skeletons / error.tsx under `app/app/`
7. Accessibility pass (focus rings, table mobile, contrast spot-check)
8. Performance: sticky scroll tax on home/how; CSS consolidation
9. Delete dead components + unused deps
10. Dependency upgrades for `npm audit` findings (Next/postcss/sharp) without reckless force majors

---

## SECURITY STATUS

See **SECURITY_TODO.md**.

Summary: auth product paths are **PARTIAL**; `/app` vision shell is **CLIENT DEMO / NOT ENFORCED**. No fake compliance badges.

## PERFORMANCE STATUS

- **PARTIAL** · reduced-motion hooks exist; hero/how sticky stages still heavy.
- Production build should be re-run after this pass.
- LCP/INP not measured in this session; treat as open.

## ACCESSIBILITY STATUS

- **PARTIAL** · semantic nav, kickers, some ARIA on command palette / stages.
- Focus states and WCAG spot-check incomplete.
- Demo status must not rely on green alone (demo dots use muted color).

## RESPONSIVE STATUS

- Product CSS has breakpoints for rail / attention / ledger.
- Full multi-viewport QA not completed this session.

## KNOWN LIMITATIONS

- `/app` ≠ production multi-tenant product
- Demo numbers are illustrative (Northstar)
- Assign button / some CTAs are incomplete
- Control-from-resolve still FreshCo-centric
- Legal entity fields still “to be published”
- Dual product trees: `/app` vision vs `/home` auth app

## NEXT BACKEND REQUIREMENTS

1. Org-scoped Signal / Control / Evidence / Verification tables
2. Middleware gate for product shell (or explicit public-demo mode)
3. Real file ingest with validation reports
4. Audit event log
5. Server authorization for assign/resolve/control mutations
6. Sync health for connected sources

---

## Journey checklist (manual)

| Step | Status |
|---|---|
| Landing <5s understanding | IMPROVED (copy/DEMO); still dense |
| How it works loop | IMPROVED (8 stages) |
| Pricing visible in nav | YES |
| Sign in | EXISTS |
| Control Center 5s questions | YES (command center kept) |
| Priority → signal → evidence → control → value | PARTIAL (demo store) |

## Brutal bottom line

RADR’s **thesis and command center are strong**. This pass fixed **trust-breaking LIVE/security dishonesty** and tightened shell/nav/how/value vocabulary. It did **not** complete a full redesign of every marketing section, full a11y/perf lab, or backend security for `/app`. Claiming otherwise would itself fail the quality bar.
