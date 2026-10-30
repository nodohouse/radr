# Public interaction audit

**Generated:** 2026-09-24
**Base:** `https://prep-ten-zeta.vercel.app` (live) · local verify `http://127.0.0.1:3020`
**Interactive rows:** 1130
**Fails:** 0
**App leaks:** 0

## Method

Playwright crawl of every public seed route. Collects `a[href]`, `button`, `[role=button]`, `summary`.
Classifies hrefs: public · demo-gate (signup+intent) · app-leak · auth-probe.
Auth probes hit `/app/**` signed-out and require signup/login redirect.

## Page status

| Route | Status | Notes |
|---|---|---|
| `/en` | PASS | — |
| `/en/product` | PASS | — |
| `/en/product/control-center` | PASS | — |
| `/en/product/decisions` | PASS | — |
| `/en/product/futures` | PASS | bg:rgb(247, 250, 248) |
| `/en/product/futures?example=D-1911` | PASS | bg:rgb(247, 250, 248) |
| `/en/product/value` | PASS | — |
| `/en/product/memory` | PASS | — |
| `/en/product/connections` | PASS | — |
| `/en/product/floor` | PASS | — |
| `/en/solutions` | PASS | — |
| `/en/pricing` | PASS | — |
| `/en/company` | PASS | — |
| `/en/why` | PASS | — |
| `/en/blog` | PASS | — |
| `/en/developers` | PASS | — |
| `/en/contact` | PASS | — |
| `/en/security` | PASS | — |
| `/en/privacy` | PASS | — |
| `/en/terms` | PASS | — |
| `/en/imprint` | PASS | — |
| `/en/login` | PASS | — |
| `/en/signup` | PASS | — |
| `/app` | PASS | final=http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fenter; http=200 |
| `/app/decisions/dec_peak_berlin` | PASS | final=http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fdecisions%2Fdec_peak_berlin; http=200 |
| `/app/memory` | PASS | final=http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fmemory; http=200 |
| `/app/connections` | PASS | final=http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fconnections; http=200 |
| `/app/lab/control-center` | PASS | final=http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Flab%2Fcontrol-center; http=200 |
| `/app/enter` | PASS | final=http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fenter; http=200 |

## Demo-entry CTAs (expected signup)

