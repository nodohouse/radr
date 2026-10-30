# RESTORE_AUDIT

**Date:** 2026-10-02  
**Canonical:** https://prep-ten-zeta.vercel.app/app?stay=1  
**Compared against:** pre–aesthetic-reset `/app` shell (GlobalOperatingHeader full strip + Command Stage greeting + dense CC cards)

## Method

Inspected current `GlobalOperatingHeader`, `CcCockpit`, `HumanHandoff`, and `aesthetic-reset.css` against the capabilities listed in the product preservation contract. Classified each change as **essential restore**, **secondary relocate**, **true duplicate**, or **legitimately obsolete**.

## Header / chrome

| Element | Previous | Current | Class | Action |
|---------|----------|---------|-------|--------|
| RADR logo | Header left | Present | essential | Keep |
| Primary nav (Center…Locations) | Sidebar rail | Present in rail | essential | Keep rail as canonical desktop nav (do not re-duplicate into header) |
| Control Center H1 title | Header | Hidden on `/app` (sr-only) | duplicate of nav | Keep removed from Level 1 |
| Scope selector | Header (Scope + label) | Compact scope button | essential | Keep + ensure label accessible |
| Role selector | Always visible | Only when synthetic demo | **essential missing** | **Restore always** |
| Period switcher | Always in header | Hidden on Control Center | **essential missing on CC** | **Restore compact on CC** |
| Restaurant / Hotel switch | DemoOrgSwitcher | Present | essential | Keep |
| Butler | Header | Present | essential | Keep |
| User / persona | Name text | Avatar initial | secondary relocate | Keep avatar; name in title |
| LIVE clock | Strip | Present | essential | Keep |
| Signals count | Strip | Present | essential | Keep |
| Handling / Watching | Strip mid | Present | essential | Keep |
| 146 evaluated / 141 cleared | Persistent strip | Behind `···` tray | secondary relocate | Keep in tray; rename control to **Status details** |
| Verified € | Strip | Present | essential | Keep |
| Green radar glyph on signals | Strip | Removed | obsolete chrome | Keep removed |

## Control Center body

| Element | Previous | Current | Class | Action |
|---------|----------|---------|-------|--------|
| “Good morning, Elena” greeting | Command stage / eyebrow | Removed | duplicate of persona | Do not restore giant greeting |
| Persona · view · period | Implicit via greeting | Missing | **essential context** | **Restore tiny `ELENA · MTD`** |
| Situation statement | Present | Present | essential | Keep |
| Why supporting line | Present | Present | essential | Keep |
| 5 drivers + In/Out/Net | Present | Present (had Menu Mix duplicate) | essential + bug | Keep; **dedupe** |
| Why → drilldown | Present | Present | essential | Keep |
| Review Now ×3 Decisions | Present | Editorial 03 + rows | essential | Keep all three |
| Policy / GM approval on CC | Prominent policy line | Hidden on editorial | **essential compact** | **Restore per-row approval meta** |
| Operating Pulse | Present | Present (quieter) | essential | Keep |
| Contribution module | Present | Present full-width | essential | Keep |
| Locations pulse | Present | Present | essential | Keep |
| Menu Pulse | Present | Present | essential | Keep |
| History calendar | Present | Present | essential | Keep |
| Experience emphasis line | Occasional | Hidden via CSS | secondary | Leave Level 2 (role still drives prioritization) |

## True duplicates removed (keep removed)

| Item | Why duplicate |
|------|----------------|
| Control Center page title in header | Same destination selected in rail |
| Giant greeting block | Persona available; wastes vertical budget |
| Persistent evaluated/cleared in strip | Same data in Status details tray |
| Signal radar glyph | Count already communicates urgency |
| Menu Mix listed twice | Bug from residual “Other” overlap — fix |

## Not deleted (still reachable)

Service Map · BOH · Intelligence · Memory · Value · Locations · Connections · Data Health · Settings · Decisions · Dashboards — all remain in primary rail / routes.

## Release gate

- Essential = restored or compactly relocated  
- Secondary = tray / detail / Level 2  
- True duplicates = stay gone  
- Zero useful capability permanently deleted  

## Restore pass status (2026-10-02)

| Action | Status |
|--------|--------|
| Role always visible (switcher or static) | Done |
| Period always in header (incl. CC) | Done |
| Status details → opens evaluated tray | Done |
| Persona eyebrow `NAME · MTD` on Situation | Done |
| Compact GM / GM+CFO on Review Now rows | Done |
| Driver id dedupe · no residual Other | Done |
| FEATURE_PRESERVATION_AUDIT.md | Done |
| VISUAL_CHANGELOG.md | Done |
