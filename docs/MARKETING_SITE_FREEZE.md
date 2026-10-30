# Marketing site freeze

**Status:** 2030 REDESIGN IN PROGRESS (2026-10-22).  
Prior freeze: 2026-09-24 final release pass.  
**Truth audit:** `docs/MARKETING_TRUTH_AUDIT.md`  
**Reference map:** `docs/MARKETING_2030_REFERENCE_MAP.md`  
**Release audit:** `docs/WEBSITE_RELEASE_AUDIT.md`

## Redesign override

Commercial strategy change: rebuild the public marketing system as a motion-first, product-led 2030 site.

| Surface | Status |
|---------|--------|
| HOME | **UNFROZEN** — 2030 spine live |
| PLATFORM / product | **UNFROZEN** — 2030 Platform2030 |
| WHERE VALUE LEAKS / Solutions | **UNFROZEN** — 2030 Solutions2030 |
| PRICING | **UNFROZEN** — 2030 Pricing2030 (no invented list prices) |
| COMPANY | **UNFROZEN** — 2030 Company2030 |
| TRUST / security | **UNFROZEN** — 2030 Trust2030 |
| WHY / blog / developers / contact / auth | Frozen unless factual correction required |

**Rule during redesign:** No fake traction (logos, hotel counts, ROI, testimonials, SOC 2 as fact). Demo economics from `publicCanon` only.

**Implementation entry:** `components/marketing/v2030/` · tokens `app/marketing-2030.css` · truth `docs/MARKETING_TRUTH_AUDIT.md`

## Hard boundary

| Surface | Path |
|---|---|
| Public marketing | `/en/**` |
| Authenticated product | `/app/**` |

Unauthenticated marketing must never open `/app` directly. Signup unlocks the demo (`intent=demo&next=` via `lib/marketing/demoAccess.ts`). Middleware gates `/app/**` server-side.

## Canonical demo-entry CTA

`See RADR in action` → `/en/signup?intent=demo&next=/app/enter`

## Canonical Verified Recovery

`See a Verified Recovery` → `/en/product/value`  
Economics: contract $6.80/L · invoice $7.45/L · 420 L · verified **$273** (D-4102) · Soho · New York

## Canonical Futures

`Compare Futures` → `/en/product/futures?example=D-1911`  
Soho · New York · Pace seating · **+$620** expected

## Example operating models (public)

**Restaurants** · **Hotels** — same intelligence, different operating grammar.

## Production-readiness TODO (legal / entity) — P2

Before treating Terms / Privacy / Imprint as production-final:

- [ ] Confirm legal entity name, registered address, VAT / tax ID
- [ ] Confirm governing law and competent courts with counsel
- [ ] Confirm controller / processor roles and subprocessor list
- [ ] Confirm retention schedules and transfer mechanisms
- [ ] Counsel review of Privacy, Terms, Imprint
- [ ] Fill `components/marketing/config/company.ts` pending fields
- [ ] Remove draft / “To be published” notices only after the above are complete

Do **not** invent entity details, certifications (SOC 2 / ISO / PCI), or processor commitments to clear these checkboxes.

## Demo economics (fixture-backed — do not drift)

- **D-4102:** contract $6.80/L · invoice $7.45/L · Δ $0.65/L · 420 L · verified **$273**
- **D-4188 (miss):** expected $420 · verified **$0**
- **D-1911 Futures:** Pace 12 min **+$620** · Seat now +$410 · Throttle +$470
- **Memory calibration:** forecast error **14.2% → 6.8%** across comparable nights

Integration availability labels must come from `lib/integrations/registry.ts`. Never upgrade Planned → Available in copy alone.
