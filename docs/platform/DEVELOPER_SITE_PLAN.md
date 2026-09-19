# Developer Site Plan

Last updated: 2026-08-24

## Public route

`/developers`: marketing experience (premium RADR visual identity).

### Jobs of the page

1. Communicate: open hospitality intelligence layer  
2. Architecture diagram: Systems → Ingestion → Normalized model → Intelligence  
3. Honest integration catalog (from registry)  
4. CTAs: Explore integrations · Read API docs (docs/) · Contact / can't find system  
5. Built to connect, without claiming "anything instantly"

### Navigation

- Company secondary: **Developers** → `/developers`
- Footer Product or Company column: Developers
- Do not overcrowd top-level primary nav

### Subpages (phase 2)

| Path | Content |
|------|---------|
| `/developers` | Hub |
| `/developers/integrations` | Catalog + filters (can be section on hub first) |
| Later: MDX docs site or `/docs` | Full reference |

Internal markdown lives in `docs/developers/**` for engineers; public page links to GitHub/docs or in-repo docs until a docs site ships.

### Homepage teaser

Short "Built to connect" band with links to `/developers` and `/product/connections`. No logo wall.

### Copy guardrails

Use: "If the system exposes usable data through an API, export, webhook or secure data connection, RADR can be designed to ingest it."

Avoid: "Connect any software instantly."
