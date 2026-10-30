# LOCATIONS PORTFOLIO AUDIT

**Date:** 2026-09-24  
**Status:** PASS (Playwright locations-portfolio 5/5 desktop-1440)

## P0 — Scope fixed

- COO/CFO: all org locations render (`data-count` matches table rows)
- GM: Berlin only
- Hotels: hotel properties only — no Kreuzberg / delivery share in rail
- Identity: `locationDisplayName` + `verticalOfLocation` use NORTHSTAR orgs
- Detail: Kreuzberg + all org IDs resolve (no "Location not found")
- LocationSwitcher sources `org.locations`

## Restaurant portfolio brain

- Estate metric rail
- Performance × exposure matrix (~320px)
- Expandable rows: mix, delivery economics, refunds, important events
- Learn from the estate + shared cost pressure

## Hotel demand intelligence

SSOT: `lib/radr/product/hotelDemandIntelligence.ts`  
UI: `components/product/locations/HotelPortfolioIntel.tsx`

| Capability | Status |
|---|---|
| Scorecard (RevPAR, ADR, occ, direct, fees, readiness…) | Yes |
| Matrix metric switch | Contribution / RevPAR / ADR / Occ / Net RevPAR / Direct / Revenue |
| Seasonal fingerprint (per-property curve) | Yes — not group-wide peak |
| Peak periods + explanation | Canal House W24–W27 |
| Coming Up (material events only) | ADE etc. · low-materiality suppressed |
| Event attribution OBSERVED / ESTIMATED / INFERRED | Design Week example |
| Event sensitivity matrix | Canal +24% / Harbour +11% / Schiphol +3% |
| Booking pace | Property detail |
| Property Demand DNA | Strongest / window / sensitivity |
| Learn from the hotel estate | Direct-hold transfer |

## Playwright

`tests/e2e/locations-portfolio.spec.ts` — 5/5 desktop-1440

## Live

https://prep-ten-zeta.vercel.app/app/locations  
Hotel world → full portfolio + Coming Up + fingerprint  
https://prep-ten-zeta.vercel.app/app/locations/loc_canal_house
