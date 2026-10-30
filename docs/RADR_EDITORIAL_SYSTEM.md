# RADR editorial overhaul

The latest user instruction replaces the flat blue treatment and mixed typography with a cohesive editorial system.

- Use Manrope throughout public pages, including product labels, headings, navigation, forms, and footer. The SVG wordmark stays unchanged. One font family, deliberate size and weight hierarchy, and tabular product values replace the mixed Arial / Source Sans / mono stacks.
- `editorial.css` owns the final public-site treatment over the retained component layout styles. Materials are white, ink, indigo and soft gradient light. Green marks signals and actions rather than large panels. The footer has an explicit ink background and no inherited green glow.
- Keep the scroll-driven tablet story. The hero CTA links directly into it. The homepage outcome sequence explains connected evidence, prepared decisions and verified impact without adding performance claims.
- Restaurant and hotel photos belong in hospitality context panels, not as a site-wide hotel backdrop. The approved repository images are used in the homepage cards and Solutions operation explorer.
- Do not use em dashes in public copy, metadata or user-facing contact errors. Numeric ranges can retain en dashes.
- Preserve commercial prices, scenario assumptions, neutral legal placeholders, auth behaviour and the distinction between expected, observed and verified outcomes.

Verification includes one computed font family across ten desktop/mobile routes, em-dash scans, loaded image inspection, footer material checks, calculator results, the tablet story and the existing test suite. Workspace QA artifacts are intermediate assets under `/workspace/work/qa`.