| Page | Label | Href | Status |
|---|---|---|---|
| `/en` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en` | See the full Decision in RADR → | `/signup?intent=demo&next=/app/enter` | PASS |
| `/en` | See RADR in action → | `/en/signup?intent=demo&next=%2Fapp%2Fenter` | PASS |
| `/en/product` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/control-center` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/control-center` | See RADR in action → | `/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/decisions` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/decisions` | Start a recovery pilot | `/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/futures` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/futures` | See the full Decision in RADR → | `/en/signup?intent=demo&next=%2Fapp%2Fenter` | PASS |
| `/en/product/futures?example=D-1911` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/futures?example=D-1911` | See the full Decision in RADR → | `/en/signup?intent=demo&next=%2Fapp%2Fenter` | PASS |
| `/en/product/value` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/value` | Open this in RADR → | `/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/memory` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/memory` | Start a recovery pilot → | `/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/connections` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/product/floor` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/solutions` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/pricing` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/company` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/why` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/blog` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/developers` | See RADR → | `/en/signup?intent=demo&next=%2Fapp%2Fenter` | PASS |
| `/en/contact` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/security` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/privacy` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/terms` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/imprint` | See RADR in action | `/en/signup?intent=demo&next=/app/enter` | PASS |
| `/en/login` | Create account to enter demo | `/en/signup?intent=demo&next=/app/enter` | PASS |

## Sample of public links (first 80 unique)

| Page | Label | Href | Kind | Status |
|---|---|---|---|---|
| `/en` | RADR home | `/en` | public | PASS |
| `/en` | Platform | `/en/product` | public | PASS |
| `/en` | Where value leaks | `/en/solutions` | public | PASS |
| `/en` | Pricing | `/en/pricing` | public | PASS |
| `/en` | Company | `/en/company` | public | PASS |
| `/en` | Login | `/en/login` | public | PASS |
| `/en` | See a Verified Recovery | `/en/product/value` | public | PASS |
| `/en` | Full Trace → | `/product/decisions/D-4102/trace` | internal | PASS |
| `/en` | Open Operating Memory → | `/product/memory` | internal | PASS |
| `/en` | View all 46 integrations → | `/en/developers#integrations` | public | PASS |
| `/en` | See Connections → | `/product/connections` | internal | PASS |
| `/en` | Trust → | `/security` | internal | PASS |
| `/en` | Start a recovery pilot → | `/en/contact?intent=recovery-pilot` | public | PASS |
| `/en` | Start a recovery pilot → | `/en/contact?intent=pilot` | public | PASS |
| `/en` | Contact Sales | `/en/contact?intent=sales` | public | PASS |
| `/en` | /en/product | `/en/product` | public | PASS |
| `/en` | /en/product/control-center | `/en/product/control-center` | public | PASS |
| `/en` | /en/product/decisions | `/en/product/decisions` | public | PASS |
| `/en` | /en/product/futures | `/en/product/futures` | public | PASS |
| `/en` | /en/product/value | `/en/product/value` | public | PASS |
| `/en` | /en/product/memory | `/en/product/memory` | public | PASS |
| `/en` | /en/solutions | `/en/solutions` | public | PASS |
| `/en` | /en/solutions#supplier-ap | `/en/solutions#supplier-ap` | public | PASS |
| `/en` | /en/solutions#reconciliation | `/en/solutions#reconciliation` | public | PASS |
| `/en` | /en/solutions#cost-variance | `/en/solutions#cost-variance` | public | PASS |
| `/en` | /en/solutions#procurement | `/en/solutions#procurement` | public | PASS |
| `/en` | /en/solutions#perishable | `/en/solutions#perishable` | public | PASS |
| `/en` | /en/company | `/en/company` | public | PASS |
| `/en` | /en/why | `/en/why` | public | PASS |
| `/en` | /en/blog | `/en/blog` | public | PASS |
| `/en` | /en/developers | `/en/developers` | public | PASS |
| `/en` | /en/contact | `/en/contact` | public | PASS |
| `/en` | /en/security | `/en/security` | public | PASS |
| `/en` | /en/privacy | `/en/privacy` | public | PASS |
| `/en` | /en/terms | `/en/terms` | public | PASS |
| `/en` | /en/imprint | `/en/imprint` | public | PASS |
| `/en` | Explore the platform | `/en/product` | public | PASS |
| `/en` | Compare Futures → | `/en/product/futures?example=D-1911` | public | PASS |
| `/en/product` | RADR home | `/en` | public | PASS |
| `/en/product` | Platform | `/en/product` | public | PASS |
| `/en/product` | Where value leaks | `/en/solutions` | public | PASS |
| `/en/product` | Pricing | `/en/pricing` | public | PASS |
| `/en/product` | Company | `/en/company` | public | PASS |
| `/en/product` | Login | `/en/login` | public | PASS |
| `/en/product` | See a Verified Recovery | `/en/product/value` | public | PASS |
| `/en/product` | CAPTURE | `/product/control-center` | internal | PASS |
| `/en/product` | UNDERSTAND | `/product/control-center` | internal | PASS |
| `/en/product` | DECIDE | `/product/decisions` | internal | PASS |
| `/en/product` | ACT | `/product/actions` | internal | PASS |
| `/en/product` | VERIFY | `/product/value` | internal | PASS |
| `/en/product` | LEARN | `/product/memory` | internal | PASS |
| `/en/product` | Start a recovery pilot → | `/en/contact?intent=recovery-pilot` | public | PASS |
| `/en/product` | See a Verified Recovery | `/product/value` | internal | PASS |
| `/en/product` | /en/product | `/en/product` | public | PASS |
| `/en/product` | /en/product/control-center | `/en/product/control-center` | public | PASS |
| `/en/product` | /en/product/decisions | `/en/product/decisions` | public | PASS |
| `/en/product` | /en/product/futures | `/en/product/futures` | public | PASS |
| `/en/product` | /en/product/value | `/en/product/value` | public | PASS |
| `/en/product` | /en/product/memory | `/en/product/memory` | public | PASS |
| `/en/product` | /en/solutions | `/en/solutions` | public | PASS |
| `/en/product` | /en/solutions#supplier-ap | `/en/solutions#supplier-ap` | public | PASS |
| `/en/product` | /en/solutions#reconciliation | `/en/solutions#reconciliation` | public | PASS |
| `/en/product` | /en/solutions#cost-variance | `/en/solutions#cost-variance` | public | PASS |
| `/en/product` | /en/solutions#procurement | `/en/solutions#procurement` | public | PASS |
| `/en/product` | /en/solutions#perishable | `/en/solutions#perishable` | public | PASS |
| `/en/product` | /en/company | `/en/company` | public | PASS |
| `/en/product` | /en/why | `/en/why` | public | PASS |
| `/en/product` | /en/blog | `/en/blog` | public | PASS |
| `/en/product` | /en/developers | `/en/developers` | public | PASS |
| `/en/product` | /en/contact | `/en/contact` | public | PASS |
| `/en/product` | /en/security | `/en/security` | public | PASS |
| `/en/product` | /en/privacy | `/en/privacy` | public | PASS |
| `/en/product` | /en/terms | `/en/terms` | public | PASS |
| `/en/product` | /en/imprint | `/en/imprint` | public | PASS |
| `/en/product/control-center` | RADR home | `/en` | public | PASS |
| `/en/product/control-center` | Platform | `/en/product` | public | PASS |
| `/en/product/control-center` | Where value leaks | `/en/solutions` | public | PASS |
| `/en/product/control-center` | Pricing | `/en/pricing` | public | PASS |
| `/en/product/control-center` | Company | `/en/company` | public | PASS |
| `/en/product/control-center` | Login | `/en/login` | public | PASS |

## Auth boundary

| Probe | Final | Status |
|---|---|---|
| `/app` | `http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fenter` | PASS |
| `/app/decisions/dec_peak_berlin` | `http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fdecisions%2Fdec_peak_berlin` | PASS |
| `/app/memory` | `http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fmemory` | PASS |
| `/app/connections` | `http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fconnections` | PASS |
| `/app/lab/control-center` | `http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Flab%2Fcontrol-center` | PASS |
| `/app/enter` | `http://localhost:3020/en/signup?intent=demo&next=%2Fapp%2Fenter` | PASS |

## Verdict

**PASS** — zero app leaks, zero route fails, auth gated server-side.

Full machine-readable dump: `tmp/public-interaction-crawl.json`.