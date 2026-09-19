# RADR Feature Matrix

**Source of truth for marketing, pricing, and navigation.**  
**Companion:** [`RADR_PRODUCT_REALITY_AUDIT.md`](./RADR_PRODUCT_REALITY_AUDIT.md)  
**Date:** 2026-08-28  
**Status:** AUDIT + PROPOSAL. No broad website rewrite until this plan is approved.

---

## 1. One-sentence product

> RADR finds where margin is being made, lost, owed and left behind across your hospitality operation.

**Loop (mental model, not necessarily printed verbatim):**  
FIND IT → UNDERSTAND IT → ACT ON IT → VERIFY THE VALUE

**Product loop (systems):**  
CONNECT → DETECT → EXPLAIN → QUANTIFY → PRIORITIZE → ACT → VERIFY

---

## 2. Vocabulary (must match product)

Use `lib/radr/terminology.ts` as the word bank. Marketing may not invent parallel names.

| Use | Do not use |
|-----|------------|
| Verified Value | “Realized ROI”, “proven savings” (unless verified) |
| Value at risk | “Potential upside” for risk items |
| Recoverable value | “Guaranteed recovery” |
| Covers | Guests (when counting headcount) |
| Operating margin | “Profitability score” |
| Finding | Insight / anomaly (ambiguous) |
| Action | Task / ticket (generic SaaS) |
| Morning Brief | Daily digest / AI summary |
| Ask RADR | AI chatbot / Copilot |
| Control Center | Dashboard (alone) |

**Banned marketing language:** unlock, seamlessly, empower, leverage, actionable insights, data-driven decisions, all-in-one, revolutionary, next-generation, cutting-edge.  
**Punctuation:** no em dashes in user-facing copy.

---

## 3. Feature matrix (capability × reality × marketing)

Legend: **D** = demo (`/app`) · **P** = production shell · **M** = OK to market with label

| Feature | Reality | Demo | Prod | Market as | Label required |
|---------|---------|------|------|-----------|----------------|
| Control Center | DEMO ONLY | D | — | Product preview | Simulated example / Demo |
| Morning Brief | PARTIAL | D | — | Product preview | Demo · no email claimed |
| BUY | DEMO ONLY | D | — | Territory story | Simulated example |
| LABOR | DEMO ONLY | D | — | Territory story | Simulated example |
| SELL | DEMO ONLY | D | — | Territory story | Simulated example |
| RECOVER | DEMO ONLY | D | — | Signature story | Simulated example |
| Findings | PARTIAL | D | empty | Preview | Demo findings |
| Actions / Controls | PARTIAL | D | empty | Preview | Demo |
| Verified Value | PARTIAL | D | empty | Core story | Methodology + simulated numbers |
| Reservations | DEMO ONLY | D | — | Ops story | Simulated |
| Waitlist | PARTIAL | D | schema | Ops story | Simulated |
| Cancellation recovery | DEMO ONLY | D | — | Signature workflow | Simulated |
| Forecast | PARTIAL | D | — | Preview | Simulated |
| Service Map | DEMO ONLY | D | — | Preview | Simulated floor |
| Location comparison | DEMO ONLY | D | — | Enterprise story | Simulated |
| Multi-location | DEMO ONLY | D | 1 loc | Enterprise story | Simulated group |
| Ask RADR | PARTIAL | D | API demo-backed | Major moment | PRODUCT PREVIEW |
| Provenance | PARTIAL | D | — | Trust story | Demo explanations |
| Data health | PARTIAL | simulated | upload live | Platform | Distinguish Live upload vs simulated health |
| Document upload | WORKING | — | P | Live | Live |
| Notifications | PLANNED | — | — | Do not sell | — |
| Onboarding | WORKING | preview | P | Live | — |
| Authentication | WORKING | — | P | Live | Reset email incomplete |
| RBAC | PARTIAL | not enforced | uploads | Enterprise later | Do not claim advanced SSO/RBAC |
| Commercial integrations | PLANNED | fake CONNECTED | Building | Categories only | Never CONNECTED unless registry available |
| Files / CSV | PARTIAL | fake map | store | Live upload | Mapping not automated |
| Developer API | Design preview | docs | — | Preview | Design preview |
| Webhooks | PLANNED | docs | — | Preview | Proposed |
| Custom connector | PLANNED | docs | — | Enterprise quote | Architecture |
| Warehouse | PLANNED | — | — | Enterprise quote | Architecture |
| Billing | NOT IMPLEMENTED | — | — | Not live | Billing not live |
| Team admin UI | DEMO ONLY | D | membership only | Limited | Demo people |
| Audit log | PARTIAL | — | writes only | Enterprise later | No viewer UI |

---

## 4. Current pricing audit (as shipped)

**Config:** `components/marketing/pricing/config.ts`  
**Page:** `/pricing`  
**`billingLive: false`**

### Tiers today

