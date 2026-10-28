# Decision Gap review

The section presents the data sources, RADR's comparison, and the resulting insight, recommended action, and verified outcome. Text remains visible throughout the five-phase emphasis cycle. Pause/replay controls, viewport gating, background-tab suspension, and a complete reduced-motion static view are included.

Run `node docs/visual-qa/decision-gap/verify.mjs` against the local site on port 3000. The check uses the workspace Playwright installation and system Chromium. It covers 1512, 1920, 1024, 768, 390, and 430 px widths, text overflow, source/result visibility, reduced motion, phase advancement, pause, replay, and browser errors.

All browser checks passed. `desktop.png` and `mobile.png` capture the reduced-motion view with all steps emphasized. The hero component and geometry styles remain unchanged. The automated test suite passed all 32 tests; lint and TypeScript checks passed.
