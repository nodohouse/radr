# Value-led presentation and balanced wordmark

The user requested proportionate RADR lettering and inline logo sizing, visible social icons, a slightly higher/left tablet and more energy around discovering money.

Four `radr-wordmark-balanced-*.svg` derivatives preserve the original clean assets. The A group is uniformly scaled around its baseline so its top and baseline match the R/D/R: y=43 through y=88. The tight viewBox is `13 43 255 45`. Inline wordmarks use `height: 1cap` and automatic width, matching the surrounding Manrope capital letters. Standalone navigation, product and footer logos retain their own contextual widths. Never independently enlarge the A.

The shared footer includes LinkedIn and Instagram icons. The user explicitly confirmed there are no official social URLs yet. Keep them visible and non-linking until actual profiles are provided; do not invent handles.

`energy.css` adds more vivid green to financial signals and primary actions while retaining the blue/ink material system. The homepage value story uses the existing illustrative supplier case: contract $6.80/L, invoiced $7.45/L, $2,430 expected recovery to investigate, observed pending, verified $0. No recovered-money claim is made. The amount and bars animate when the value readout enters view and respect reduced motion.

The hero tablet starts 24px left and 24px higher on desktop, with smaller phone adjustments. The existing scroll-controlled evidence/action/value sequence still controls the final centered position.

Verification includes cap-height measurements within one pixel across 1512/390/320px viewports, equal SVG letter cap heights, both social marks with no links, responsive routes, mobile closing-title fit and the existing 32 tests. QA remains under `/workspace/work/qa`.