| Config id | Display name | Price | Limits (config) | Card CTA |
|-----------|--------------|-------|-----------------|----------|
| `free` | Core | €0 | 1 location, 1 user, 10 docs, 30-day history | Start free → `/signup` |
| `control` | Pro | €199 / location / month | — | See RADR in action → `/signup` (UI); config says “Start Pro” |
| `scale` | Enterprise | Custom | — | Talk to RADR → `/signup` |

### Contradictions

1. Config comment says “Free trial · Core (€199)” — **wrong** (Core is €0; Pro is €199).
2. Compare table headers: Free / Control / Scale vs cards: Core / Pro / Enterprise.
3. Platform billing codes: `trial | core | group | enterprise` ≠ marketing names.
4. Tier bullets sell Findings, Verified Value, Advanced forecasting, Group intelligence; compare rows mark many as early/next/not. FAQ is more honest than bullets.
5. No Stripe Checkout. Prices are display-only.
6. Homepage does **not** currently include a pricing section (correct for density).

### CTA chaos (must collapse)

| Label used | Destination found |
|------------|-------------------|
| See RADR in action | `/signup` (home, pricing) **and** `/contact` (how) |
| Request access | `/signup` |
| Start free | `/signup` |
| Start Pro | `/signup` |
| Talk to RADR | `/signup` |
| See RADR → | `/signup` |
| Open the demo / Open the demo Control Center | `/app` |
| Explore the product | `/product` |

**Primary commercial motion today should be one of:** See RADR in action (→ `/app`) **or** Request access (→ `/signup`). Not both with the same label.

---

## 5. Proposed commercial model (for approval)

**Principle:** Price by **location count**. Do not sell AI credits packs. Do not withhold core intelligence behind endless SKUs. Billing stays **not live** until Checkout exists.

### Recommended structure

| Offer | Who | What is included (when real) | Price posture |
|-------|-----|------------------------------|---------------|
| **RADR** (or RADR Core) | Independent + small groups | Control Center, four territories, Morning Brief, Findings, Forecast, Service intelligence, Location comparison, Verified Value, Ask RADR when production-ready, core file ingest, team access | **From €X / location / month** (keep €199 as working number until commercial review; do not invent a new number without decision) |
| **RADR Group** | Multi-location groups | Everything in RADR + group comparison workflows + multi-entity | Per location, volume/commercial |
| **RADR Enterprise** | Large operators | SSO, advanced permissions, audit access, warehouse/custom integrations, SLA, dedicated onboarding, security review | Custom |
| **Pilot** | Early customers | 90-day pilot, selected locations, onboarding, core integrations, weekly value review → annual | Quoted; optional public “Join the pilot” CTA |
| **Custom integration** | Any | Partner engineering for providers not yet available | Quoted separately |

### What NOT to do

- Starter / Growth / Pro / Ultra / AI Add-on soup
- Prominent “100 vs 500 Ask questions” tiers
- Selling unfinished connectors as included live
- Implying billing is active while `billingLive: false`

### Pricing page questions (must answer in ≤30s)

1. What does RADR cost?  
2. What is included?  
3. What counts as a location?  
4. Are integrations included? (files yes; native providers as available / quoted)  
5. Is onboarding included?  
6. Can I run a pilot?  
7. Can I add locations later?  
8. Can I cancel? (once billing live)  
9. What does Enterprise add?

---

## 6. Proposed information architecture

### Global nav (keep simple)

Product · Solutions · How it works · Pricing · Company  
Sign in · **See RADR →** (single primary CTA)

Developers: footer / Company secondary (not top-level unless strategy requires).

### Homepage (≤10 moments)

| # | Section | Question answered | Notes |
|---|---------|-------------------|-------|
| 01 | Hero | What is RADR? | Split: brand + intelligence board. No laser. Max 2–3 signals. Secondary: How RADR works → `/how` |
| 02 | Problem | Why does this need to exist? | Margin disappears between systems. Short. |
| 03 | Four territories | Where does it look? | BUY / LABOR / SELL / RECOVER · one example each |
| 04 | How RADR works | How does it work? | Systems → Finding → Value → Action → Verified (one story) |
| 05 | Product | What do I see? | One Control Center composition · small surface chips |
| 06 | Ask RADR | How do I interact? | PRODUCT PREVIEW · structured answer |
| 07 | Verified Value | Why commercially different? | IDENTIFIED → … → VERIFIED · simulated labeled |
| 08 | Integrations | Will it work with my stack? | Categories · See all → developers/product connections |
| 09 | Multi-location | Will it scale? | One comparison table · simulated |
| 10 | Final CTA | What next? | One primary motion |

**Remove from homepage density:** pricing teaser, hospitality essay, duplicate verified flows, feature chip walls.

### Product page (deeper, curated)

Control Center · Morning Brief · Four territories · Service · Forecast · Ask RADR · Verified Value · Multi-location  
No submenu dump.

### How it works (make obvious)

