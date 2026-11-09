# Hotel property explorer

The hotel Live surface starts with a conceptual 3D exterior. Operators can orbit and zoom the building, select a floor, then review room readiness and guest context. The marketing Platform tour uses the same exterior and room renderer as the product.

## Interaction

- The whole building remains opaque. A jade façade band identifies the focused floor.
- Floor buttons provide a keyboard and touch path independent of WebGL. Selecting a floor moves the camera toward that floor before opening it. Reduced motion skips the transition.
- In the marketing tour, scrolling remains page scrolling until the visitor selects **Explore in 3D** or **Explore the rooms**. Escape exits exploration. In the product, opening a demo floor leads to the existing operational view and room inspector.
- **Whole building** returns to the exterior. The local preview also allows changing floors without returning outside.
- If WebGL is unavailable or its context is lost, an architectural elevation replaces the exterior. Floor buttons still open rooms; the room renderer has its own isometric fallback.

## Generate a property

**Generate your building** accepts a name, guest floor count and total room count. Validation requires a nonblank name of at most 60 characters, 1–24 whole-number floors, at least one room per floor, at most 60 rooms per floor, and at most 960 rooms in total.

Room counts are allocated evenly; lower floors receive any remainder. IDs include the floor and a two-digit room sequence, so IDs remain unique throughout the supported range. The exterior and floor layouts are conceptual geometry, not measured architectural drawings or an interpretation of uploaded plans.

In product Live, the specification is saved in versioned local storage under the demo property key. This is device-local saving, not a customer account or server-side property record. The public marketing tour keeps generated properties in memory for that visit. Reset restores the canonical demo property. Stored values are validated before use; unavailable browser storage leaves the generator usable for the current session.

## Operational truth

Geometry and operational records are separate. Generated rooms always show **Not connected** and **Awaiting operating data**. They never inherit the demo property's bookings, allergy records, readiness states, tasks or revenue. Product KPI cards are hidden while displaying a generated property preview.

The Mercer House demo has 200 property rooms across eight floors, with 134 room records mapped in this fixture. The exterior explicitly identifies this as a conceptual representation; its windows are illustrative, not a one-window-per-room mapping. Floor selectors show mapped room counts. No complete 200-room readiness total is inferred from the 134-room map.

The canonical Room 310 incoming stay retains its reported shellfish allergy, birthday request, feather-free bedding and estimated 14:58 readiness. These needs are linked by `hotelGuestNeeds` to the specific incoming stay and do not transfer to other rooms or an occupied/current stay. Missing allergy records remain unconfirmed.

## Implementation and verification

- `lib/product/hotelBuilding.ts`: geometry schema validation and deterministic room allocation.
- `components/product/hotel-building/`: exterior scene, camera transition, generator, elevation fallback and floor preview.
- `HotelLiveShell`: product entry, floor handoff and local property persistence.
- `PlatformLivePreview`: public Hotel/Restaurant switch and shared hotel explorer.
- `tests/hotel-building.test.ts`: allocation, boundary validation and room-ID uniqueness.
- `tests/e2e/hotel-building.spec.ts`: generation validation, guest separation, 3D controls, accessibility and product persistence.
- `tests/e2e/platform-workspace.spec.ts`: four viewport widths, workspace navigation, scoped guest data, scrolling, fallback, reduced motion and accessibility.

The exterior scene is lazy loaded, renders on demand and caps pixel ratio at 1.75. It uses procedural geometry without remote textures or third-party requests. The supported floor/room limits bound the generated scene size.

Account onboarding and server-side property persistence are separate work. This change does not enable hosted customer accounts, infer a real building from an address, parse architectural uploads, or connect a PMS feed.
