# Hospitality Decision Playbook / November 2026

The 16-page PDF is private and delivered only by the signed report-download route. Public PNGs expose the cover and two selected preview pages, not the complete publication.

## Rebuild

Run `python scripts/generate-hospitality-report.py` with ReportLab, fontTools and Brotli installed. The generator uses the website's cached Manrope Latin face when available and Open Sans as a fallback. To reproduce the checked edition, build the website first so Manrope is present in `.next/static`.

The PDF uses the same sapphire, ocean, and neon-jade palette as the website and product, read from `lib/brand/palette.json`.

Generate the public previews with `pdftoppm`, using pages 1 (1100px), 4 (1000px), and 14 (1000px), PNG, singlefile. Keep `lib/marketing/report.ts` page count aligned with the publication.

## Research and claim boundaries

Six linked primary or attributed industry sources are recorded on page 16, with geography, period, sample and limitations. Review date: 4 November 2026. No incompatible global, UK, US or European financial figures are added or extrapolated. The UNEP food-system economic toll is not described as hospitality-only or RADR-recoverable. OTA booking share is not a loss measure. Historical food-waste program results are not RADR ROI.

Page 6 is assumed arithmetic, not a forecast. D-1911 and D-7110 are synthetic product examples. Expected, completed-service and verified outcomes remain distinct. Integration availability and execution permission are not implied by a recommendation.

## Imagery

`public/marketing/reports/hospitality-scene.jpg` and `kitchen-service.jpg` are original AI-generated editorial illustrations of empty fictional hospitality venues without people, generated for this publication on 4 November 2026. They are not customer photographs or evidence of a deployed venue. The original PNGs are retained in the execution workspace's generated-images directory; JPEGs are format conversions for distribution size. The cover uses the approved v4 white mark with its original paths and green dot.

## Validation

16-page visual inspection; English selectable text and embedded fonts; original-source PDF hyperlinks; report lead-gate unit checks; browser validation of required fields, webhook success/failure and actual private PDF download; desktop/mobile accessibility and overflow checks. Live lead delivery requires a configured REPORT_LEAD_WEBHOOK_URL or CONTACT_WEBHOOK_URL plus the signing secret. The design does not enable or simulate delivery when these are missing.
