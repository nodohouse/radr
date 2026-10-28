# RADR reference implementation lock

Read this document and `visual-qa/implementation-brief.txt` before changing public marketing UI. The original brief is retained verbatim; later user instructions supersede its missing-asset stop rule: create an architectural background inspired by the supplied image and use the uploaded logo assets.

## Starting state and scope

- Branch: `radr-reference-rebuild`.
- Starting commit: `10592c1933c37f86dce1d5a664efab69eb5a6fd4`; working tree was clean.
- Canonical viewport: 1512 × 982; routes: `/` and `/en`.
- The user approved the header and hero in chat and authorized continuing. The full reference sequence now replaces the old homepage. The user approved the full page and it is deployed through Vercel’s preview integration on `radr-reference-rebuild`.

## Header and hero geometry

- Hero: 1050 px tall at canonical width, overflow clipped.
- Header: 112 px tall, max width 1512 px, horizontal inset 78 px.
- Header logo: 145 px wide, intrinsic SVG aspect ratio preserved.
- Navigation: 15 px type, 38 px gap; links point to existing functional pages.
- Copy starts at x=78, y=324. Eyebrow: 12 px, 3 px tracking.
- Headline: 78 px, 1.07 line height, -3 px tracking; two lines. Branded second line uses the unmodified supplied wordmark.
- Supporting copy: 21 px, 1.55 line height. Buttons: 15 px, 21 × 31 px padding, pill radius.
- Dashboard shell: width 790 px, height 556 px, left 46%, top 385 px; perspective 1600 px, Y rotation -10°, X rotation 3°, Z rotation -1.6°.
- Dashboard shell radius 35 px, inner radius 23 px, card radius 11 px. Sidebar width 172 px.

## Assets, surfaces, and colors

- Original supplied logo SVG files are retained unchanged under `public/brand/`. The user subsequently authorized outline cleanup; current homepage assets and rationale are documented in the logo revision section below.
- Generated photographic architecture plate: `public/images/radr-coastal-architecture.webp` (1536 × 1024). This is a newly generated interpretation, not an exact reconstruction or a 4K-approved asset.
- Photography contains no baked-in interface, logo, text, or controls. Background uses cover cropping plus dark overlays for contrast.
- Base deep teal #102b2c; hero text #f8faf6; supporting text #e1e5df; accent #30bb98; dashboard surfaces warm translucent ivory; analytical blue used only in product details.
- Charts and product UI remain native SVG/HTML/CSS. Preview metrics are explicitly labeled illustrative. Product mockup is noninteractive; primary navigation and CTA links work.
- CSS is scoped under `rh-` to avoid altering existing lower sections and application screens.

## Validation and review

- Captures: `visual-qa/current-1512x982.png`, `visual-qa/current-390x844.png`.
- Measured geometry and browser checks: `visual-qa/results.json`.
- Rerun with the locally installed browser: `NODE_PATH=/workspace/radr-visual-tools/node_modules node docs/visual-qa/capture.mjs` while the development server runs on port 3000. Requires Playwright and system Chromium. Optional `CHROMIUM_PATH` selects another installed Chromium.
- Optional `RADR_REFERENCE=/absolute/path/to/reference.png` creates a 50% overlay and copies the original under `visual-qa/`. Original reference exists only inline in chat; no exact overlay or numeric fidelity claim has been made.
- Visual inspection corrected missing arrow glyphs by using SVG and reduced mobile dashboard scale to fit.
- Hero approval was given in chat. Each remaining chapter has an individual screenshot. See `visual-qa/README.md` and `results.json` for full-page captures, responsive outcomes, and limitations.

## Verification results

28 tests, ESLint, TypeScript, and the full-page production build passed. Browser checks passed at nine viewport sizes with no page errors, failed HTTP responses, image failures, horizontal overflow, or hidden hero content. The final build used an ephemeral build-only auth secret; no credential was persisted or changed. A deployment needs its own production authentication configuration. Production font downloads succeed with the published network settings.

