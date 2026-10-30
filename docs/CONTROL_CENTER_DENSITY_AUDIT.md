# Control Center Density Audit

| Viewport | Target | Status |
| --- | --- | --- |
| 1440×900 | No page scroll; all primary modules visible | Implemented via `rp-cc4-root` fixed viewport height |
| 1280×800 | Prefer one-screen if legible | Same grid; row flex compresses |
| ≤1100 | Scroll OK; 6-col stack | Media query |
| Mobile | Pocket briefing; scroll OK | Single column |

## Compression techniques used

| Region | Technique |
| --- | --- |
| Situation | Editorial statement + compact bridge bars |
| Needs You | HumanHandoff cards (max 2) + master CTA |
| Pulse | 3 primary metrics + Why line (not 7 cards) |
| Live | Timeline strip + 3 facts |
| Locations | Δ / ✓ marks + one-line status |
| History | Semantic heat tiles (not % cells) |
| System | Footer strip (not Data Health module) |

## Failures to watch

- Tiny type to force-fit → FAIL
- Equal card soup → FAIL
- Hiding Needs You below fold → FAIL

## 5-second GM test

What needs me? How are we doing? What next? Where? What is RADR handling?  
→ Context + Row1–2 must answer without scroll.

## 10-second CFO test

Revenue / Contribution / Why / Exposure / Locations / Verified / Decisions  
→ Pulse + Situation + Locations + system strip.
