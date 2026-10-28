# Hero tablet animation QA

Historical first animation pass. The current cinematic timeline, 15-second recordings, native 4K checks, and pause/resume behavior are documented in `../hero-cinematic/README.md`; use `../hero-cinematic/verify.mjs` for the current implementation.

Approved visual reference: `docs/visual-qa/current-1512x982.png` (repository file path only). The reference is not embedded in the page or the QA tooling.

Only the native interface inside the existing hero tablet was changed. `ReferenceHero.tsx` delegates the existing shell/dashboard to `HeroTablet.tsx`; `hero-tablet.css` is scoped to that interior. The original hero stylesheet, device geometry, photo, logo, headline, copy, navigation, CTA layout, and other homepage sections were not edited.

## Sequence

- 0–0.8 s: readable Control Center; chart gently completes its stroke.
- 0.8 s: supplier variance signal gains emphasis.
- 1.4–1.8 s: shared supplier-signal element transitions into Decision.
- Decision: contract $6.80/L, invoiced $7.45/L, exposure $2,430; dispute recommendation and the six lifecycle labels.
- 3.5 s: action preparation appears; human approval remains explicit and the demo sends nothing.
- 4.5 s: Value begins its transition. Expected $2,430; Observed Pending; Verified $0.
- 6.8 s: return to Control Center after about two seconds of settled Value.
- 7.6 s: restart the sequence.

Desktop and tablet widths receive the full sequence. Mobile (≤700 px) shows Control Center → Decision → Control Center. Reduced-motion preference keeps Control Center static, including after preference changes. Offscreen/hidden-tab timelines stop and restart from Control Center when visible.

Uses the existing `motion/react` package (Framer Motion), native HTML and SVG. No new dependency, WebGL, GIF, video playback, dashboard rasterization, or base64 reference asset is used by the website. Recordings below are QA artifacts only.

## Evidence

- `hero-1512x982.mp4`: 12-second canonical viewport recording.
- `hero-1920x1080.mp4`: 12-second wide viewport recording.
- `<width>-<phase>.png`: Control Center, Decision, Action, and Value frames.
- `reduced-motion-mobile.png`: static mobile Control Center.
- `geometry-before.json`: approved pre-change element geometry measured before editing.
- `results.json`: timings, geometry comparisons, clipping checks, mobile/reduced-motion checks, JavaScript errors, and rendering frame samples.

The same physical device bounding box is checked every animation frame and compared against the original geometry within 0.02 CSS px. Settled UI states are checked for overflowing content throughout each recording. Visual inspection checked the state captures and transition frames for overlap and readability. The source diff is restricted to the hero component, its new interior component/styles, and this QA directory.

Observed median requestAnimationFrame interval was 16.7 ms at both viewports, with 33.4 ms 95th-percentile intervals during recording/screenshots. This supports the 60 fps target but is not a guarantee of sustained 60 fps on physical devices. Videos use the browser recorder's capture cadence and are not a 60 fps benchmark.

## Rerun

Start the app on port 3000, then from `/workspace/radr`:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/radr-visual-tools/browsers \
NODE_PATH=/workspace/radr-visual-tools/node_modules \
node docs/visual-qa/hero-animation/record.mjs
```

Requires the external Playwright installation, `/usr/bin/chromium`, and system FFmpeg. In this environment the Playwright FFmpeg executable path points to `/usr/bin/ffmpeg`; raw recordings remain ignored. The script trims/encodes each recording to 12 seconds, verifies desktop/mobile/reduced-motion behavior, and exits nonzero on failed assertions.

Production build, TypeScript, ESLint, and all 28 existing tests passed for this change. File-level regression checks confirmed the original hero geometry stylesheet, homepage composition, navigation, and lower section sources remain byte-for-byte unchanged. MP4 dimensions and actual durations were independently checked with FFprobe.
