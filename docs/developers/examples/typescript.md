# TypeScript example

```ts
const response = await fetch(
  `${process.env.RADR_API_BASE_URL}/v1/locations`,
  {
    headers: {
      Authorization: `Bearer ${process.env.RADR_API_KEY}`,
      Accept: "application/json",
    },
  },
);

if (!response.ok) {
  throw new Error(`RADR API error: ${response.status}`);
}

const locations = await response.json();
```

`RADR_API_BASE_URL` and `RADR_API_KEY` are **server** environment variables; never `NEXT_PUBLIC_*`.

**API status: PROPOSED** until handlers ship.