1. Connect systems you already use  
2. RADR normalizes the operation  
3. Finds what doesn’t add up  
4. Shows financial impact  
5. Recommends what to do  
6. Watches what happens next  
7. Verifies the result  

Align nav HOW_LINKS to this page (today: nav 5 stages vs page 8).

### Solutions (problem-mapped, not fluff)

Finance · Operations · Multi-location groups · Revenue  
Each maps to the same platform + territories.

### Company

Why RADR exists (systems know pieces; almost none know the whole). Human, not corporate. No “revolutionize hospitality.”

### Developers

Keep editorial light site. **Provider status from `lib/integrations/registry.ts` only.** Reconcile demo CONNECTED claims.

---

## 7. Proposed CTA strategy

**Pick one primary commercial motion for launch posture:**

| Option | Label | Destination | When |
|--------|-------|-------------|------|
| A (recommended now) | See RADR in action → | `/app` | Product truth via demo |
| B | Request access → | `/signup` | If gating exploration |
| C | Join the pilot → | `/contact` or `/signup` | When pilot program is formal |

**Secondary everywhere:** Explore the product → `/product`

**Nav CTA:** Match primary (today “See RADR →” → `/signup`; recommend → `/app` until billing live, or keep signup but stop calling homepage CTA the same string with different intent).

**Kill duplicate labels** that point to different places.

---

## 8. Ask RADR capability map (product direction)

Documented for Butler roadmap. Marketing may only show examples that tools can ground today (demo-backed). Scenario mode must be labeled **SCENARIO**.

| Domain | Example asks | Reality today |
|--------|--------------|---------------|
| Executive | How are we doing? What needs attention? | Demo tools |
| Reservations | Covers, waitlist, cancellations | Demo |
| Service | Pressure, FOH/BOH | Demo |
| Labor | Understaffed, +1 FOH cost | Demo |
| Sell | Unused demand, booking pace | Partial demo |
| Buy | Supplier variance | Demo tools |
| Recover | Waitlist matches, credits | Demo scenario |
| Forecast | Tonight / Friday | Demo forecast |
| Compare | Rank locations | Demo compare |
| Provenance | Where did €X come from? | Partial |
| Scenario | What if +1 FOH? | Future · label SCENARIO |
| Act | Create action | Confirm before write · partial |

Modes eventually: ASK · ANALYZE · COMPARE · SIMULATE · ACT

---

## 9. Verified Value story (company-grade)

Stages to teach once and reuse:

1. **IDENTIFIED** — money spotted  
2. **ACTIONABLE** — enough evidence to act  
3. **ACTIONED** — operator took a step  
4. **OBSERVED** — systems show an outcome  
5. **VERIFIED** — RADR links action to observed value  

Do not overclaim attribution. Simulated numbers always labeled.

---

## 10. Current vs proposed homepage (gap)

| Current (`app/page.tsx`) | Proposed |
|--------------------------|----------|
| Hero (intel board) | Keep · refine CTA secondary to How it works |
| Territories | Keep |
| Signal → verified | Keep as “How RADR works” spine |
| Control Center | Keep · tighten |
| Ask | Keep · PRODUCT PREVIEW label stronger |
| Integrations | Keep · registry-honest |
| Verified report | Keep · methodology language |
| Multi-location | Keep · simulated |
| Final CTA | Unify primary motion |
| **Missing: Problem** | **Add short section** |
| Pricing home | Stay off homepage |

---

## 11. Implementation order (do not skip)

1. ~~Audit product reality~~ → `RADR_PRODUCT_REALITY_AUDIT.md`  
2. ~~Feature matrix + pricing audit~~ → this doc  
3. **Approve** IA, CTA primary, and pricing posture  
4. Reconcile terminology on marketing pages (no new names)  
5. Fix provider CONNECTED lies (demo + marketing → registry)  
6. Rebuild homepage to 01–10 structure (Problem section + CTA unify)  
7. Update Product · How · Solutions · Pricing · Company  
8. Reconcile Developers statuses  
9. Reconcile onboarding exit CTAs  
10. Butler messaging honesty  
11. Nav / footer cleanup  
12. Mobile / a11y / perf QA  
13. `tsc` · lint · tests · build  

**STOP:** No broad rewrite until step 3 is approved.

---

## 12. Decision checklist (for NODO)

Please confirm or amend:

- [ ] Primary CTA: **A** See RADR in action → `/app` · **B** Request access → `/signup` · **C** Join the pilot  
- [ ] Keep **€199 / location / month** as public Pro/RADR price until commercial change  
- [ ] Rename tiers to **RADR / RADR Group / Enterprise** (or keep Core/Pro/Enterprise)  
- [ ] Publish **Pilot** as a CTA or keep private  
- [ ] Homepage: add Problem section; keep current rebuild as base  
- [ ] Ask RADR marketing label: **PRODUCT PREVIEW** vs **SIMULATED EXAMPLE**

After decisions, execute steps 4–13.
