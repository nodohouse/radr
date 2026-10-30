# INTERACTION_AUDIT

Generated: 2026-10-02T15:34:32.021Z
Base: http://127.0.0.1:3000

| ROUTE | ELEMENT | EXPECTED | ACTUAL | STATUS | SEVERITY | SCREENSHOT | FIX |
|---|---|---|---|---|---|---|---|
| http://127.0.0.1:3000/app | Primary · Center | navigate to /app | navigated | PASS | — | /Users/dodo/Desktop/prep/tmp/interaction-audit/nav-Center-desktop-1440.png |  |
| http://127.0.0.1:3000/app/decisions | Primary · Decisions | navigate to /app/decisions | navigated | PASS | — | /Users/dodo/Desktop/prep/tmp/interaction-audit/nav-Decisions-desktop-1440.png |  |
| http://127.0.0.1:3000/app/service | Primary · Service | navigate to /app/service | navigated | PASS | — | /Users/dodo/Desktop/prep/tmp/interaction-audit/nav-Service-desktop-1440.png |  |
| http://127.0.0.1:3000/app/house | Primary · BOH | navigate to /app/house | navigated | PASS | — | /Users/dodo/Desktop/prep/tmp/interaction-audit/nav-BOH-desktop-1440.png |  |
| http://127.0.0.1:3000/app/intelligence | Primary · Intelligence | navigate to /app/intelligence | navigated | PASS | — | /Users/dodo/Desktop/prep/tmp/interaction-audit/nav-Intelligence-desktop-1440.png |  |
| http://127.0.0.1:3000/app/memory | Primary · Memory | navigate to /app/memory | navigated | PASS | — | /Users/dodo/Desktop/prep/tmp/interaction-audit/nav-Memory-desktop-1440.png |  |
| http://127.0.0.1:3000/app/value | Primary · Value | navigate to /app/value | navigated | PASS | — | /Users/dodo/Desktop/prep/tmp/interaction-audit/nav-Value-desktop-1440.png |  |
| http://127.0.0.1:3000/app/locations | Primary · Locations | navigate to /app/locations | navigated | PASS | — | /Users/dodo/Desktop/prep/tmp/interaction-audit/nav-Locations-desktop-1440.png |  |
| /app | More · Connections | menuitem present | present | PASS | — | — |  |
| /app | More · Data Health | menuitem present | present | PASS | — | — |  |
| /app | More · Settings | menuitem present | present | PASS | — | — |  |
| /app | More · Dashboards | menuitem present | present | PASS | — | — |  |
| /app | More · Data Health state | degraded/stale state shown | state present | PASS | — | — |  |
| /app/compare?transfer=xfer_wine_hamburg | Wine transfer brief | resolves with Create test Decision | resolved | PASS | — | — |  |
| /app?stay=1 | button Why this is happening → | UI responds | state change / no crash | PASS | — | — |  |
| /app?stay=1 | button Sales+€6,800 | UI responds | state change / no crash | PASS | — | — |  |
| /app?stay=1 | button COGS−€4,120 | UI responds | state change / no crash | PASS | — | — |  |
| /app?stay=1 | button Labor−€3,200 | UI responds | state change / no crash | PASS | — | — |  |
| /app?stay=1 | button Channels−€2,460 | UI responds | state change / no crash | PASS | — | — |  |
| /app?stay=1 | button Menu−€1,800 | UI responds | state change / no crash | PASS | — | — |  |
| /app?stay=1 | a View all decisions → → /app/decisions?band=needs_you | UI responds | nav http://127.0.0.1:3000/app/decisions?band=needs_you | PASS | — | — |  |

## Summary

Total: 21 · Pass: 21 · Fail: 0

P0: **0** · P1: **0**

Release gate: P0 = 0 and P1 = 0.
