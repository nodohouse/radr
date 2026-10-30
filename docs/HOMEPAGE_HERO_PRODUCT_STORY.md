# Homepage Hero — Product Story

**Route:** `/` (Homepage2030)  
**Scope:** Hero + Decision Gap only. Lower homepage unchanged for this pass.

---

## Current → Target

| | Current | Target |
|---|---------|--------|
| Hero right | Static DecisionLayerPreview (Decision-first) | Living Connect → Understand → Decide → Verify |
| Message | Slogan strong; “what RADR does” late | Inputs → RADR → Decisions/value in 5s |
| Decision Gap | Weak copy + tile theater | Continues hero: systems → RADR → Decision |
| Vertical | Implicit | Explicit Restaurants / Hotels switch (same shell) |

---

## Locked copy

**Eyebrow:** Hospitality Operating Intelligence  
**Headline:** NOTHING OFF THE RADR.  
**Support:** RADR helps hospitality operators turn fragmented signals into decisions, action, and verified value — across restaurants, hotels and multi-site operations.

**CTAs:** Book a demo → · See how it works (scroll to Decision Gap / sequence)

**Proof row:** Unify your data · Make faster decisions · Drive measurable impact

**Decision Gap:**  
Eyebrow THE DECISION GAP  
Headline: Hospitality already has the data. The gap is the decision.  
Body: Reservations, POS, PMS, labor, payments and accounting each hold part of the picture. RADR connects those signals into one operating context — then helps teams decide what happens next.

---

## Hero stages (autoplay ~16s)

| Stage | Dwell | Visual |
|-------|-------|--------|
| Connect | ~2.5s | Sources → RADR node → operating signals |
| Understand | ~3s | Product panel: location · LIVE · signal stack |
| Decide | ~3.5s | Decision object + Compare Futures |
| Verify | ~3s | Expected → Observed → Verified · memory note |

Transitions: 450–650ms · `cubic-bezier(0.22, 1, 0.36, 1)`  
Pause: hover on stage · `document.hidden` · reduced-motion = no autoplay (manual tabs only)

User controls: Connect · Understand · Decide · Verify

---

## Restaurant canon (illustrative)

Sources: Reservations · POS · PMS · Accounting · Channels  
Signals: Kitchen load 92%→97% · Labor floor stretched · Inventory risk · Demand +31%  
Understand: Soho · New York · Dinner · LIVE 19:48  
Decide: D-1911 · Pace next seating wave · 12 min · +$620 · 82%  
Verify: Expected → Observed → Verified (illustrative) · Operating Memory updated

## Hotel canon (illustrative)

Sources: PMS · Channel manager · Reservations · Labor · Payments · Accounting  
Signals: Occupancy · Arrival wave · Room readiness · Housekeeping pressure · Channel mix  
Understand: Mercer House · New York · 89% · 42 arrivals · 31/42 ready · 7 at risk  
Decide: D-H-9201 · Reassign 2 housekeepers · +$1,840 · 81%  
Verify: same ladder · memory note

---

## Motion / a11y / mobile

- Persistent shell — no full unmount between states  
- Green = action/RADR · Blue = analytical streams (~10%)  
- Mobile: stacked copy + full-width stage; segmented control; Connect shows 4 sources max  
- Reduced motion: Connect default + crossfade on tab click  

---

## Out of scope (this pass)

Sticky loop, SignalConvergence redesign, Integration marquee, Calculator CTA section, Close — leave as-is unless broken by CSS.
