# Launch baseline freeze — 2026-10-05

Phase 0 of the Final Launch Pass.

**Status:** Captured against production · 19 PNGs + `manifest.json` (all routes `ok: true`) · 2026-10-05T08:21Z

## Capture

```bash
PRODUCT_QA_BASE_URL=https://prep-ten-zeta.vercel.app \
  npx playwright test tests/e2e/launch-baseline-capture.spec.ts --project=desktop-1440
```

Outputs:

- `*.png` — route screenshots @1440×900
- `manifest.json` — smoke assert results

## Routes

See [`docs/RELEASE_BASELINE.md`](../../RELEASE_BASELINE.md).
