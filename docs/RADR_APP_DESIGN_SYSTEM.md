# RADR application design system

Status: Control Center glass revision 2, awaiting visual approval. 2 November 2026.

The user rejected the first material pilot as empty and underwhelming. This revision makes the glass materially visible, restores blue-green contrast, and fills more of the desktop workspace. This feedback supersedes the first pilot’s almost-opaque, almost-shadowless treatment. This system is implemented only on Control Center and its shell. Do not propagate it to Live, Decisions, Operations, Back of House, Intelligence, Value, Memory, Data Health or Connections until the user approves the pilot.

## Product hierarchy

Metrics are context. Decisions are the product. Verified outcomes are proof. Memory retains the learning. Control Center answers “What needs me?” Its primary object is the current scoped Decision, not a performance chart. Record IDs, lifecycle, money, confidence, action links and verification remain canonical data.

The approved backend mockups define a light, spacious, calm direction with more tangible material and stronger focal contrast. Their tablet frame and exterior blue background are presentation, not application UI. Logos remain approved immutable SVG assets through `FrozenRadrLogo`.

## Implementation and scope

`app/radr-material-system.css` defines the material contract. Every selector is scoped to `.rp-root.rp-shell-v2.rp-premium[data-theme=daylight][data-page=control-center]`. This is a pilot activation boundary, not a second app theme. The stylesheet loads after existing compatibility CSS, whose older glass filters and width constraints are neutralized only inside that boundary.

After approval, shared material tokens and primitives can replace compatibility styles in a separate change. Adding unscoped overrides or copying a palette into other pages is not part of this pass.

## Three materials / three depth levels

| Level | Material | Implementation | Use |
| --- | --- | --- | --- |
| 0 | Canvas | `--material-canvas: #eaf1f5`; broad blue and mint illumination over a blue-white base, diffused across 1100–1250px | Atmospheric environment with neutral ivory underneath |
| 1 | Working Glass | Solid fallback `#f7fbfe`; normal rendering near 74% opacity with white-facing borders and highlights; selective 8px backdrop blur | Operating summary, service/arrival readiness and supporting information |
| 2 | Decision Glass | Solid fallback `#123f48`; near-opaque deep teal/forest focus surface, light upper edge, mint marker and mint action/value emphasis | Current recommendation and its action |

Glass means visible material hierarchy. Only the operating-summary and readiness surfaces use an 8px backdrop blur where supported. Their solid fallbacks preserve separation and legibility. Thin light-facing rims and restrained grounding shadows make the surfaces tangible. The Decision uses a near-opaque focus material rather than blur; the proof strip uses one shallow shared field. There are no animated environmental lights, nested blur stacks or heavy reflections.

## Color

| Token | Value | Meaning |
| --- | --- | --- |
| `--material-ink` | `#102b43` | Headings and primary information |
| `--material-secondary` | `#456079` | Supporting information |
| `--material-quiet` | `#506b7f` | Metadata with readable contrast |
| `--material-green` | `#087753` | Decision impact and verified contribution |
| `--material-blue` | `#225da2` | Evidence, analytical links and chart line |
| Action fill | `#82efb4` | Primary Decision action; dark forest label |
| Selected field | `#dcece3` | Active navigation, restrained mint |
| Navigation material | `#eaf1f7` | Pale blue-gray, no sidebar gradient |
| Amber | `#875d24` | Elevated operating pressure or uncertainty |
| Outflow | `#a44856` | Existing cost/deduction context, distinct from urgent risk |

Urgent red remains reserved for material risk states. Source health, Decision confidence, forecast accuracy, modeled performance and verified value are separate concepts. MEDIUM confidence must never be rendered as an invented percentage.

## Typography and numbers

Retain Manrope and the existing product font loader. No new fonts, weights downloaded at runtime, serif accents or raster labels. Headline: 36px, weight 550, line-height 1.24, tracking −1.35px; 40px on wide displays and 28px on phones. Recommendation: 28px, weight 550, line-height 1.3; 32px on wide displays. Its record title is quieter at 15px. Primary operating money is 36px, or 40px on wide displays; Decision impact is 38px in mint. Use tabular numerals, quiet labels and explicitly labeled context.

Metadata is 10–12px with readable foreground colors. The hero uses the same canonical recommendation, MEDIUM confidence, evidence count, status and horizon as the record, without decorative confidence percentages.

## Spacing, composition and radii

Use a 4px rhythm with common 8, 12, 16, 22, 26 and 30px intervals. The editorial heading has breathing room before the performance summary. Four existing metrics sit inside one divided working surface. The Decision and readiness surface share a baseline. Proof values and graph drill-downs share shallow glass fields and internal separators rather than individual cards.

Controls: 8–9px radius. Working surfaces: 14px. Major Decision/readiness surfaces: 20px. No oversized pills. Control Center has a 1360px reading width on desktop, extending to 1680px on wide screens. The main workspace and top bar centre within the space to the right of the rail at 4K; they do not stretch text across the whole monitor.

## Borders and shadows

Working borders are translucent white over a cool blue-gray support edge. Decision borders are green-influenced with a brighter upper rim. Working surfaces use 7–8px low-opacity grounding shadows; the Decision uses a stronger 12px/30px shadow at 13% opacity to establish focus. Insets create a light-facing edge. Hover changes material contrast, not position or scale.

