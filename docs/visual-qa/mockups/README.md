# Full mockup implementation pass

The reference set supplied in chat covers the landing page, Platform, Solutions, Value Calculator, Pricing, Company, closing CTA, and expanded footer. The supplied mockups guide composition; native HTML/CSS/SVG implements all typography, product surfaces, diagrams and charts. No complete mockup or rasterized dashboard is embedded. Reference image data is not encoded as base64.

## Scope

- The approved homepage hero and its motion sequence are retained. Lower-page atmosphere is refined, the restaurant photograph is replaced with matching generated architecture, and the expanded footer is added.
- Platform includes a portfolio dashboard, unified data diagram, operating-state table/filter, insight workflow, value verification and role previews.
- Solutions includes operation selection, six operating areas, a decision flow, and a shared Restaurant/Hotel/Group selection across the operation strip and detailed panel.
- The Value Calculator uses six steps and an input-driven annual model. The prefilled example is marked illustrative; completion switches the result label to user inputs. Channel mix must total 100%.
- Assumption ranges come from the mockup, not a validated benchmark study. Formulas, ranges and limitations are disclosed. Revenue opportunity is not profit; unverified modeled values are not recovered or verified value.
- The user explicitly confirmed Starter at $1,500/month and Multi-site at $3,500/month, billed annually, with Enterprise custom. These are displayed commercial plans; online billing remains inactive and scope/availability is confirmed before agreement.
- The shared expanded footer and `/imprint` use `LegalIdentity`, sourced exclusively from the existing confirmed company configuration. Missing entity, office, registration, tax and contact details use neutral placeholders. No mockup contact details, social identities, phone, addresses, company numbers, or jurisdictions were copied.
- Responsible AI and DPA links have explicit draft/placeholder pages and make no unconfirmed legal commitments.

## Assets

`public/images/radr-pavilion-new.webp` and `public/images/radr-restaurant.webp` are newly generated photographic architecture, not exact original reference plates. The supplied clean vector branding remains unchanged. The photographs are 1536px source assets, so 4K layout support is not a claim of native 4K photographic detail.

## Validation

Run the local site, then from `/workspace/radr`:

```sh
NODE_PATH=/workspace/radr-visual-tools/node_modules node docs/visual-qa/mockups/verify.mjs
```

`results.json` records actual route/viewport outcomes and interaction assertions. Desktop/mobile captures use `<route>-desktop.png` and `<route>-mobile.png`. The script verifies the page and image responses, header visibility, horizontal overflow, legal placeholders, operation selection, table filtering, workflow controls, six-step calculator validation/arithmetic, pricing, FAQ and footer anchors. The pure annual model has dedicated unit tests in `tests/value-scenario.test.ts`.

This pass does not validate email delivery or production account configuration, and does not publish environment configuration. Updates are prepared on the existing preview branch.

Completed validation: all 32 tests passed; ESLint and TypeScript passed; production Next.js build passed. Browser verification passed 51 route/viewport checks (17 public routes at 1512, 390 and 768px), five interaction groups, legal-placeholder guards and footer-anchor checks. `hero-geometry.json` independently confirms the approved animated hero device geometry is unchanged at 1512, 1920 and 390px. Source checks confirm the hero animation component and original geometry stylesheet were not edited.
