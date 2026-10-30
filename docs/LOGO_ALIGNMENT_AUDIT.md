# Logo Alignment Audit

**Date:** 2026-10-05  
**Canonical mark:** `components/radr/RadrMark.tsx` + `RadrDeltaGlyph.tsx`  
**Color:** `#00d978` (`--color-brand` / marketing `--signal`)

## Root cause (prior misalignment)

Collapsed rail kept an invisible `RADR` wordmark in flex flow (`opacity: 0`), which shifted the △ left of the rail center (~25px). Fixed by removing the word from layout when collapsed.

## Glyph normalization

| Item | Before | After |
|------|--------|-------|
| viewBox | `0 0 100 90` | `0 0 108 100` (stroke padding) |
| Path | `M50 8 L90 81 H10 Z` | `M54 13 L94 86 H14 Z` (same geometry, translated) |
| strokeWidth | 14 | 14 |
| Product API | `RadrDelta variant="nav"` | `RadrMark size={22}` |

## Desktop QA (1440×900)

| Check | Result |
|-------|--------|
| Mark center = rail center | PASS (`offsetFromCenter: 0`) |
| Inside rail bounds | PASS |
| Marketing green `#00d978` | PASS |
| No clip | PASS |
| Optical vertical (base heavier) | Glyph `translateY(-1px)` inside mark box only |

## Viewports to re-check after deploy

1440 · 1366 · 1280 · 1024 · 430 · 390 — upper-left crop.

## Rule

Do not “fix” with arbitrary `translateX`. Fix layout + viewBox. Optical Y nudge only when mass is asymmetric.
