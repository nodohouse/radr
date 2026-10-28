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
- Preserve pricing source of truth in `pricing/config.ts`: Free €0; Control €199 per location/month; Scale custom. Billing remains inactive and capability availability is explicit. Do not advertise upcoming features as live or change commercial terms during visual edits.
- The dedicated calculator models one area at a time to avoid cross-category double counting. Baseline × assumed improvement × locations × optional 12 months. Assumptions are user-controlled; results are explicitly illustrative and not verified financial outcomes.
- Contact UI retains the existing server action. Invalid-input handling is browser-tested. Actual inquiry delivery still depends on the existing configured webhook or published inbox and is not claimed as validated by these visual checks.
- Navigation QA: `docs/visual-qa/navigation.mjs` checks all 14 public routes at 1512, 390, and 768 px widths and exercises native FAQs, solution selection, calculator arithmetic, mobile navigation, contact validation, and password visibility. Captures use route-prefixed filenames. See `navigation-results.json` for outcomes.

Navigation revision verification: production build, ESLint, TypeScript and all 28 unit/integration tests passed. Browser QA passed 42 route/viewport checks (14 routes × desktop/mobile/tablet), all five interactive test groups, and the original homepage regression suite at nine viewport sizes. The final visual correction replaced unsupported solution-tab arrow glyphs with native SVG and improved small-screen hero text contrast.

## Hero tablet animation pass

Animate only the native interface in `HeroTablet.tsx` with the existing `motion/react` (Framer Motion) dependency. The physical `.rh-device` and original hero stylesheet remain fixed. Desktop: Control Center → supplier Decision → action preparation → Value → Control Center. Mobile ≤700 px: Control Center → Decision only. Reduced motion is static Control Center. Timelines pause offscreen and in hidden tabs.

Always retain the distinction between Expected $2,430, Observed Pending, and Verified $0. The action remains illustrative and requires human approval; it sends nothing. Blue denotes evidence, green decision/action/value. No bounce or overshoot. The shared supplier-signal transition finishes before decision details fade in.

Reference path: `docs/visual-qa/current-1512x982.png`. Reference it by file path, never embed it as base64. QA, pre-change geometry, state captures and two 12-second recordings live in `docs/visual-qa/hero-animation/`. See that directory's README and results for actual timing, clipping, motion preference, mobile, and geometry checks. Other homepage sections are outside this animation task.
