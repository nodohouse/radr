# CSV import contract

Minimum columns (example):

```
location_external_id,business_date,revenue,covers,labor_cost,currency
berlin-mitte,2026-08-24,18420.00,142,4120.00,EUR
```

Validate schema, types, currency, timezone, duplicates. Return row-level errors.
