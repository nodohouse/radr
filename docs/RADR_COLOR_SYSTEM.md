# RADR color system / November 2026

Two vivid blues, one sharp green signal. The signature treatment is a smooth 90-degree gradient: sapphire at the left edge, ocean at the right edge. Neon jade sits above the gradient on actions and signals, never as a third gradient stop. The approved RADR v4 logo and its original green dot remain immutable.

| Role | Color | Usage |
| --- | --- | --- |
| Sapphire | #1238F5 | Brand hierarchy, selected navigation, primary chart series |
| Ocean | #0068E8 | Secondary depth, secondary research series, supporting panels |
| Neon jade | #00F59A | Primary actions, large headline emphasis, selected states, live indicators and priority edges |
| Ink | #122E4B | Readable text and text on neon jade |
| Canvas | #F1F5FF | Daylight foundation under white glass |
| Jade ink | #006747 | Readable positive/verified text on pale surfaces |

Sapphire and ocean provide a vivid horizontal blue transition; jade marks the next useful action and selected large headline words. Avoid full-screen jade backgrounds, neon body copy, or white labels on jade. Preserve red and amber for operational risk, and distinct comparison series where they encode different locations. Do not recolor provider logos, hospitality photography, or the approved RADR marks.

The canonical values live in `lib/brand/palette.json`. Run `python scripts/sync-brand-palette.py` after changing them; this emits `app/radr-palette.css` and checks key text contrast pairs against WCAG AA (4.5:1). Shared semantic aliases live in `app/radr-brand-tokens.css`; application rules live in `app/radr-brand-theme.css`. Existing page materials retain layout, density, and behaviors.

The PDF generator reads the same JSON. Rebuild the playbook with `scripts/generate-hospitality-report.py` and refresh its three public preview pages when the palette changes. Generated hospitality images must show interiors and equipment without AI-generated people, faces, silhouettes, hands, or human reflections.

Coverage: public navigation and marketing pages, journal and playbook funnel, login and onboarding, product shell and selected navigation, control center, shared workspace panels and primary actions. The playbook form remains separate from the information column, and sales/newsletter consent remain optional. Lead delivery requires its actual CRM/webhook configuration.

Navigation glass surrounds the central links only. The brand mark and account/demo actions sit outside that capsule. Dropdowns stay within the horizontal space between those two protected areas.
