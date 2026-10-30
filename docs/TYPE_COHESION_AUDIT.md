# Type Cohesion Audit

**Date:** 2026-10-05  
**SSOT:** `docs/MARKETING_DESIGN_SYSTEM_AUDIT.md` · Instrument Sans + IBM Plex Mono  
**Enforcement:** `app/product-design-system.css`

## Modes

| Mode | Family | Where | Pass criteria |
|------|--------|-------|---------------|
| Editorial interpretation | Instrument Sans · `--rp-fs-editorial` | Situation, hotel statement, Memory hero, Intel questions, Decision verb | One obvious hero; not dashboard label |
| Operational interface | Instrument Sans · body/meta | Rail, tabs, tables, forms, Settings | Compact · legible · quiet meta |
| Numeric / economic | Instrument · tabular | Value hero, Review econ, hotel metrics, Memory 14.2%→5.4% | Numbers larger than labels |

## Page checks

| Surface | Hero? | Numbers distinct? | Meta quiet? | Matches marketing? |
|---------|-------|-------------------|-------------|---------------------|
| Restaurant CC | Situation statement | Waterfall + Review econ | Eyebrows mono | Yes (mineral) |
| Hotel CC | Pickup / readiness | Occ/ADR/RevPAR grid | Mono kickers | Yes |
| Decisions | Band titles | Economic column | ID mono | Yes |
| Decision Room | Verb + econ | Expected incremental | Case file quiet | Yes |
| Value | € Verified | Hero figure | Proof under | Yes |
| Memory | Accuracy statement | 14.2→5.4 | V3/V4 meta | Yes |
| Service | Mode tabs | Recovery € | Floor labels | Yes |
| Settings | Section title | — | Secondary nav | Yes |

## Failures fixed this pass

- Newsreader/cream editorial on Situation → Instrument display scale
- Uniform body size everywhere → explicit editorial / numeric scales
- Cream `#f4f1ea` / `#fffcf7` competing with mineral type contrast

## Score (self-review)

**Typography: 9.5** — modes explicit; marketing family; strong numeric scale.