## Remaining chapter rules

- Sequence: systems strip → Decision Gap → decision panel → hospitality → Value Map → final architectural CTA. Do not restore the abandoned twelve-section narrative to this homepage.
- Shared content max width: 1356 px; canonical horizontal insets: 78 px. Shared body font: Arial/Helvetica. Chapter headings: 50–54 px, normal weight, tight tracking, 1.12 line height. Body: 20 px, 1.55 line height. Eyebrows: 12 px, 3 px tracking.
- Systems strip: deep teal, six outlined tiles. Decision Gap: dark-to-pale teal gradient with native SVG connectors and a green operating-state core.
- Decision panel: translucent ivory/mint surface with 27 px radius, 39/61 copy/product columns. Six native buttons expose evidence, state, futures, recommendation, action, verification. The action is an illustrative local interaction and sends nothing.
- Hospitality: warm ivory #f0efe8, 48/52 copy/cards columns, two selectable cards. Faded unselected state follows the reference.
- Value Map: warm ivory, four native metric labels around a 225 px green center. Figures are explicitly illustrative. CTA opens a native dialog with local scenario inputs. Do not imply results are verified or guaranteed.
- Closing scene: generated coastal pavilion WebP, left dark gradient, original SVG wordmark embedded in the headline, two functional CTAs, compact legal footer. No generic footer banner.
- At ≤900 px, lower chapters stack and mobile navigation becomes a native disclosure. At 701–1024 px, the hero dashboard sits below the copy to avoid overlapping the CTAs. Desktop hero geometry remains as approved.
- Optimized WebP photographs are about 322–336 KiB each. Logos, chart, icons, connectors, and product UI remain native/vector.
- The obsolete source-string homepage test was replaced by an exact hash check of the supplied logo masters. Actual homepage behavior is exercised by the saved browser QA script.

## Logo outline cleanup — user-requested revision

The user reported visible pixels in the enlarged wordmark and explicitly requested higher-quality rendering. The supplied traced SVGs contained integer-coordinate staircase contours, so increasing raster dimensions alone could not fix the source outline.

The homepage now uses `radr-wordmark-clean-white.svg`, `radr-wordmark-clean-monochrome-black.svg`, and `radr-mark-clean-white.svg`. These are separate derivatives with straight diagonal edges, cubic letter bowls, and a circular accent dot. The original supplied assets remain byte-for-byte unchanged and their hash tests still pass. This revision preserves the original placement, cap height, split A construction, spacing, colors, and overall dimensions while smoothing the contours; it is not an assertion of identical original path geometry.

Rebuild derivatives with `node scripts/brand/build-clean-logos.mjs`. The website uses SVG, not a 4K bitmap. Additional transparent 3840 px-wide PNG exports are in `docs/visual-qa/radr-logo-4k-white.png` and `radr-logo-4k-black.png`; `logo-before-after.png` shows the outline change enlarged.

The user connected Vercel’s Git integration and confirmed the branch preview works at `https://radr-41j4-git-radr-reference-rebuild-nodo13.vercel.app/`. Push updates to `radr-reference-rebuild`; do not modify `main` for this workflow. The environment cannot independently query Vercel due to network policy, so distinguish a successful push from a confirmed finished deployment.

## Navigation pages — approved scope expansion

After approving the homepage, the user requested the other navigation destinations match it. `ReferenceNav` is now shared by the homepage and the public page shell. Retain its logo, dimensions, active-page indication, and working mobile disclosure. Value Calculator now navigates to `/value-calculator`; the original homepage Value Map remains intact.

