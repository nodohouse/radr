# Control Center glass revision 2

2 November 2026. Scope: Control Center and its shell. Status: review candidate, awaiting visual approval before propagation.

The user rejected the first pilot as too empty and underwhelming. This revision responds with visible glass, stronger blue-green contrast, a fuller composition and a more decisive focal surface. It preserves the product and its underlying data.

[Rejected pilot / revised glass comparison](visual-qa/control-center-comparison.png)

## What changed

| Aspect | Rejected pilot | Glass revision 2 |
| --- | --- | --- |
| Canvas | Almost flat gray-ivory | Blue-white light with broad analytical-blue and mint illumination |
| Working surfaces | Near-opaque, almost flat | Translucent blue-white glass, luminous upper borders, fine support edges and selective 8px blur |
| Decision | Pale green and low contrast | Deep teal/forest focus glass, a fine mint edge, bright mint impact and a high-contrast action |
| Composition | 1200px desktop reading width and excess surrounding space | 1360px desktop / 1680px wide-screen composition with tighter outer padding |
| Financial context | Restrained numbers on an almost-white divided surface | Larger navy/green instrumentation on one visible glass surface |
| Proof | Unboxed numbers that felt disconnected | One shallow translucent proof field, retaining four existing facts and internal separators |
| Readiness | White supporting panel with little presence | Blue-white glass, clearer type, stronger numbers and an integrated constraint field |
| Analytical entry points | Thin, flat strip | One lightly tinted glass strip with larger existing SVG marks |
| Shell | Nearly invisible | Frosted pale-blue rail, white-facing command surface and a restrained profile ring |

Only the operating-summary and readiness surfaces use backdrop blur. The Decision is near-opaque, and other surfaces use static tint/edge treatment. Blur support is optional. Reduced transparency removes atmospheric light and blur, and uses solid surfaces. Reduced motion still disables transitions and the brief entrance treatment. No continuous animation, new chart, dependency or client-side data request was introduced.

## Scope and integrity

All material selectors remain restricted to the Control Center root. No other product page was restyled. The prior pilot was rejected; this version is not treated as approved for propagation.

D-1911 remains `dec_peak_berlin`, Peak capacity collision, Soho · New York, $620 expected incremental contribution, MEDIUM confidence, six evidence items, the existing Recommended status and “Hold next seating wave for 12 min” action. No invented confidence percentage, changed Decision state or changed financial logic.

Restaurant summary remains $18,420 revenue, $11,230 deductions, $7,190 contribution and $26,800 projected close. Revenue, contribution, location, day/week/month and hotel drill-downs retain their behavior. Approved SVG logo artwork is unchanged.

## Captures

| Capture | Resolution |
| --- | --- |
| [Before: rejected pilot](visual-qa/control-center-before.png) | 1512×982 |
| [Revised glass](visual-qa/control-center-after.png) | 1512×982 |
| [Full HD](visual-qa/control-center-after-1920x1080.png) | 1920×1080 |
| [QHD](visual-qa/control-center-after-2560x1440.png) | 2560×1440 |
| [4K](visual-qa/control-center-after-3840x2160.png) | 3840×2160 |
| [Double-density reflow](visual-qa/control-center-after-200-percent-reflow.png) | 756×491 CSS viewport, DPR 2, full document |
| [Phone](visual-qa/control-center-after-mobile.png) | 390×900 CSS viewport, full document |

The reflow capture represents the layout density of a 1512×982 display at 200%; browser chrome zoom is not claimed to have been automated. Full-document phone captures place fixed navigation at its initial viewport position; in use it remains at the viewport bottom as content scrolls. Native text and SVG charts/icons remain resolution independent.

## Validation

Nine Playwright checks cover canonical values, Control Center/finance interactions, hotel financial context, 4K centring, styling isolation, reduced motion, responsive reflow and financial reconciliation. Full Control Center shell Axe WCAG 2 A/AA scan: no violations. No horizontal overflow at phone or double-density reflow widths. TypeScript and whitespace validation run against this revision. This is automated coverage, not exhaustive accessibility certification or a universal device frame-rate claim.

The three-material contract, colors, spacing, borders, motion, status semantics and fallback behavior are recorded in [RADR_APP_DESIGN_SYSTEM.md](RADR_APP_DESIGN_SYSTEM.md).

## Gate

Stop at Control Center. Review this revised candidate with the user before applying it to other product pages.
