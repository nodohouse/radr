# Control Center visual system audit

2 November 2026. Scope: Control Center and the shell that renders it. Status: frozen for user visual approval before propagation.

[Before / after comparison](visual-qa/control-center-comparison.png)

## Scope and authority

Applied the user-supplied **RADR APP — PREMIUM VISUAL SYSTEM PASS**. Read the approved `radr_control_center_dashboard.png` mockup as a light application reference, excluding the device bezel and exterior background. Product architecture, navigation routes, Decision logic, financial models, source records and product thesis remain unchanged.

Every new material selector is scoped to the Control Center root. Other pages continue using the existing visual system; no Live, Decisions, Operations, BOH, Intelligence, Value, Memory, Health or Connections component was edited. The new design contract is [RADR_APP_DESIGN_SYSTEM.md](RADR_APP_DESIGN_SYSTEM.md).

## Visual diff

| Aspect | Before | Material pilot |
| --- | --- | --- |
| Canvas | Flat ivory underneath conventional cards | Continuous ivory with very low-opacity, large blue/mint light fields; no visible blobs or animated wallpaper |
| Operating context | Four separately rounded metric cards | One divided Working Glass surface using the same four metrics and drill-downs |
| Primary Decision | Dark blue card with bright green value | Near-opaque light Decision Glass, green-influenced edge, stronger recommendation typography and restrained forest action |
| Decision hierarchy | Record title led the composition | Recommendation is the strongest text; record title, actual confidence, evidence count and lifecycle stay secondary |
| Proof summary | Four additional card-like blocks, including a blue verified block | Unboxed typography and separators on the canvas; green identifies verified contribution |
| Analysis entry points | Three independent bordered cards | One quiet analytical strip with existing native SVG chart marks and original drill-downs |
| Typography | Similar emphasis across cards | Editorial heading, instrumentation-style numbers, quiet labels and deliberate recommendation hierarchy |
| Borders / depth | Conventional borders, inherited layered glass filters | Two defined surface materials, subtle borders/inset highlights; no backdrop-filter on overview surfaces |
| Navigation | Pale rail with larger active field | Same architecture and behaviors, restrained mint field, narrow green marker and normalized outline strokes |
| Top bar | More visible blue-tinted toolbar | Transparent bar, faint command surface and quieter profile accent |
| Wide rendering | Existing main-shell width cap left content aligned to one side | Scoped width correction centres the workspace and top bar at 4K, capped at a readable 1480px |
| Motion | Inherited mixed surface behavior | 180ms interaction tint and one 200ms/3px Decision arrival; reduced-motion removes both |

The primary Decision remains fully visible at 1512×982. Supporting analysis and the longer operating queue stay below or behind their existing drill-downs. No charts, product modules or integration capabilities were added. No large photographic or illustrative background is used.

## Data integrity

D-1911 remains `dec_peak_berlin`, Peak capacity collision, Soho · New York, USD 620 expected incremental contribution for tonight versus seat-now. Its recommendation remains “Hold next seating wave for 12 min.” Confidence is the record's MEDIUM band, not the brief's illustrative 82%. Six evidence items and the Recommended lifecycle label derive directly from that record. No amount, forecast, status, source quality or verification state changed.

Restaurant financial summary still shows revenue $18,420, deductions $11,230, contribution $7,190 and projected day close $26,800. Day/week/month, revenue timeline, contribution attribution, location comparisons, approval links and hotel department drill-downs retain their original behavior and data. Expected value is not presented as verified value.

## Captures

All are Chromium screenshots of the real rendered product, with native text and SVG UI rather than screenshot-based surfaces.

| Capture | Dimensions / purpose |
| --- | --- |
| [Before](visual-qa/control-center-before.png) | 1512×982 |
| [After](visual-qa/control-center-after.png) | 1512×982 |
| [Full HD](visual-qa/control-center-after-1920x1080.png) | 1920×1080 |
| [QHD](visual-qa/control-center-after-2560x1440.png) | 2560×1440 |
| [4K](visual-qa/control-center-after-3840x2160.png) | 3840×2160, centred composition and vector rendering |
| [200% equivalent reflow](visual-qa/control-center-after-200-percent-reflow.png) | 756×491 CSS viewport at DPR 2, full document; equivalent layout density for a 1512×982 display at 200%, not a claim that browser chrome zoom was automated |
| [Phone](visual-qa/control-center-after-mobile.png) | 390×900 CSS viewport, full document |

Full-document phone captures place the fixed navigation at its initial viewport position. In use, it stays at the viewport bottom while content scrolls. No horizontal overflow was found at phone or double-density reflow widths.

## Validation

- TypeScript and targeted ESLint checks pass. Diff whitespace check passes.
- Nine Playwright tests pass: executive brief and finance dialogs, hotel context, canonical Decision fidelity, WCAG checks, 4K centring/native vector UI, route styling isolation, reduced motion and responsive reflow, financial reconciliation, revenue/product/channel drill-downs and hotel contribution attribution.
- Axe WCAG 2 A/AA checks report zero violations in the main Control Center and in the full Control Center root including its shell. This is automated coverage, not a claim of exhaustive accessibility certification.
- Existing keyboard focus, dialog Escape dismissal, scroll locking and trigger-focus restoration remain verified by the workflow suite. Focus rings retain strong analytical-blue outlines.
- The approved SVG logo is unchanged. Charts are SVG and native text; no canvas or raster UI was introduced. Normal and high-resolution captures retain crisp geometry.
- The overview uses no backdrop-filter, continuous animation, new dependency, data request or new client state. Reduced transparency has an opaque fallback. Actual frame rate still depends on device and browser; this audit does not claim a universal measured 60fps.

## Approval gate

Stop here. Review the comparison and live Control Center pilot with the user. Do not propagate materials or compose other product pages until the user explicitly approves this direction, as required by the supplied brief.
