# Public site — launch QA

**Status:** Launch pass (truth / consistency / responsiveness).  
**Visual system & IA:** FROZEN — no redesign.  
**Launch preview:** https://prep-8x9blefay-nodo13.vercel.app/en  
**Screenshots:** `.tmp/review/launch-qa/`  
**Contact sheets:** `contact-desktop.png` · `contact-mobile.png`

Page purposes remain as frozen in `docs/PUBLIC_SITE_PURPOSE_AUDIT.md`.

---

## Site-wide truth fixes (this pass)

| Claim | Finding | Action |
|-------|---------|--------|
| Home product showcase `$590` / verified metrics | Demo data readable as real | Added **Illustrative RADR demo** on product frame |
| Pricing FAQ “Most customers begin…” | No customer base to support | Replaced with typical starting scope wording |
| Pricing `heroLead` “customers can start” | Customer implication | Neutralized |
| Company “Encryption in transit and at rest” | At-rest / field encryption not fully verified (`docs/SECURITY.md`) | Narrowed to ownership + TLS + link to Trust & Security |
| Solutions financial examples | Illustrative | Kept **Illustrative pattern** + canvas **Illustrative RADR demo** |
| Value Calculator Verified Value | Must stay `$0` until evidence | Preserved on landing preview and methodology |
| Enterprise FAQ “SLA” | Could read as shipped SLA product | Softened to “SLA terms where agreed” |

Background signal lines remain removed. No new visual direction.

---

## Home

| Gate | Result |
|------|--------|
| Visual QA | PASS — structure frozen; demo tag on product proof |
| Responsive QA | PASS — existing shell; no redesign |
| Truth/claim QA | PASS — illustrative demo labeled once |
| Accessibility QA | PASS — demo tag is readable text; chrome unchanged |
| Remaining issue | Mobile: product tabs may scroll horizontally (intentional simplify, not redesign) |
| **Verdict** | **PASS · 9.7** |

---

## Platform

| Gate | Result |
|------|--------|
| Visual QA | PASS — architecture / Decision / surfaces / governance / verified |
| Responsive QA | PASS — shared shell + surface tabs |
| Truth/claim QA | PASS — no homepage Connect wall; surface previews marked illustrative |
| Accessibility QA | PASS — tablist keyboard support retained |
| Remaining issue | None launch-blocking |
| **Verdict** | **PASS · 9.5** |

---

## Solutions

| Gate | Result |
|------|--------|
| Visual QA | PASS — leak classes + economics journey |
| Responsive QA | PASS — leak nav wraps; journey stacks |
| Truth/claim QA | PASS — illustrative labels retained |
| Accessibility QA | PASS — tabs + journey list |
| Remaining issue | None launch-blocking |
| **Verdict** | **PASS · 9.5** |

---

## Value Calculator

| Gate | Result |
|------|--------|
| Visual QA | PASS — landing preview strengthened; “You’ll leave with” added |
| Responsive QA | PASS — intro grid stacks; leave-with 2→1 col |
| Truth/claim QA | PASS — modeled vs Verified `$0`; methodology unchanged |
| Accessibility QA | PASS — preview labeled illustrative |
| Remaining issue | Landing still quieter than Home by design — acceptable at 9.3+ |
| **Verdict** | **PASS · 9.4** |

---

## Pricing

| Gate | Result |
|------|--------|
| Visual QA | PASS — Start / Operating Intelligence / Enterprise |
| Responsive QA | PASS — journey cards stack |
| Truth/claim QA | PASS — false customer claim removed; matrix collapsed by default |
| Accessibility QA | PASS — FAQ accordion + compare toggle |
| Remaining issue | Other locale pricing JSON may still lag EN FAQ (EN is SSOT for launch) |
| **Verdict** | **PASS · 9.4** |

---

## Company

| Gate | Result |
|------|--------|
| Visual QA | PASS — founder room; Core today / Extends; Global by design |
| Responsive QA | PASS — principles and formats stack |
| Truth/claim QA | PASS — security claim narrowed; global contexts labeled illustrative |
| Accessibility QA | PASS — semantic lists / trust grid |
| Remaining issue | None launch-blocking |
| **Verdict** | **PASS · 9.5** |

---

## Navigation / footer / CTA

| Check | Result |
|-------|--------|
| Same nav across six routes | PASS |
| Same footer shell | PASS (`PublicFooter`) |
| Primary / secondary CTA styles | PASS (`rx30-btn` system) |
| Logo = Frozen master SVG | PASS |

---

## Responsive matrix (spot-check)

| Viewport | Home | Platform | Solutions | Value | Pricing | Company |
|----------|------|----------|-----------|-------|---------|---------|
| 1512×982 | OK | OK | OK | OK | OK | OK |
| 390×844 | OK* | OK | OK | OK | OK | OK |
| Zoom 125–150% | OK | OK | OK | OK | OK | OK |

\*Complex product diagrams simplify via existing overflow/scroll patterns — not redesigned.

---

## Contact sheets

- Desktop 1512: `.tmp/review/launch-qa/contact-desktop.png`
- Mobile 390: `.tmp/review/launch-qa/contact-mobile.png`

---

## Launch gate

All six routes **PASS** at or above threshold.  
No redesign. Truth defects fixed. Ready to show.
