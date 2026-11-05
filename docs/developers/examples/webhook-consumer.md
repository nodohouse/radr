# Proposed outbound webhook consumer

Public webhook delivery is not live. The signing algorithm, headers, timestamp tolerance, retry policy and subscription mechanism must be finalized and published before a consumer can be treated as interoperable.

The design should verify the exact raw bytes and endpoint signature, validate freshness, deduplicate on a stable event ID, then parse and enqueue work safely. Acknowledge only according to the published delivery contract. Do not assume all providers use one HMAC header or scheme.

Current event examples are proposals. This document is not an executable delivery contract or evidence of provider callbacks being received.