- Shared page composition: `MarketingShell.tsx`; page content: `MarketingPages.tsx`; interactive solution explorer and dedicated calculator: `MarketingInteractions.tsx`; scoped styles: `marketing-pages.css` (`rp-` prefix).
- Main destinations: Platform (`/how`), Solutions, Value Calculator, Pricing, Company, and Contact. The authentication shell, Security, and legal chrome use the same visual language. Existing auth logic, contact action, security controls, and legal copy are preserved.
- Interior pages use the same generated architecture, 1356 px content width, 78 px canonical insets, clean SVG branding, ivory/forest palette, editorial headings, and restrained mint glass surfaces. These are extensions of the approved homepage language, not exact additional reference screenshots.
- Pricing was subsequently updated with explicit user confirmation: Starter $1,500/month and Multi-site $3,500/month, billed annually; Enterprise custom. `pricing/config.ts` is the commercial source of truth. Legacy free/control/scale property keys remain for source compatibility, but their displayed plans and amounts are updated. Billing remains inactive and feature availability is scoped.
- The dedicated calculator models one area at a time to avoid cross-category double counting. Baseline × assumed improvement × locations × optional 12 months. Assumptions are user-controlled; results are explicitly illustrative and not verified financial outcomes.
- Contact UI retains the existing server action. Invalid-input handling is browser-tested. Actual inquiry delivery still depends on the existing configured webhook or published inbox and is not claimed as validated by these visual checks.
- Navigation QA: `docs/visual-qa/navigation.mjs` checks all 14 public routes at 1512, 390, and 768 px widths and exercises native FAQs, solution selection, calculator arithmetic, mobile navigation, contact validation, and password visibility. Captures use route-prefixed filenames. See `navigation-results.json` for outcomes.

Navigation revision verification: production build, ESLint, TypeScript and all 28 unit/integration tests passed. Browser QA passed 42 route/viewport checks (14 routes × desktop/mobile/tablet), all five interactive test groups, and the original homepage regression suite at nine viewport sizes. The final visual correction replaced unsupported solution-tab arrow glyphs with native SVG and improved small-screen hero text contrast.

## Hero tablet animation pass

Animate only the native interface in `HeroTablet.tsx` with the existing `motion/react` (Framer Motion) dependency. The physical `.rh-device` and original hero stylesheet remain fixed. Desktop: Control Center → supplier Decision → action preparation → Value → Control Center. Mobile ≤700 px: Control Center → Decision only. Reduced motion is static Control Center. Timelines pause offscreen and in hidden tabs.

Always retain the distinction between Expected $2,430, Observed Pending, and Verified $0. The action remains illustrative and requires human approval; it sends nothing. Blue denotes evidence, green decision/action/value. No bounce or overshoot. The shared supplier-signal transition finishes before decision details fade in.

Reference path: `docs/visual-qa/current-1512x982.png`. Reference it by file path, never embed it as base64. QA, pre-change geometry, state captures and two 12-second recordings live in `docs/visual-qa/hero-animation/`. See that directory's README and results for actual timing, clipping, motion preference, mobile, and geometry checks. Other homepage sections are outside this animation task.

## Full multi-page mockup set and legal placeholder rule

The user supplied additional mockups for Platform, Solutions, Value Calculator, Pricing, Company and the expanded closing/footer design, then explicitly authorized implementation. These replace the earlier interior-page compositions. Components are now `MockupPages.tsx`, `MockupVisuals.tsx`, `MockupInteractive.tsx`, `MockupCalculator.tsx`, `MockupFooter.tsx`, with scoped `mockup-pages.css`. Existing contact/auth behavior is retained.

