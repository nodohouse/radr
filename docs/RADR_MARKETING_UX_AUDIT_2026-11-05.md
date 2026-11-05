# Marketing UX audit, 5 November 2026

Ten fictional task-based personas are exercised by browser automation. They are not recruited users, testimonials, usability interviews or evidence of customer satisfaction. The tests check observable behavior rather than claiming aesthetic approval.

| Persona | Journey |
| --- | --- |
| Maya, restaurant owner | Homepage to public demo, Restaurant scenario, visible demo qualification |
| Leo, hotel GM | Tablet layout, Hotel / Aparthotel / Restaurant switches |
| Priya, CFO | Pricing scope, public demo, required calculator choice, illustrative result |
| Noah, group operator | All unique Platform dropdown destinations, page headings and overflow |
| Elena, IT lead | Planned autonomy levels 4 and 5, Developers, connection status |
| Sam, chef | Mobile drawer, Back of House destination, drawer dismissal |
| Ava, finance analyst | Mobile journal article to report, required-field gate, unauthenticated download denied |
| Oliver, keyboard buyer | Dropdown keyboard entry, Escape focus restoration, honest contact availability |
| Isabelle, reduced-motion visitor | Stationary tablet, annotation clearance, both seating forks |
| Felix, German visitor | Forward/back scroll positions, stable document height, footer destinations |

Separate navigation regressions cover desktop dropdown geometry at 1512, 1280 and 1130 pixels, keyboard focus, and compact navigation at 1120 and 390 pixels. The expanded mobile menu traps focus and restores it when closed.

The page scan covers homepage, Platform, Solutions, Pricing, Company, public demo, Contact, Value Calculator introduction and playbook landing at 1512 and 390 pixels. Final results across these 18 states: zero detected text-box intersections, horizontal document overflow or Axe WCAG A/AA violations. No page errors were captured by the scan. Automated geometry and Axe cannot prove every layout or accessibility case is correct.

Additional native-motion checks at 390 and 820 pixels confirmed stable document height, tablet bounds inside the viewport and at least 42 pixels of clearance before the loop during sampled forward/back scrolling. Reduced motion leaves the tablet stationary. The animation uses bounded perspective transforms, with no scroll pinning or wheel interception.

## Findings fixed

- Separate logo, navigation and login capsules replaced by one shared glass header. Approved v4 logo geometry and dot are unchanged; the mark has no separate tile.
- Legacy mint page wash and teal footer removed. Sapphire flows horizontally into ocean; jade remains on selected actions and economic signals.
- The tablet annotation reserves normal-flow space. Scroll motion is spring-smoothed and bounded.
- Low-contrast public demo and mobile pricing labels corrected; tiny mobile comparison labels increased to 12 pixels.
- Public demo CTAs in the shared brand, developer header and public chapters no longer require signup. Labels describe the interactive demo rather than promising a specific live Decision.
- Homepage, Platform, Pricing, connection summary and autonomy preview distinguish synthetic examples from commercial connectors and autonomous execution, which are planned.
- Developer content has a main landmark.
- Contact displays an upfront availability notice and disables submission when no delivery destination is configured. Native required-field validation remains enabled when sending is configured.

## Limits and setup

The public operating examples are synthetic. They do not establish real customer results, production provider feeds or autonomous execution. Pricing comparisons show proposed scope rather than current feature availability.

The preview has no configured contact or report-lead destination. No real sales inquiry was sent during testing. Unauthenticated report downloads remain blocked; live lead delivery is not verified by these journeys. Production account enablement, legal identity completion and provider integration work remain separate setup items.

## Repeat

Start the site locally, then run:

```sh
PUBLIC_QA_BASE_URL=http://127.0.0.1:3002 npx playwright test tests/e2e/marketing-personas.spec.ts tests/e2e/navigation-glass.spec.ts --project=desktop-1512 --retries=0
```

The browser suite attaches screenshots to its report. Local audit artifacts, including resolved accessibility results, motion samples and persona results, are stored under `/workspace/work/qa/coherence/` in this session. Application typecheck, changed-component lint and palette contrast checks are also required before publication.
