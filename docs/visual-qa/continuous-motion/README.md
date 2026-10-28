# Continuous animation across public pages

Current behavior supersedes earlier controls-based animation reviews:

- No pause, play, replay, or manual demo-scene buttons.
- The homepage tablet cycles automatically and keeps running during hover and scrolling while it remains visible.
- Decision Gap, Platform foundation, Solutions diagrams, and Company infinity keep their native signal flows moving while visible.
- Solutions progress labels are non-interactive; the story loops without user intervention.
- Reduced motion remains static. Offscreen/background suspension is retained for efficiency.
- Product tabs, calculators, forms, and ordinary navigation remain functional.

Run `node docs/visual-qa/continuous-motion/verify.mjs` against production localhost:3000. It scans 17 public routes at desktop/mobile widths for playback controls, observes a complete homepage cycle and continued progress after scrolling/hovering, checks real SVG movement in four diagrams, observes the complete Solutions loop, and verifies reduced-motion behavior. Results are stored in `results.json`.

Prior recordings and scripts in feature QA folders document historical control-enabled revisions; this verifier is authoritative for the current motion policy.

Completed verification: production build (including lint and TypeScript), 34 public-page scans (17 routes × desktop/mobile), six flow/loop checks, and reduced-motion checks passed with zero browser errors. Visible animation continues through hover and scrolling; no playback controls remain in rendered public pages.
