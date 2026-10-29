# Navigation dropdowns

ReferenceNav is shared by the homepage and public marketing pages. Platform, Solutions, and Company open descriptive dropdowns; Pricing and Value Calculator remain direct links. All destinations use existing pages and section anchors.

Desktop menus use disclosure buttons with aria-expanded and aria-controls. Only one menu opens at a time. Escape restores focus to the trigger; outside clicks, focus leaving the header, link activation, and resizing dismiss the panel. Mobile uses a scrollable navigation panel with native expandable groups. Reduced motion disables the entrance animation.

Validation: production build including TypeScript and lint passed. `verify.mjs` passed nine desktop page/viewport combinations (1920, 1512, 1024 widths; homepage, Solutions, calculator), four mobile widths (900, 768, 390, 320), deep-link activation, single-open behavior, outside-click dismissal, Escape focus restoration, keyboard activation and focus dismissal. No browser errors or horizontal overflow. Desktop and mobile screenshots were inspected locally. Directional arrows use the existing supported arrow glyph.
