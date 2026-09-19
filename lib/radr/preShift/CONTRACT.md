# Pre-Shift Intelligence

## Cycle

PLAN (PRE_SHIFT) → OPERATE (LIVE / CLOSING) → VERIFY + LEARN (POST_SHIFT)

## Rules

- Translate external signals (weather, events, footfall) into **operating meaning** + € impact.
- Never scrape Google Popular Times / undocumented busyness fields.
- Footfall goes through `FootfallProvider` only.
- Show forecast **ranges** where uncertainty matters.
- Micro-opportunities must include upside, cost, net contribution, confidence, deadline.
- Money: always `formatMoney` / cents.

## Post-shift learning

After each service, Control Center shows a calm VERIFY + LEARN surface (not a scoreboard):

1. Outcomes — sales, covers, verified value
2. Evening money — food, drinks, delivery in; refunds, comps, discounts, delivery fees out
3. What went well — few operator-relevant wins (incl. food + beverage attach)
4. Food mix + drinks mix — best sellers / soft items vs typical
5. Forecast learning — predicted → actual (feeds next pre-shift)
6. What RADR changed — intervention contribution
7. For the next shift — prepared / watching / decide carry-forward

Prefer learning language over task generators. Contribution ≠ profit.
Evening money `in` lines sum to net sales. Leakage is shown for truth; delivery fees are contribution drag.

## Control Center compression (ShiftTruth)

Level 1 — **ShiftTruth**: one hero, one verdict, two satellites, attention line, optional interrupt.
Level 2 — dig deeper: pre-shift plan · live panel · post “Learn from tonight” · Horizon expand · Recovery drawer.
Level 3 — full mix lists, forecast learning, event feeds, finance route.

Do not stack pulse + JustNow + recovery feed + lanes on Level 1. GlanceBoard keeps attention decisions only.

## Demo

Berlin Mitte dinner fixture in `composeBerlinPreShiftBrief()` / `composeBerlinPostShiftBrief()`.
Demo phase switcher previews PRE / LIVE / CLOSING / POST without changing production clocks.
F&B split: `lib/radr/fnb` (`splitFnBNetSales`, drink/food mix fixtures).