- Preserve the approved homepage hero, its clean vector logo and `HeroTablet` animation. The homepage receives lower-section atmosphere/photo refinements and the expanded footer, not a new hero.
- Implement interfaces, charts, connectors and typography natively. Photographs are generated architecture and restaurant scenes at repository asset paths, never reference screenshots or encoded reference image data.
- Platform: portfolio preview, data foundation, operating table/filter, insight workflow, value verification with unverified value clearly identified, and role views.
- Solutions: operation-specific selector shared between the upper strip and detailed panel; six solution areas and a native decision flow.
- Calculator: six steps (operation, locations, annual revenue/other costs, labor, procurement, channel mix), transparent annual range calculations and contextual recommendations. Prefilled results are illustrative; completed results are marked based on inputs. Rates are assumptions from the brief, NOT verified industry benchmarks. Model logic and unit tests live in `lib/value-scenario.ts` and `tests/value-scenario.test.ts`.
- Pricing: user-confirmed $1,500 and $3,500 monthly amounts billed annually, Enterprise custom, native FAQs, support/implementation scope, no active checkout or claims that planned capabilities are already live.
- Company: mission, native data/people infinity diagram, hospitality context, global design outlook, philosophy and values. Do not invent founders, employees or corporate identities to fill the layout.
- The expanded footer and Imprint use `LegalIdentity`, sourced ONLY from `config/company.ts`. Until confirmed, display RADR with "Legal entity details to be confirmed", Registered office / Company registration / VAT-Tax information "To be added", and neutral contact placeholders. Do not copy the mockup's San Francisco address, US/Delaware jurisdiction, phone, hello@ email, entity suffix, registration number or EIN. This rule applies throughout the public site and overrides the visual reference's fictional details.
- Responsible AI and Data Processing Agreement links lead to neutral placeholder pages, not invented finalized legal agreements.
- The current comprehensive browser QA entry is `docs/visual-qa/mockups/verify.mjs`; `docs/visual-qa/navigation.mjs` delegates to it. See the mockups QA README and results for actual runs and captures.

Mockup implementation validation: 32 passing tests (including four annual-model tests), production build, ESLint and TypeScript passed. The browser suite passed 51 route/viewport checks and all five interaction groups. Legal-placeholder guards found no mockup registration/contact fiction. Hero device geometry remains unchanged within 0.02 CSS px at 1512, 1920 and 390px; the animation source and geometry stylesheet are unchanged. See `docs/visual-qa/mockups/` for full-page screenshots, results and methodology.

### Decision Gap — visible data travel (supersedes step-card revision)

The user corrected the step-card redesign and requested the approved flowing-line composition. `DecisionGap.tsx` now restores the editorial copy on the left, POS/PMS/Finance/Procurement/Labor on curved blue paths converging into the glowing RADR operating-state core, and green paths branching into Insights, Futures, Recommendations, Actions, and Verification. Visible illuminated packets continuously travel along every curve. This is actual SVG stroke travel, not a sequence of card highlights. The mobile diagram has purpose-built vertical paths, retaining readable source/result labels.

Pause freezes the actual packet positions; Replay remounts the flow; offscreen, background-tab and reduced-motion states stop animation. The static reduced-motion version retains all connections and labels. No reference bitmap, WebGL, video, or GIF is embedded. The existing approved hero and its tablet geometry/animation remain untouched.

The earlier mockup set remains implemented across Platform, Solutions, Value Calculator, Pricing, Company, and the shared footer. This pass additionally replaces identical role charts with distinct native product miniatures, adds visible packet travel to the Platform data foundation and Solutions decision lifecycle, and animates the Company's people/data/decisions infinity. Local motion controls and reduced-motion alternatives are retained. Commercial pricing and legal placeholders remain as confirmed.

QA: eight responsive widths from 320 to 1920px; actual incoming/outgoing stroke positions checked at separate timestamps; pause/resume/replay and viewport suspension verified. Two 12-second clips at 1512×982 and 1920×1080 live in `docs/visual-qa/decision-gap/`. The cross-page browser suite covers the complete mockup routes and interactions.

### Cinematic hero product demo — current timeline

The user's latest hero-only brief supersedes the earlier short animation timing. Retain the complete initial Control Center; start chart motion at 0.5s, emphasize supplier signal at 1.5s, expand into Decision at 2.7s, sequence evidence/exposure/recommendation/action availability at 3.3–3.81s, prepare action at 4.5s, show Value at 5.6s, and smoothly return at 9s. Mobile uses Control Center → Decision only. The elapsed timeline now pauses and resumes instead of restarting when the visitor scrolls away, leaves the viewport, or backgrounds the tab. Reduced motion always renders static Control Center. A small scene selector/pause control and one illustrative-demo label stay inside the product aperture. Internal spacing reserves the entire lifecycle row; physical device geometry and all other hero elements remain unchanged. Current 15-second desktop/4K recordings and QA are in `docs/visual-qa/hero-cinematic/`.

