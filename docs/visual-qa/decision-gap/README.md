# Visible data-flow animation

This supersedes the earlier step-card emphasis implementation. Blue illuminated packets travel along source-system curves into the RADR operating-state core. Green packets leave it on separate paths to Insights, Futures, Recommendations, Actions, and Verification. Source data and result meanings remain readable throughout. Mobile uses its own vertical path geometry.

- `verify.mjs`: eight widths (320–1920px), source/result visibility, text overflow, reduced motion, measured SVG travel, frozen stroke positions during pause, replay/resume, offscreen pause, browser errors.
- `record.mjs`: 12-second live recordings at 1512×982 and 1920×1080, encoded with system FFmpeg. The site does not embed these videos.
- `flow-1512.mp4` / `flow-1920.mp4`: review the actual animation here.
- `desktop.png` / `mobile.png`: current responsive composition.
- `results.json`: browser assertions.

Run against localhost:3000 using the workspace Playwright installation and system Chromium. For recordings set `PLAYWRIGHT_BROWSERS_PATH=/workspace/radr-visual-tools/browsers`.

The hero, its tablet geometry, commercial pricing, and confirmed-only legal identity policy are preserved.

Final checks: 32 tests, ESLint and TypeScript passed. The cross-page suite passed 51 route/layout checks and five interaction groups with zero browser errors. `verify-scenes.mjs` additionally confirmed actual travel and pause on Platform, Solutions, and Company. The secondary controls render consistently on server and client; CSS supplies their reduced-motion presentation.

The final production Next.js build passed. No environment configuration, production credentials, or hero geometry were changed.
