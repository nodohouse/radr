# Animated Solutions operating story

**Continuous-autoplay update:** playback controls and manual scene selection have since been removed. The controls-based checks below describe the historical revision. Use `../continuous-motion/verify.mjs` for the current site-wide behavior.

The latest supplied reference replaces the Solutions hero's former portfolio dashboard. Implementation: `components/marketing/SolutionsStory.tsx` and `solutions-story.css`. The homepage hero, its tablet animation/position, confirmed pricing, compact legal footer, and lower Solutions content remain unchanged.

The native interface includes six source feeds (POS, PMS, Reservations, Finance, Procurement, Labor), moving blue packets converging into the RADR operating-state core, green outbound packets, two future comparisons, a seating-pace decision, and outcome tracking. All text is present immediately. The glass surfaces use the existing repository photo `/images/radr-coastal-pavilion.webp`; the supplied reference screenshot is not embedded or rasterized into the site.

An approximately 10.5-second cycle guides Observe → Contextualize → Compare → Decide → Outcome, then repeats. Pause freezes signal travel; Replay restarts it while preserving control focus. Stage buttons allow deliberate exploration. Offscreen and background-tab motion suspends; reduced motion uses static connections and fully readable content. Mobile/tablet layouts reflow the same narrative rather than shrinking an unreadable desktop image.

Every number is contextualized as an illustrative scenario. Expected +$620 remains separate from Observed Pending and Verified $0. Confidence is labeled illustrative. The demo sends no action; team review and approval remain explicit.

## Verification

With the production site on port 3000:

- `node docs/visual-qa/solutions-story/verify.mjs`: 13 widths, card/text fit, reduced motion, incoming/outgoing movement, pause, replay, focus, stage exploration, offscreen suspension, and truth labels.
- `PLAYWRIGHT_BROWSERS_PATH=/workspace/radr-visual-tools/browsers node docs/visual-qa/solutions-story/record.mjs`: a 12-second real browser recording and full autoplay-stage sequence assertion.

Artifacts: `desktop.png`, `wide.png`, `mobile.png`, `solutions-1512.mp4`, `results.json`, and `timeline.json`.

The production build, TypeScript, lint, and all 32 tests passed. An initial PGlite setup timeout during concurrent recording was resolved by rerunning the unchanged test suite without recording load.

Final results: all 13 viewport checks and all six motion/interaction groups passed with zero browser errors. Source-port alignment was also checked at 1920, 1512, 850 and 390px. The recording's stage observer confirmed the complete 0 → 1 → 2 → 3 → 4 → 0 loop; see `timeline.json`.
