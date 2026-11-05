# Webhooks

**Public interface status: design proposal.** Public /v1 handlers, key issuance and subscriptions are not available services. Implemented application upload routes are documented separately in [Current implementation](../CURRENT_IMPLEMENTATION.md).

Inbound provider callbacks and outbound RADR delivery are proposed interfaces.

Proposed outbound events: `finding.created`, `decision.detected`, `decision.recommended`, `decision.approved`, `action.prepared`, `action.executed`, `outcome.observed`, `value.verified`, `memory.updated`.

No public subscription endpoint, signing header or delivery guarantee is established by these examples. Confirm the released contract before implementation.
