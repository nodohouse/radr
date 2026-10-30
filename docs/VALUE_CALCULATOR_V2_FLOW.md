# Value Calculator V2 — Guided Flow

**Route:** `/value-calculator`  
**Principle:** Guided operating-value diagnosis — not a form with a premature $0 panel.

---

## Screens

| Stage | ID | User does | Preview shows |
|-------|-----|-----------|---------------|
| Intro | `intro` | Build my Value Map / sample | — |
| 01 Operation | `operation` | Vertical (+ other kind) | Operating model |
| 02 Scale | `scale` | Locations · revenue · currency · optional covers/rooms | Portfolio scale |
| 03 Economics | `economics` | Labor / COGS / delivery / occupancy / ADR / OTA / purchasing | Known economics |
| 04 Signals | `signals` | Pain chips · maturity | Areas to test · confidence |
| Analyzing | `analyzing` | Auto 1.5–2.5s | Progress steps |
| 05 Value Map | `result` | Explore / edit / sensitivity / ROI / export | Full report |

---

## Transitions

- Question: 300–400ms fade + ±X ±20px  
- Preview: morph in place ~350ms  
- Analysis: 1.5–2.5s deterministic sequence  
- Result reveal: 600–900ms  

`prefers-reduced-motion`: fade only / skip analysis wait.

---

## Inputs (ranges, not typing)

Default: dropdown / segmented ranges. Optional “Enter exact value” later.  
Revenue / % fields store `{ low, base, high }` midpoints for math.

---

## Live preview (pre-result)

Never show `$0 – $0` financial totals. Show:

- Operation label  
- Scale chips  
- Economics known / assumed  
- Opportunity signals selected  
- Confidence LOW → MEDIUM → HIGH  

---

## Result

Personalized copy by vertical. Headline = conservative→modeled range.  
Potential · Modeled · Verified ($0). Waterfall · START HERE · evidence · capture · optional ROI.  
Edit inputs restores journey without reset.

---

## Engine

`calculateValueMap(journeyState)` → resolves ranges → existing deterministic core (`calculateValueOpportunity`) + richer result metadata.

---

## Browser back

Results → Signals → Economics → Scale → Operation. Preserve answers. No URL-encoded financials.
