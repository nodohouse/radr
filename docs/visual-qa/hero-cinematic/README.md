# Cinematic native hero demo

**Continuous-autoplay update:** playback controls and manual scene selection have since been removed. The controls-based checks below describe the historical revision. Use `../continuous-motion/verify.mjs` for the current site-wide behavior.

Approved reference: `docs/visual-qa/current-1512x982.png`, referenced by repository path only. Changes are confined to `HeroTablet.tsx` and the interior stylesheet `hero-tablet.css`. Physical device geometry, hero composition, headline, photography, approved logo assets, and all other homepage sections are unchanged.

## Timeline

- Immediately: complete Control Center, 3 decisions, $12.4K opportunity, +8% KPI, chart, supplier signal.
- 0.5s: chart subtly completes its stroke; decision metric receives restrained emphasis.
- 1.5s: supplier signal gains a border/light change and lifts 3px.
- 2.7s: shared signal surface opens into Decision over 550ms.
- 3.3–3.81s: evidence, exposure, recommendation, and action availability progress in small deliberate offsets. Lifecycle indicator moves from Evidence to Recommendation.
- 4.5s: action preparation appears in three staggered subordinate steps. Approval remains with the team; no click or actual supplier action is simulated.
- 5.6s: Value opens: Expected $2,430, Observed Pending, Verified $0.
- 9.0s: smoothly return to Control Center after a settled Value hold; repeat.

Mobile uses Control Center and Decision only on a seven-second loop. Reduced motion presents the complete static Control Center. One subtle persistent `ILLUSTRATIVE DEMO` label establishes context. Small product-scene controls and pause/play remain inside the tablet.

The timeline preserves elapsed time when paused, outside the visible hero, while the page scrolls away, or in a background tab. In-progress surface transitions finish into complete states; returning resumes the retained story rather than resetting it.

## QA

Run with production app on localhost:3000:

`PLAYWRIGHT_BROWSERS_PATH=/workspace/radr-visual-tools/browsers node docs/visual-qa/hero-cinematic/verify.mjs`

The script records 15 seconds at 1512×982, 1920×1080 and 3840×2160. It checks actual timing, original device geometry at existing baselines, frame-by-frame device stability and content fit, expected/observed/verified semantics, a single demo label, reduced motion, mobile phases, pause/play, scene selection, scroll-away and re-entry behavior, and native UI at 2× pixel density. Frame-time statistics are recorded as observations from the instrumented recording environment, not a production performance guarantee. No recordings are embedded in the website.

## Completed verification and performance limits

The production build, ESLint/TypeScript checks and 32 automated tests passed. Current browser checks passed at all three recording resolutions, mobile and 2× pixel density with no browser errors, no content clipping, and unchanged device geometry. Screenshot work is kept out of the recording pass to avoid distorting motion capture.

A separate 10-second, unrecorded headless-browser measurement is in `unrecorded-frame-check.json`: median frame interval was 16.7ms at 1512px and 33.4ms at 3840px. Instrumented 4K video capture is substantially slower. The 60fps goal is therefore not certified at 4K in this cloud environment; validate the live page on target GPU-equipped hardware. No video, canvas, WebGL, or heavy animation dependency is used by the product demo itself.
