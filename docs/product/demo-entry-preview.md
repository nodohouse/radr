# Demo entry and workspace accounts

The public demo chooser links to `/signup?intent=demo` with the hotel or restaurant selection preserved. This is an introduction-form preview, not account signup. Required fields explain the eventual lead journey: full name, work email, company, role, location count and chosen world. The form validates trimmed values and disables entry until complete. Its inputs wait for client readiness and retain explicit React state.

At the user's request, CRM and durable lead storage remain deferred. Contact fields never leave the page and are not written to local or session storage. The privacy note makes this explicit. Only `{ vertical }` is posted to `/api/demo/access`. There is no lead-delivery success claim, email, CRM request or account creation.

The endpoint checks same-origin requests, bounds the body, validates the world and throttles repeated calls. It issues an HTTP-only, SameSite=Lax cookie for eight hours, with Secure enabled in production. The signed payload contains a fictional-demo scope, expiry and random nonce, with no contact details or workspace privileges. It uses a domain-separated key derived from `DEMO_SESSION_SECRET` or `BETTER_AUTH_SECRET`. The development fallback is never accepted in production.

Middleware and the product layout both verify the guest grant. It opens only the fictional `/app` route tree in a DEMO build. LIVE and SANDBOX reject it. Workspace routes such as `/onboarding` and existing API identity/authorization checks still require an actual account. Guest grants are never passed to the identity provider as user sessions. Account signup remains a separate `/signup?intent=workspace` option and continues to respect persistent-account-storage availability.

The shared entry shell uses a looping signal showcase for reservations, hotel readiness and service pressure. All examples are labeled fictional. Motion has no playback controls, does not move the form, and stays still for reduced-motion preferences. The marketing Platform sneak peek remains passive.

Before enabling lead capture, connect a private receiving service, define retention and access rules, update the notice and replace preview-only behavior with delivery confirmation. Before enabling hosted accounts, configure and migrate persistent Postgres and validate signup/sign-in/recovery independently. Do not repurpose the demo grant as real workspace authentication.
