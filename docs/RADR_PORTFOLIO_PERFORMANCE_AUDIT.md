# Portfolio performance, exception watch and tab icons

2 November 2026. User-requested refinement of Control Center performance details, demo trajectories, typography, tab icons and the previously empty heading area.

## Location identity and investigation

Comparison lines now identify the exact venue on hover and keyboard focus, with time, local currency and the recorded/projected value. A wide invisible hit path makes thin curves practical to target. The active venue receives a stronger line and matching point marker; other lines recede. Colours stay tied to venue identity when comparison membership changes. Blank plot space does not arbitrarily select a distant line.

Click a curve or legend entry to focus that location, update the location selector and financial context, and reveal its illustrative operating story. All canonical estate locations are available in the selector and location tape; comparison is no longer limited to two peers or six visible venue choices. The tape supports adding/removing comparisons and a separate Inspect action. Percentage comparison avoids mixing local-currency revenue on one axis. The focused venue's money remains in its own currency; group reporting continues to use the existing demo FX layer.

The comparison range derives from the plotted values, so large outliers are not clipped by the former fixed 85–115% range. Forecast and projected lines remain visually distinct from recorded revenue. Event markers and source-labelled fictional driver panels give the demo a useful investigation path without claiming real provider evidence or verified causality.

## Demo dataset

`lib/product/performanceTrend.ts` remains the single trajectory source. Positive, uneven interval weights produce cumulative curves with meal/arrival steps, dips in pace, event spikes and recoveries, rather than proportional straight lines. Cumulative revenue never falls backwards, actuals stop at the snapshot, projections start exactly at the last recorded value, and forecast/projected endpoints reconcile.

Seven explicit fictional profiles cover on-pace trading, strong conversion, a service/cancellation interruption, group pickup, weak demand, recovery and an event outlier. Featured daily pacing totals are preserved. Non-featured daily examples range from −21.6% to +27.2%; week/month profiles vary as well. Hotel and restaurant narratives use their own operating vocabulary. These are deterministic fictional scenarios, not observed causes, real integrations or verification claims.

## Estate watch

A compact briefing uses the heading's empty right-hand area. It shows the weakest and strongest venue in the applicable demo peer/selection cohort, plus the count at least 10% behind forecast pace. It follows the selected Day/Week/Month period and opens the existing location-comparison detail. It is an exception shortcut, not a new product module or an invented Decision. The primary scoped Decision and canonical evidence remain unchanged. The shared Live destination remains in navigation.

## Readability

Performance labels, selectors, readouts, contribution tables, explanatory text and detail tabs are larger. Chart axes use native SVG text at 12–13px; active hover values are larger still. State and venue names are explicit rather than relying on colour alone. Overview composition remains compact and phone layouts retain no horizontal document overflow.

## Product and marketing tab icons

The older icon used a cropped legacy viewport. Product `app/icon.svg`, public favicon SVGs and the marketing metadata now use the approved v4 mark in a square wrapper that preserves its full original viewBox and intrinsic padding. Master path geometry, focal-dot position and brand colours are unchanged. PNG favicon and Apple icon sizes are rendered from that same SVG wrapper. Marketing icon URLs include a cache-busting version.

Small-size inspection: at 16px the mark stays inside pixels 2–13 horizontally and 3–12 vertically; at 32px it stays inside pixels 3–28 / 7–25. No mark touches an outer edge. Product and marketing HTML references were checked separately.

## Verification and review

A 20-check regression pass covers financial invariants, period switching, chart interactions, hotel context, compactness, navigation opacity and source isolation. The focused four-check portfolio suite also passes, including the added all-location keyboard comparison case: 21 distinct checks verified overall. TypeScript, targeted ESLint and whitespace checks pass. Full-shell and performance-dialog Axe WCAG A/AA scans report no violations. Phone and double-density reflow have no horizontal document overflow.

[Estate watch](visual-qa/portfolio/estate-watch.png) · [Line hover](visual-qa/portfolio/line-hover.png) · [Location drill-down](visual-qa/portfolio/location-drilldown.png) · [Favicon](visual-qa/portfolio/favicon.png)
