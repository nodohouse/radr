# Hospitality Live on the reverse tablet

The homepage reverse face uses `HospitalityLiveShowcase` for both Restaurant Live and Hotel Live. It automatically cycles restaurant, hotel and capacity every 6.5 seconds while the reverse face is visible. Restaurant/Hotel selectors let visitors choose directly without introducing playback controls or stopping motion on hover/focus. Reduced-motion and hidden/offscreen behavior remain governed by the existing tablet shell.

The initial headline also explicitly names restaurants, hotels and hospitality groups. The reverse face is a read-only synthetic product preview, not a connected booking or property-management service.

## Data and guest identity

`lib/marketing/hospitalityShowcase.ts` projects the existing restaurant service-command and hotel Live fixtures into a small presentation model. It does not generate new guest allergies, revenue results or provider connections.

- Table 8: Morgan party, returning, five visits. Current guest-reported sesame allergy, anniversary and quiet-service request. The current order totals $236, explicitly labeled ordered rather than paid. The distinct 20:15 Jordan booking carries a peanut allergy, birthday and step-free-route request.
- Table 6: $262 paid and no allergies reported for the current party. The incoming 20:10 Sam booking has unconfirmed allergies and a high-chair request. These states must remain distinct.
- Room 310: Michael Tan’s incoming 15:20 stay has shellfish allergy, birthday, feather-free bedding and quiet-room requirements. `hotelGuestNeeds` binds this fixture to the matching guest, room and arrival; another room does not inherit it.
- Missing guest records remain pending or unconfirmed, not allergy-free. An empty recorded allergy list means no allergies reported, not a safety guarantee. All reported requirements require reconfirmation.
- Hotel room readiness is a target or recorded state, not earned revenue. Unassigned rooms do not invent a guest count or stay history. A housekeeping timestamp on a non-cleaning room is labeled logged rather than claiming active cleaning.

## Visual and interaction model

The glass frame, approved mark, left navigation and native scroll turn are preserved. Restaurant cards sit on the existing oak-floor material with seating edges, order value, status and allergy signals. Hotel cards use room imagery, architectural cues, readiness, arrivals and incoming requirements. A selected guest panel keeps critical needs attached to the object; a compact timeline shows prior/current/next service context or housekeeping/arrival milestones.

At phone width, two object cards remain visible and more space goes to the selected guest record. Safety and next-booking text must fit inside the frame without a clipped panel or nested dashboard scroll. The workspace label, selected Live navigation state and active scene label must change with the hospitality view.

## Verification

Three unit regressions cover current versus incoming guest needs, order versus paid value, unknown versus none-reported allergies and room-bound requirements. Browser checks cover both views, selected cards, source-consistent guest details, automatic cycling, viewport fit, reduced motion and the existing native scroll geometry. No external messages, room updates or approvals are executed by the showcase.
