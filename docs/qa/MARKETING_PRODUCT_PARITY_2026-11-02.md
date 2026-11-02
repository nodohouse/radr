# Marketing and product visual parity

The public site uses the product's Manrope typeface, white glass panels, blue canvas, dark blue/green Decision cards, restrained vibrant green controls, and approved v4 RADR assets. Product and authentication surfaces keep their own scoped styles.

Homepage follows the required spine: hero Decision, since last check, one interactive fork, one connected signal, close. D-1911 uses the existing public demo economics: expected protected tonight +$620, 82% confidence, illustrative completed-service protected $590. D-7110 describes signature-dish contribution versus cold-station capacity. No live customer data or provider writes are implied.

Platform, Solutions, Value Calculator, Pricing, Company, Why, Industries, Security, Contact, developer documentation, and deeper product pages receive shared public materials and type. Platform, Solutions, Pricing, and Company have purpose-specific hero visuals. Back of House and Connections are available in the public Platform menu and surface selector. Camera/voice workflows are clearly marked as previews. New menu labels are present in all five locales.

Navigation panels use an opaque background and retain hover, focus, Escape, mobile drawer, and deep-link behavior. Panel height accommodates the full link list. Solutions initializes deterministically during server rendering and reads the selected query after hydration. Tab arrow shortcuts are scoped to the relevant rail. Essential hero text remains visible during hydration. Footer social placeholders remain available without invented profile URLs.

## Verification

- Application TypeScript check passes.
- Targeted ESLint passes without warnings.
- 43 existing canonical demo, public boundary, money/capability, calculator, and image-registry checks pass. Category regression now asserts the category required by AGENTS.md, retaining decision layer as the supporting descriptor.
- Four saved Playwright tests pass: homepage alternatives, Platform and Solutions deep links, calculator modeled result, opaque and keyboard-dismissible navigation.
- Browser route review: ten primary destinations at 1512px, fourteen destinations at 390px; no horizontal overflow. Mobile drawer opens and closes. No browser runtime exceptions in the route/interaction run.
- Six Axe WCAG A/AA states pass with zero violations: home, Platform, Pricing, Value Calculator introduction, Company, Contact.
- Existing whole-repository locale parity check still reports unrelated product.json translation gaps. New navigation entries have matching keys in English, German, Dutch, French, and Spanish.

Browser captures are in the working QA directory `/workspace/work/qa/marketing-unified`. Hosted deployment build is checked separately. No account infrastructure or production domain configuration is changed in this pass.
