# Build your own integration

If a system exposes an API, webhook, export, or secure read-only data connection,
RADR can be designed to ingest it.

Options:

1. Use proposed ingest API (`POST /v1/ingest/...`) when available  
2. Implement a category adapter interface  
3. Map CSV / warehouse fields to the RADR contract  
4. Contact RADR with sanitized sample schema  

Minimum reservation contract:

- `externalId`
- `locationExternalId`
- `serviceTime`
- `partySize`
- `status`
- `sourceUpdatedAt`

See [ADDING_AN_INTEGRATION.md](../../ADDING_AN_INTEGRATION.md).
