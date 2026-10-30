# OVERLAP QA — Control Center + deep surfaces

Last run: 2026-09-24 · target `/app?stay=1` · deploy `prep-13cwlp90p` → prep-ten-zeta · **19/19 Playwright**

## Viewports tested

| Viewport | Cockpit scroll | Peek reflow | Timeline overflow | Heat tip block | Notes |
|---|---|---|---|---|---|
| 1440×900 | PASS — no body scroll | PASS — portal fixed | PASS — labels in-track | PASS — portal `pointer-events:none` | Primary GM view |
| 1280×800 | PASS | PASS | PASS — secondary labels hide | PASS | Dense OK |
| 1024×768 | PASS — tablet 8-col | PASS | PASS | PASS | Modules stack by row |
| 768×1024 | Scroll allowed (tablet) | PASS — full sheet | PASS | PASS | Mobile rules kick in |
| 430×932 | Scroll allowed (mobile) | PASS — full sheet | PASS | PASS — sheet on tap | Needs You first |

## Fixed this pass

1. **D-1911 DecisionPeek** — `createPortal` to `document.body`, `position: fixed`, body scroll lock, focus trap, Esc / X / scrim close. Cockpit grid never reflows.
2. **Now + Next** — CSS track + collision-safe label grid (NOW · Pressure · Recovery · CLOSE).
3. **Heatmap** — portal tip; non-pinned tip `pointer-events: none`.
4. **Menu Pulse** — compact 3-rank only on CC; depth on Menu Intelligence.
5. **Menu rankings** — sellers / contributors / operators are independent sorts; PUSH / HOLD / REWORK; basket upseli with inventory × kitchen × pressure × contribution.
6. **Decision Room** — named stages Evidence→Learn; Futures trajectories primary; exact matrix in `<details>`.
7. **Year on RADR** — Memory lens + Performance Focus when period=YTD; never everyday CC.

## Interaction matrix (Playwright)

| Action | Result |
|---|---|
| Open D-1911 peek from timeline | PASS |
| Close X / Escape / backdrop | PASS |
| Layout box identical before/after | PASS (portal) |
| Heat hover all 28 cells | PASS |
| Menu Pulse → Menu Intelligence | PASS |
| Rank tab switch (sellers → operators) | PASS |
| Basket pair hover dimensions | PASS |
| Decision Room stages + Futures primary | PASS |
| Memory → Year on RADR | PASS |
| Module bounds @ 1440/1280/1024 | PASS |
| Settings / Dashboards | PASS |

## Still watch

- Focus Mode Live depth `<details>` — intentional progressive disclosure, not overlap.
- Year on RADR never on everyday Control Center modules.
