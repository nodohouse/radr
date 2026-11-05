# Implemented onboarding CSV contracts

These files are for authenticated contract/invoice onboarding analysis, not a generic operating CSV import. Limit: one UTF-8 CSV up to 1 MiB. Set multipart `documentType` to `CONTRACT` or `INVOICE`. The workspace session supplies organization scope.

Contract example:

```csv
supplier,sku,unit,contract_rate,currency
Example Supplier,OLIVE-OIL,L,6.80,USD
```

Invoice example:

```csv
supplier,invoice_id,sku,quantity,unit,unit_price,currency,invoice_date
Example Supplier,INV-EXAMPLE,OLIVE-OIL,420,L,7.45,USD,2026-10-30
```

Public downloads: `/developers/contracts-example.csv` and `/developers/invoices-example.csv`. Rows are synthetic. Use decimal points without thousands separators. Every row needs a unit and explicit three-letter currency code. Invalid or partially valid input is rejected. XLSX and PDF are not accepted in this CSV path.

Document storage uses a separate route and accepts PDF, JPEG and PNG. Upload storage is not evidence of full extraction, a Decision or Verified Value. Application validation limits do not override hosting payload limits.
