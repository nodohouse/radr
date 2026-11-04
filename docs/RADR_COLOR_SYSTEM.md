# RADR color system / November 2026

Two quiet foundations, one loud signal. The approved RADR v4 logo and its original green dot remain immutable.

| Role | Color | Usage |
| --- | --- | --- |
| Sapphire | #244C91 | Brand hierarchy, selected navigation, primary chart series |
| Ocean | #176B7D | Secondary depth, secondary research series, supporting panels |
| Neon jade | #00E895 | Primary actions, live indicators, priority edges; use sparingly |
| Ink | #122E4B | Readable text and text on neon jade |
| Canvas | #F1F6FB | Daylight foundation under white glass |
| Jade ink | #006747 | Readable positive/verified text on pale surfaces |

Sapphire and ocean provide calm structure; jade marks the next useful action. Avoid full-screen jade backgrounds, neon body copy, or white labels on jade. Preserve red and amber for operational risk, and distinct comparison series where they encode different locations. Do not recolor provider logos, hospitality photography, or the approved RADR marks.

The canonical values live in `lib/brand/palette.json`. Run `python scripts/sync-brand-palette.py` after changing them; this emits `app/radr-palette.css` and checks key text contrast pairs against WCAG AA (4.5:1). Shared semantic aliases live in `app/radr-brand-tokens.css`; application rules live in `app/radr-brand-theme.css`. Existing page materials retain layout, density, and behaviors.

The PDF generator reads the same JSON. Rebuild the playbook with `scripts/generate-hospitality-report.py` and refresh its three public preview pages when the palette changes. Generated hospitality images must show interiors and equipment without AI-generated people, faces, silhouettes, hands, or human reflections.

Coverage: public navigation and marketing pages, journal and playbook funnel, login and onboarding, product shell and selected navigation, control center, shared workspace panels and primary actions. The playbook form remains separate from the information column, and sales/newsletter consent remain optional. Lead delivery requires its actual CRM/webhook configuration.
