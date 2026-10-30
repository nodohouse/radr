# RADR Product Visual System

**Thesis:** Marketing = editorial storytelling. Product = editorial instrumentation. Same DNA.

**Sources:** `MARKETING_DESIGN_SOURCE_OF_TRUTH.md` · `radr-brand-tokens.css` · `radr-visual-system-3.css`

---

## Foundation

| Layer | File | Scope |
| --- | --- | --- |
| Tokens | `app/radr-brand-tokens.css` | /en + /app |
| Product application | `app/radr-visual-system-3.css` | `/app` only (last import) |
| Density | `app/product-density.css` | row heights, rail labels |
| Modules | `app/dashboard-modules.css` | instruments |

No separate app green, ivory, or typeface.

---

## Principles

1. **Statement first · evidence second · detail on demand**
2. **One protagonist per screen** (TIME · DECISION · FUTURE · CONTEXT · VERIFICATION · MEMORY · FLOW)
3. **Controlled asymmetry** (8/4, 7/5) — never default equal card grids
4. **Green is precious** — NOW, selected Future, Verified, live signal
5. **Tonal hierarchy > borders > shadows**
6. **Warm mineral light** — no dark product chrome by default
7. **Weights ≤ 600** in product UI

---

## Page rhythm (chapters)

1. Context / hero statement  
2. Primary instrument  
3. Interpretation / Decision  
4. Supporting operating detail  
5. Proof / history / system  

Tier 2–3 modules are quieter (opacity + lighter titles).

---

## Shared primitives (`lib/design-system/`)

| Primitive | Role |
| --- | --- |
| `RadrDisplay` | Large editorial statement |
| `RadrHeading` | Section heading |
| `RadrBody` | Body copy |
| `RadrMetric` | Tabular metric |
| `RadrButton` | Primary / secondary / tertiary / destructive |
| `RadrDivider` | Hairline |
| `RadrSurface` | Warm stone / white module |
| `RadrStatus` | Mono uppercase status |

App instruments (not generic KPI cards): ContributionBridge, OperatingTrajectory, DecisionFocus, FutureTrajectory, LocationMatrix, ProofCurve, LearningCurve, OperatingFlow, ContextRibbon.

---

## Chart grammar

| Series | Treatment |
| --- | --- |
| Observed | near-black solid |
| Expected | stone |
| Forecast | soft / dashed |
| NOW | `#00D978` marker |
| Risk | amber |
| Negative material | `#B42318` sparingly |
| Verified | `#00A85A` |
| Grid | minimal or none |
| Labels | direct-label meaningful states |

---

## Motion

Subtle, intentional: timeline grows to NOW · forecast after NOW · selected Future strengthens · Verified settles · Memory band narrows.  
`--ease-out` / `--motion-base` (0.22s). Honor `prefers-reduced-motion`.

---

## Shell

| Element | Rule |
| --- | --- |
| Sidebar | Quiet; Control / Operate / System; inactive 400–450; no giant active pill |
| Context bar | Org · Role · Period · freshness only |
| Butler | Single entry ⌘K |

---

## Quality gates

- **Logo removal:** still reads as same company as /en  
- **Grafana test:** fail if card grid + table-first + heavy borders  
- **RADR test:** must show TIME / DECISION / FUTURE / PROOF / MEMORY  
- **Marketing polish:** would this quality ship on /en?
