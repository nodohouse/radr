# Ingestion

Channels: APIs · Webhooks · Files · SFTP · Database connectors · Custom adapters.

Flow: validate → acknowledge → queue → normalize → recalculate → persist.

Heavy work must not run inside the webhook HTTP request.
