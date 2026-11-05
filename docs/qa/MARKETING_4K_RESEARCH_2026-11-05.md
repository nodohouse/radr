# Marketing polish and research review · 5 November 2026

## Scope

Homepage tablet and lower sections, large-display sizing, a continuous research banner, three free journal articles, company editorial links, and ten automated fictional buyer journeys. No production promotion. Frozen v4 logo geometry is unchanged.

The tablet is live HTML, type and SVG rather than a rendered video. At viewports of 2200 CSS pixels and above the homepage has a 1900px maximum composition, a proportionally scaled tablet and larger key typography. Secondary pages use a 1660px composition. 4K refers to verification at a 3840×2160 viewport; this does not claim every photographic source is a native 4K image. Existing hospitality images are not artificially upscaled. No generated humans were introduced.

Animations use native scrolling or transforms. The banner runs continuously while visible without playback controls or hover/focus stops; hidden tabs and offscreen sections suspend motion. Reduced motion presents a static banner and the existing instant tablet-face switch. Preserve 3D on the flip rig: `isolation:isolate` flattens its descendants and breaks reverse-face pointer hit testing.

## Research ledger

Free articles are published at:

- `/en/blog/restaurant-profitability-beyond-revenue`
- `/en/blog/hotel-distribution-contribution`
- `/en/blog/kitchen-waste-measured-value`

Each article has an accessible labeled chart, worked calculation, direct source links, sample scope and limitations. The journal and company page surface the new material; the homepage offers three research cards before the existing gated playbook.

| Source                                                                                                                                                                                                                                  | Population and period                                   | Permitted use                                                                                                  | Important limitation                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [National Restaurant Association, July 2026](https://www.restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/elevated-costs-continue-to-pressure-restaurant-profitability/)                     | U.S. operators, reporting on 2025                       | 42% reported not profitable                                                                                    | Includes break-even; not 42% losing money, bankrupt, or a global count                                                                                                |
| [National Restaurant Association, October 2025](https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/elevated-labor-costs-had-a-significant-impact-on-restaurant-profitability-in-2024/) | 2024 operating data from more than 900 U.S. operators   | Labor including benefits: full-service profitable/loss-making medians 34.2%/42.9%; limited-service 30.0%/34.1% | Group medians, not loss-making incidence, causal effects, or labor-cutting targets                                                                                    |
| [CBRE, May 2025](https://www.cbre.com/insights/articles/all-eyes-on-operating-costs-in-2025-lessons-learned-in-2024)                                                                                                                    | Preliminary sample, 2,600 U.S. hotels; 2024 vs 2023     | Revenue growth 2.3%, expenses above GOP 4.1%                                                                   | Cost-growth pattern excepts limited-service and extended-stay; does not estimate loss-making hotel proportion                                                         |
| [HOTREC, September 2026](https://www.hotrec.eu/en/news_booking-holdings-and-expedia-group-account-for-85-of-europe_E2_80_99s-ota-market-hotrec-study-finds.html)                                                                        | 2,713 European hotels; 2025 bookings                    | Direct 51.3%, OTA 29.9%; Booking+Expedia 85.4% of OTA bookings                                                 | OTA share is not commission rate, loss, or recoverable money; 85.4% is not all hotel bookings                                                                         |
| [UKHospitality citing WRAP](https://www.ukhospitality.org.uk/guidance/reducing-food-waste/)                                                                                                                                             | UK hospitality and food service, sector annual estimate | GBP 3.2bn estimated annual food-waste cost                                                                     | Not a new 2026 measurement, global estimate, or restaurant-only figure. WRAP page was unavailable to the browser; attribution is to the accessible UKHospitality page |
| [Champions 12.3 / WRI / WRAP, 2018](https://champions123.org/publication/business-case-reducing-food-loss-and-waste-hotels)                                                                                                             | Reviewed programs at 42 hotels in 15 countries          | Average USD 7 savings per USD 1 invested; average 21% kitchen waste weight reduction within a year             | Historical program observations, not randomized RADR evidence, guaranteed returns, or current industry-wide averages                                                  |

No unsupported global count of loss-making hospitality businesses is asserted. Sources do not establish such a count. Restaurant and hotel studies use different periods, geographies and denominators and are not pooled.

## Independently checked scenario arithmetic

All inputs below are explicit illustrative assumptions. Program costs are not RADR prices. These scenarios do not feed benchmark percentages into the public calculator or promise a return.

1. Restaurant: USD 10,000,000 annual revenue × 0.005 contribution lift = USD 50,000 protected annually. Less USD 18,000 annual complete program cost = USD 32,000 net benefit. Net ROI = 32,000 / 18,000 = 177.8%. Break-even = 18,000 / 10,000,000 = 0.18 percentage points = 18 basis points.
2. Hotel: 200 rooms × 365 days × 75% occupancy = 54,750 sold room nights. A 2 percentage-point channel shift at USD 160 ADR and an 8 percentage-point net acquisition-cost gap = 54,750 × 0.02 × 160 × 0.08 = USD 14,016 annual protected contribution. Same demand and rate assumed; complete direct acquisition costs must be included in the gap; program costs excluded.
3. Kitchen: USD 6,000 waste ingredient cost per month × 10% assumed reduction × 12 = USD 7,200 protected annually. Less USD 3,000 complete annual program cost = USD 4,200 net benefit. Net ROI = 4,200 / 3,000 = 140%. Comparable volume and ingredient prices assumed; no duplicate counting of avoided purchases and ingredient waste.

## Buyer verification method

`tests/e2e/marketing-buyer-journeys.spec.ts` uses ten fictional task-based profiles. These are automated simulations, not ten actual prospects or a customer study. Every profile visits the homepage, platform, solutions, calculator, pricing, company, a free research article and the playbook form. Each selects product/problem tabs, completes the full calculator with different scale/currency/economics inputs, checks the displayed model against the deterministic calculation engine, compares plans, opens pricing FAQ and follows a sales-intent link. Existing independent calculator regression tests check the arithmetic separately.

Profiles: independent restaurant owner (USD), hotel GM (EUR), restaurant-group CFO (GBP, 4K), mixed-group COO (USD), resort director (AED, tablet), chef/owner (EUR, phone), hotel revenue manager (USD), serviced-apartment operator (GBP, tablet), group procurement lead (SGD), and bar-group finance director (AUD, phone).

The visual audit captures 3840, 1920, 820 and 390px widths and checks homepage, pricing, research article and both hospitality tablet modes. Evidence artifacts are stored outside source in `/workspace/work/qa/`. The existing native-scroll regression now includes 4K and 1920px widths, with fixed page height and readable reverse-face hit testing.

## Availability

The interactive product remains a synthetic-data demo. Commercial connectors and autonomous execution remain planned. No industry research is represented as a RADR customer outcome. Pricing remains custom quote with proposed engagement scopes.

The user explicitly requested skipping playbook lead-delivery configuration for now. No recipient, webhook or email service is invented. Downloads remain gated and requests unavailable until a real delivery integration is configured. Free articles are publicly accessible.
