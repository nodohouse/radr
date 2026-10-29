# Navigation dropdowns

ReferenceNav is shared by the homepage and public marketing pages. Platform, Solutions, and Company open descriptive dropdowns; Pricing and Value Calculator remain direct links. All destinations use existing pages and section anchors.

Desktop menus use disclosure buttons with aria-expanded and aria-controls. Only one menu opens at a time. Escape restores focus to the trigger; outside clicks, focus leaving the header, link activation, and resizing dismiss the panel. Mobile uses a scrollable navigation panel with native expandable groups. Reduced motion disables the entrance animation.

Validation: production build including TypeScript and lint passed. `verify.mjs` passed nine desktop page/viewport combinations (1920, 1512, 1024 widths; homepage, Solutions, calculator), four mobile widths (900, 768, 390, 320), deep-link activation, single-open behavior, outside-click dismissal, Escape focus restoration, keyboard activation and focus dismissal. No browser errors or horizontal overflow. Desktop and mobile screenshots were inspected locally. Directional arrows use the existing supported arrow glyph.

## Hover and shared interaction refinement

Desktop pointer hover opens a menu after 90ms of intent. Leaving the header and dropdown dismisses it after 200ms; entering the panel cancels dismissal. Switching triggers changes the menu, while hovering direct navigation links dismisses it. Mouse behavior is limited to hover-capable fine pointers; touch retains explicit taps. Outside clicks, resize, Escape, and unmount cancel pending timers.

The shared public-site stylesheet adds consistent focus rings, understated link underlines, directional feedback, button depth, and contextual card highlighting. Reduced-motion preferences disable movement. Each dropdown now includes useful direct paths to the value calculator and a demo walkthrough.

`hover.mjs` covers hover opening, movement into the panel, switching and dismissal across 13 public routes, plus actual touch taps. The existing keyboard/mobile disclosure checks remain applicable.
