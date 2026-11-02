# Control Center attention brief and final composition

2 November 2026. User requested a valuable use of the remaining heading space and a final dashboard polish.

The new Your attention card sits between the greeting and Estate watch. It shows the scoped count awaiting judgment, decisions in motion, and active decisions with uncertain evidence. The small ring expresses the split between needs-you and handling counts, not forecast confidence or an invented health score. Its text conveys the same information without relying on colour.

Opening the 30-second brief presents up to three existing decisions in their canonical queue order, with their existing recommendation, deadline, primary metric, currency, horizon, confidence and evidence count. Expected amounts are not summed across different decisions or horizons. Links open the same canonical records as the main priority card. Separate shortcuts lead to handling, evidence health and the full judgment queue. No provider writes, ranking changes, new financial models or claims of verified value were introduced.

The native modal traps keyboard focus, supports Escape, restores focus and document scrolling, and cleans up scrolling on navigation. Its close header remains visible while the content scrolls. The modal uses a quiet light glass surface with readable financial and confidence labels.

The desktop heading now has three aligned columns without adding another dashboard row. At tablet sizes the greeting spans the two briefing cards. At phone sizes the new card becomes a compact trigger. Card corners, borders, dividers, hover treatment and green/blue accents match Estate watch and the existing material system. Changes are confined to Control Center.

Validation: eleven browser checks cover the new brief, decision link identity, hotel scope, keyboard focus restoration, phone layout, compactness, existing comparison drill-downs and navigation behaviour. The dedicated browser review has zero WCAG A/AA Axe violations. Five widths (1512, 1366, 1024, 768 and 390px) have no horizontal page overflow. Desktop brief height is 1489px; phone brief height is 2599px, within existing budgets. The configured app TypeScript check, targeted lint and whitespace checks pass. A raw root-config TypeScript run includes pre-existing unit-test type errors; deployment uses the existing tsconfig.app.json, which excludes tests.

[Dashboard](visual-qa/attention/dashboard.png) · [Attention brief](visual-qa/attention/brief.png) · [Phone](visual-qa/attention/mobile.png)
