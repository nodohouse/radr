# RADR visual review

The hero was approved in chat. The user then authorized the remaining reference sequence: systems, Decision Gap, decision object, hospitality, Value Map, closing scene. Each chapter was captured and visually inspected before the next was implemented.

## Review files

- `full-page-1512.png`: complete desktop page at the canonical 1512 px width.
- `current-1512x982.png`: canonical first viewport.
- `02-systems.png` through `07-final.png`: individual desktop chapters.
- `full-page-390.png`: mobile page.
- `full-page-768.png`: tablet page.
- `current-3840x2160.png`: 4K viewport layout.
- `results.json`: actual browser outcomes from the latest run.

Run the site with `npm run dev -- --hostname 127.0.0.1`, then from the checkout:

```sh
NODE_PATH=/workspace/radr-visual-tools/node_modules node docs/visual-qa/capture.mjs
```

The tooling uses an external Playwright installation and system Chromium. For a different machine, install Playwright in a tooling location outside this checkout and point `NODE_PATH` there. `CHROMIUM_PATH` can select another installed Chromium. Browser errors, failed image loads, horizontal overflow, hidden hero content, or failed interaction assertions cause a nonzero exit.

The run verifies both `/` and `/en`, all six decision stages, the action/verification flow, Restaurant/Hotel selection, calculator arithmetic, negative-input handling, native dialog Escape/focus behavior, on-page navigation, and the mobile menu. Layout checks cover 1512, 1920, 1440, 1280, 1024, 768, 430, 390, and 3840 px widths.

## Reference comparison and limitations

The original reference is visible inline in chat but no original local image file was supplied. Visual review uses that visible reference. Exact pixel deviations and a 50% overlay are not claimed. To create an overlay, supply an original reference PNG:

```sh
RADR_REFERENCE=/absolute/path/to/reference.png NODE_PATH=/workspace/radr-visual-tools/node_modules node docs/visual-qa/capture.mjs
```

Photography is newly generated with user authorization, not an exact reconstruction of the reference's architecture. Original 1536 × 1024 plates remain in `/workspace/generated_images`; the site serves optimized WebP versions. The 4K check validates layout; these photographs do not have native 4K detail.

Preview metrics are illustrative, not live customer results. The Value Map calculator is a local scenario model using user-adjustable assumptions, not an integration or a forecast. CTAs link to existing contact/platform pages; no publication or deployment was performed.
