# RADR application design system

Status: Control Center material pilot, awaiting visual approval. 2 November 2026.

The current user brief supersedes earlier palette experiments. This system is implemented only on Control Center and its shell. Do not propagate it to Live, Decisions, Operations, Back of House, Intelligence, Value, Memory, Data Health or Connections until the user approves the pilot.

## Product hierarchy

Metrics are context. Decisions are the product. Verified outcomes are proof. Memory retains the learning. Control Center answers “What needs me?” Its primary object is the current scoped Decision, not a performance chart. Record IDs, lifecycle, money, confidence, action links and verification remain canonical data.

The approved backend mockups define a light, spacious, calm direction. Their tablet frame and exterior blue background are presentation, not application UI. Logos remain approved immutable SVG assets through `FrozenRadrLogo`.

## Implementation and scope

`app/radr-material-system.css` defines the material contract. Every selector is scoped to `.rp-root.rp-shell-v2.rp-premium[data-theme=daylight][data-page=control-center]`. This is a pilot activation boundary, not a second app theme. The stylesheet loads after existing compatibility CSS, whose older glass filters and width constraints are neutralized only inside that boundary.

After approval, shared material tokens and primitives can replace compatibility styles in a separate change. Adding unscoped overrides or copying a palette into other pages is not part of this pass.

## Three materials / three depth levels

| Level | Material | Implementation | Use |
| --- | --- | --- | --- |
| 0 | Canvas | `--material-canvas: #f5f7f5`; extremely low-opacity blue and mint light fields across 1200–1400px, diffused beyond their origin | Atmospheric environment with neutral ivory underneath |
| 1 | Working Glass | Solid fallback `#f8fbfa`; normal rendering `rgba(250,252,251,.96)`; border `#d8e1df`; white inset highlight | Operating summary, service/arrival readiness and supporting information |
| 2 | Decision Glass | Solid fallback `#edf5ef`; near-opaque green-influenced tonal variation; border `#a7c3b4`; 3px restrained edge marker | Current recommendation and its action |

Glass means material hierarchy. It does not require blur. There are no backdrop-filter layers in the Control Center overview, no glass nested over glass, no animated environmental light, no heavy reflections and no floating drop shadows. The proof strip is plain typography on the canvas, not a fourth material.

## Color

| Token | Value | Meaning |
| --- | --- | --- |
| `--material-ink` | `#192e35` | Headings and primary information |
| `--material-secondary` | `#52656b` | Supporting information |
| `--material-quiet` | `#5f7178` | Metadata with readable contrast |
| `--material-green` | `#086342` | Decision impact and verified contribution |
| `--material-blue` | `#285e88` | Evidence, analytical links and chart line |
| Action fill | `#126443` | Primary Decision action; white label |
| Selected field | `#dcece3` | Active navigation, restrained mint |
| Navigation material | `#eaf0f1` | Pale blue-gray, no sidebar gradient |
| Amber | `#875d24` | Elevated operating pressure or uncertainty |
| Outflow | `#97515a` | Existing cost/deduction context, distinct from urgent risk |

Urgent red remains reserved for material risk states. Source health, Decision confidence, forecast accuracy, modeled performance and verified value are separate concepts. MEDIUM confidence must never be rendered as an invented percentage.

## Typography and numbers

Retain Manrope and the existing product font loader. No new fonts, weights downloaded at runtime, serif accents or raster labels. Headline: 36px, weight 550, line-height 1.24, tracking −1.35px; 40px on wide displays and 28px on phones. Recommendation: 25px, weight 550, line-height 1.3; 29px on wide displays. Its record title is quieter at 15px. Primary money is 33px, or 38px on wide displays. Use tabular numerals, quiet labels and explicitly labeled context.

Metadata is 10–12px with readable foreground colors. The hero uses the same canonical recommendation, MEDIUM confidence, evidence count, status and horizon as the record, without decorative confidence percentages.

## Spacing, composition and radii

Use a 4px rhythm with common 8, 12, 16, 22, 26 and 30px intervals. The editorial heading has breathing room before the performance summary. Four existing metrics sit inside one divided working surface. The Decision and readiness surface share a baseline. Proof values and graph drill-downs use separators rather than individual cards.

Controls: 8–9px radius. Working surfaces: 14px. Major Decision/readiness surfaces: 18px. No oversized pills. Control Center has a 1200px reading width on desktop, extending to 1480px on wide screens. The main workspace and top bar centre within the space to the right of the rail at 4K; they do not stretch text across the whole monitor.

## Borders and shadows

Working border: 1px cool neutral `#d8e1df`. Decision border: 1px green-influenced `#a7c3b4`. Separators use lower-contrast gray-green. Insets give a slight light-facing edge; the primary Decision has only a 2px, 1.5%-opacity grounding shadow. Hover changes surface contrast, not elevation or scale.

## Chart language

Existing charts remain native SVG and retain their existing datasets and drill-down behavior. The compact revenue line is analytical blue, forecast is a fine muted dashed line. Avoid plot boxes and heavy gridlines. Contribution and location marks retain their existing data and semantic colors. The three compact entry points form one analytical strip; full evidence appears on request in the existing accessible performance dialog. No chart screenshots or new charts are introduced.

## Motion and performance

Hover and selection: 180ms. Decision arrival: one 200ms opacity / 3px translation, no bounce or overshoot. No perpetual pulse, animated gradient or page transition. `prefers-reduced-motion: reduce` removes transitions and animation. Reduced transparency removes atmospheric fields and uses opaque working surfaces. The design does not depend on backdrop-filter support. No new JavaScript dependency, network request, rendering canvas or client state is introduced by the visual system.

## Navigation and command surface

Preserve all current routes, order, collapsed/expanded behavior, pin control and mobile navigation. The approved mark-only logo remains proportional and vector. Rail icons use the existing outline family, normalized to 19px with 1.4px strokes inside the pilot. Selected navigation uses soft mint and a narrow green indicator, not a glowing pill. The search surface is faint and the top bar is transparent, without a second heavy toolbar. Scope, role, Ask RADR and user actions retain their existing behavior.

## Decision and status semantics

The primary Decision reads: attention → ID/location/deadline → record title → recommendation → actual confidence/evidence/status → expected value/horizon → review action. Expected, observed and verified value remain distinct. AWAITING_APPROVAL still displays the existing Recommended lifecycle label and awaiting-judgment attention state. Healthy, watch/degraded, risk and neutral statuses keep their meanings; the pilot only adjusts their material/contrast, not their state model.

## Accessibility and resolution

Maintain explicit focus rings, native buttons/links, keyboard drill-downs, Escape dismissal and focus restoration. All information remains distinguishable without transparency. WCAG A/AA automation is part of the pilot review, alongside manual hierarchy and focus review. SVG marks, SVG charts, native text, borders and icons remain resolution independent. Check desktop, 2560×1440, 3840×2160, a 200%-equivalent reflow viewport and mobile; do not claim a screenshot itself proves every accessibility or device-performance property.

Approval evidence and exact validation results: [visual system audit](RADR_VISUAL_SYSTEM_AUDIT.md).
