# RADR brand assets (master)

Canonical production logos — left terminal restored + intrinsic clear space (2026-10-26).

## Use

- `radr-wordmark-master.svg` — primary R[A]DR wordmark
- `radr-mark-master.svg` — standalone A-mark + green focal dot
- White / mono variants: `*-master-white.svg`, `*-master-mono-*.svg`

Render via `components/brand/FrozenRadrLogo.tsx` (`<img>` only).

## Do not

- Rebuild geometry in CSS/JSX
- Detach or reposition the green dot
- Stretch width/height independently
- Import files under `legacy/` or reintroduce cropped `*-traced*.svg`

## Deprecated

- `*-traced*.svg` — superseded (left leg cropped at x=0)
- `legacy/approximated-2026-10/` — hand-built approximations
