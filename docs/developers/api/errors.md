# Errors

**Public interface status: design proposal.** Public /v1 handlers, key issuance and subscriptions are not available services. Implemented application upload routes are documented separately in [Current implementation](../CURRENT_IMPLEMENTATION.md).

```json
{
  "error": {
    "code": "INVALID_LOCATION",
    "message": "Location does not exist or is not accessible.",
    "request_id": "req_example"
  }
}
```
