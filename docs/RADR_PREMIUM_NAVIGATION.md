# Premium navigation-page revision

The latest direction replaces purple with clean blue and slate gradients, restrained RADR green, consistent Manrope typography, and shared brand-led product cards across Platform, Solutions, Value Calculator, Pricing and Company.

`premium.css` is the final navigation-page styling layer. `IntelligenceFlow.tsx` replaces the old absolute-positioned Platform data diagram. Source logos, connector rails, the RADR wordmark and the decision panel each occupy independent grid tracks. Mobile uses a vertical composition. Packets remain inside connector tracks, never over labels or page copy. The decision cycles through evidence, recommendation and verification with reserved content height, stops offscreen/in a background tab, and respects reduced motion.

Source logos are illustrative examples, not a claim of active integrations or partnerships. Expected, observed and verified values remain separate. The supplier example uses $2,430 expected and $0 verified; the restaurant example uses +$620 expected and $0 verified. All actions remain subject to human review.

Solutions uses the same flow at full width below its introduction. Pricing adds an operating-scope preview; Company adds a RADR wordmark / hospitality composition; Calculator gains matching brand chrome. Commercial prices, calculator assumptions, auth and inquiry behavior are unchanged.

Validation covers all five pages at 1512, 1024, 768, 390 and 320px, explicit overlap checks for the Platform diagram, all animation phases, stable panel height, reduced motion, calculator completion, FAQ and mobile menu behavior, TypeScript and the 32 existing tests. Workspace captures and results live under `/workspace/work/qa`.