## Chart language

The user explicitly requested more Control Center graphics after the glass and navigation revisions. The overview now uses native SVG revenue trajectories, a contribution ring, signed location pace bars and readiness instruments. These replace the three tiny analytical previews and extend existing KPI presentation; they introduce no new financial model or external data source.

Revenue graphics distinguish recorded values (green solid line), forecast (muted dashed line) and projected future (blue dotted line). All three use the same scale and full period timeline; future points are not rendered as recorded observations. Hotel revenue charts explicitly identify room revenue. The contribution ring uses the existing product/department allocation and labels modeled contribution; product and channel dimensions are never added together. Location bars share a zero baseline, with negative pace drawn to the left and positive pace to the right. Period, scope and currency come from the existing trend/bridge layer.

Readiness rings represent actual percentages or ready/due ratios only. Counts and currency facts use a simple icon/value, without invented progress denominators. MEDIUM confidence is not converted into a percentage. The main Decision remains the priority object.

On desktop, three graphics share a composed row. On phones, they form a swipeable gallery with a visible next-card edge and keyboard-focus scrolling, avoiding a long stack. Each opens the original accessible performance detail. Duplicate operating-area shortcuts move into the existing operating-context disclosure to preserve compactness.

## Motion and performance

Hover and selection: 180ms. Decision arrival: one 200ms opacity / 3px translation, no bounce or overshoot. No perpetual pulse, animated gradient or page transition. `prefers-reduced-motion: reduce` removes transitions and animation. Reduced transparency removes atmospheric fields and uses opaque working surfaces. The design does not depend on backdrop-filter support; reduced transparency disables both selective blur layers and uses solid fills. No new JavaScript dependency, network request, rendering canvas or client state is introduced by the visual system.

## Navigation and command surface

Preserve all current routes, order, collapsed/expanded behavior, pin control and mobile navigation. The approved mark-only logo remains proportional and vector. Rail icons use the existing outline family, normalized to 19px with 1.4px strokes inside the pilot. Selected navigation uses soft mint and a narrow green indicator, not a glowing pill. The search surface is faint and the top bar is transparent, without a second heavy toolbar. Scope, role, Ask RADR and user actions retain their existing behavior.

## Decision and status semantics

The primary Decision reads: attention → ID/location/deadline → record title → recommendation → actual confidence/evidence/status → expected value/horizon → review action. Expected, observed and verified value remain distinct. AWAITING_APPROVAL still displays the existing Recommended lifecycle label and awaiting-judgment attention state. Healthy, watch/degraded, risk and neutral statuses keep their meanings; the pilot only adjusts their material/contrast, not their state model.

## Accessibility and resolution

Maintain explicit focus rings, native buttons/links, keyboard drill-downs, Escape dismissal and focus restoration. All information remains distinguishable without transparency. WCAG A/AA automation is part of the pilot review, alongside manual hierarchy and focus review. SVG marks, SVG charts, native text, borders and icons remain resolution independent. Check desktop, 2560×1440, 3840×2160, a 200%-equivalent reflow viewport and mobile; do not claim a screenshot itself proves every accessibility or device-performance property.

Approval evidence and exact validation results: [visual system audit](RADR_VISUAL_SYSTEM_AUDIT.md).

## Opaque shared navigation refinement

The subsequent user request explicitly extends navigation refinement across the workspace, while the Control Center material approval gate still applies to other page content. `app/radr-navigation.css` is the shared navigation authority and replaces pilot-only rail styling. The rail uses a fully opaque `#edf3f7` surface, opacity 1, no backdrop filter and no background image. Expanded hover, keyboard focus and pinned states retain the same opaque material; the dashboard cannot show through.

The rail retains its 80px collapsed / 248px expanded geometry and existing routes. Refined icon wells, a fine active edge, a quiet contextual line for the active destination, directional hover feedback, restrained workspace control and source-health footer create a deliberate hierarchy without new badges, invented telemetry or extra destinations. Labels reveal over 150–180ms; the width transition is 220ms without bounce. Reduced motion removes transitions. The workspace menu is also opaque. All icon art and the approved SVG logo remain unchanged.

Regression coverage includes pixel-identical rail captures before/after inversion of the underlying dashboard, cross-route opacity, keyboard reveal, workspace links, pinning, Escape, mobile drawer, overflow and WCAG A/AA navigation contrast. Seven combined navigation/Control Center checks pass. Review captures: [expanded](visual-qa/navigation/expanded.png), [collapsed](visual-qa/navigation/collapsed.png), [workspace menu](visual-qa/navigation/workspace.png), [phone drawer](visual-qa/navigation/mobile.png).

## Portfolio investigation and exception briefing

The user-requested portfolio pass adds named hover/focus states, stable venue colours, directly inspectable curves/legends, all-location comparison and a larger performance-detail type scale. Comparison uses percentage pace with a dynamic range; tooltip money is explicitly local currency. The shared trend model now has deterministic fictional outlier/recovery profiles with positive cumulative interval weights and reconciled endpoints. It does not alter Decision economics or create verified outcomes.

Estate watch fills the heading's right-hand space with current-period peer exceptions and opens the existing performance detail. Tab icons on product and marketing use a padded square wrapper around the unchanged approved v4 mark. Full review: [portfolio performance audit](RADR_PORTFOLIO_PERFORMANCE_AUDIT.md).
