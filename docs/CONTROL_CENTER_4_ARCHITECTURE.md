# Control Center 4.0 — Architecture

**URL:** `/app`  
**Thesis:** One-screen operating cockpit. Overview + Live + Performance synthesized. No primary tabs.

## Hierarchy (desktop 1440×900 — no page scroll)

```
CONTEXT STRIP
  Good morning.
  N need your judgment.     → /app/decisions?band=needs_you
  Since your last check (max 3)

ROW 1  Situation (7) | Needs You / HumanHandoff (5)
ROW 2  Business Pulse (7) | Now + Next (5)
ROW 3  Locations (3) | Menu Pulse (4) | Performance (3) | History heatmap (2)

SYSTEM STRIP  data health · verified · RADR handling
```

## Focus Mode

Deep surfaces remain via `?focus=`:

| Param | Surface |
| --- | --- |
| `live` | LiveCommandSurface / HotelLiveSurface |
| `performance` | Pace + Contribution bridge |
| `history` | OperatingCalendar / day replay |
| `pulse` | Pulse explanation |
| `location` | Hint → locations |

Legacy `?view=live|performance` maps into Focus Mode.

Esc / Back clears focus and restores cockpit.

## Human attention

- `HumanHandoff` primitive — green focus accent, near-black CTA, not incident-red
- Master CTA: Review N Decisions →
- Click Decision → DecisionPeek portal (no reflow)
- Calendar: hover tip updates per cell; click pins tip; Replay is explicit

## Hotel

Same grammar via `HotelCockpit` — rooms / readiness / arrivals lexicon. Flagship Decision Room: D-2401 readiness + D-2201 OTA.
