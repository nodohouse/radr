# Active Revenue Intelligence — contract

## Purpose

Help restaurants **recover perishable revenue** and **recommend relevant hospitality** —
without becoming a spam engine, discount machine, or toxic sales culture.

Flows share guest, reservation, POS, menu, capacity, and verified outcomes:

1. **RECOVER** — cancelled / no-show tables and unused inventory before they expire  
2. **GROW** — at most 1–2 relevant suggestions per table, at the right moment  
3. **LIVE RECOVERY** — Control Center one-tap plan (waitlist → inventory → social escalation)

## What we are not

- Aggressive sales engine  
- Generic CRM / social media manager  
- Discount-first engine  
- Task queue for cancellations  

## Language

| Use | Do not use |
|-----|------------|
| Table opened / Recovery opportunity | Cancellation alert |
| No-show eligible (after grace) | Immediate release at reservation time |
| Recommended / Prepared | AI score / upsell / push |
| Expected incremental contribution | Guaranteed profit |
| Verified recovered / verified purchase | Assumed attribution |

## Recovery hierarchy

1. Waitlist  
2. Reservation inventory (honest capability flags)  
3. Direct approved guest channel  
4. Social / community (escalation)  
5. Walk-in hold  

Social posts require approval by default. Auto-publish only with explicit opt-in.

## No-show grace

Grace period is **policy-configured** (org / location / service). Never hardcode in UI.

States stay distinct: CANCELLED · DELAYED · NO_SHOW_PENDING · NO_SHOW · REBOOKED · EXPIRED.

## Relevance before margin

Never recommend solely because margin is high.  
Allergy / dietary / availability incomplete → **no recommendation**.

## Attribution

Suggested → Offered → Accepted → Purchased → Verified.  
Verified Value uses observed POS amounts only.  
Social ROI optimizes on rebooking / contribution — not likes.

## Phase 1 (shipped)

Berlin Mitte dinner demo:

- `CancellationOpportunity` + waitlist + recovery `plan` + optional social preview  
- No-show opportunity with configurable grace  
- `RecoveryTemplate` library + `SocialChannelProvider` capability flags  
- Compact **Recovery drawer** (Approve plan) · Live NOW feed  
- Settings → Social & Recovery Channels  
- GM / Host Control Center glance signals  
- Ask RADR `ACTIVE_REVENUE` (cancellations, no-shows, templates, social ROI)  
- `PerishableInventoryOpportunity` scaffold for future inventory types  

## Explicitly later

Live reservation inventory write adapters, social attribution pixels, automated
waitlist outreach, learned escalation thresholds, private-room / terrace packs,
template variant learning, brand-lock CMS.
