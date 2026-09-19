# Idempotency

Unique key: `(tenantId, providerId, externalId)`.
Mutating API requests should send `Idempotency-Key` where supported.