### User-approved tighter hero spacing

Move the complete hero copy/CTA group up 60px on desktop (top 324 → 264px) and 30px on tablet/mobile (190 → 160px and 185 → 155px). This specifically supersedes the old copy Y-coordinate lock; the physical tablet, header, photography, and animation remain unchanged. Browser checks at 1512, 1920, 768, and 390px confirmed the intended offsets, separation from the header, no horizontal overflow, and unchanged tablet bounds. The cinematic verifier accounts for this approved offset while retaining the original historical baseline file.

### Compact complete hero — supersedes text-only spacing adjustment

The user clarified that both the tablet graphic and copy should sit higher below the navigation. Desktop copy now starts at 185px, the tablet at 235px (150px higher than the original), and hero height is 900px / 930px on wide screens. Tablet layout: copy 130px, device 565px, hero 1125px. Mobile: copy 125px, device 485px, hero 855px. Tablet scale, angle, size and internal demo are unchanged. Browser checks at 1512, 1920, 1024, 768, 390 and 320px confirmed header clearance, copy/device separation, complete device visibility and no horizontal overflow. Current static screenshots and bounds are in `docs/visual-qa/hero-spacing/`. Historical cinematic recordings precede this explicit user-authorized composition change; the current verifier adjusts its geometry expectations accordingly.

### Final hero nudge and compact legal footer

At the user's request, desktop copy/device move another 25px upward (top 160px / 210px; hero 875px, or 905px wide). Tablet copy/device start at 125px / 555px with hero 1115px; mobile at 115px / 475px with hero 845px. The expanded footer legal/identity block is replaced by six wrapping hyperlinks in the copyright row. Full legal content and neutral identity placeholders remain on their dedicated pages, including `/imprint`; confirmed-only identity rules remain unchanged. Production build and browser checks passed at six widths, and all six legal destinations returned 200. Current screenshots, including compact desktop/mobile footers, and measurements are in `docs/visual-qa/hero-spacing/`.

### Solutions — operation/futures/decision reference

The user's newest reference replaces only the `/solutions` hero with a native animated operating story: six source systems → RADR operating state → compared futures → seating-pace recommendation → outcome tracking. Headline: “See the operation. Compare the future. Take the right action.” The existing coastal-pavilion photo supplies the hospitality setting; all diagram UI, curves, graphs, text and glass cards are HTML/CSS/SVG. Source packets travel into RADR and green packets leave it; a quiet 10.5-second stage cycle highlights comparison, recommendation and expected outcome. Includes pause/replay, manual stages, reduced motion, responsive reflow, and foreground/viewport suspension. Expected +$620, Observed Pending, Verified $0, and illustrative confidence remain explicitly separate. No action is sent. Current implementation/QA are in `docs/visual-qa/solutions-story/`. The homepage hero, pricing, compact legal footer and lower Solutions sections remain unchanged. Very narrow (≤360px) header spacing is scoped to Solutions to keep navigation in view.

### Continuous autoplay — latest site-wide motion policy

The user requested continuous animation across the public site. Remove pause, play, replay and manual scene controls from the hero tablet, Decision Gap, shared MotionScene diagrams, and Solutions story. Solutions stage labels are non-interactive progress indicators. The hero no longer stops merely because the visitor begins scrolling; it continues while visible. All timelines loop automatically. Preserve reduced-motion preferences, offscreen/background efficiency, readable resting states, and the expected/observed/verified distinction. Current site-wide verification is `docs/visual-qa/continuous-motion/verify.mjs`; prior controls-based QA recordings and scripts are historical.
