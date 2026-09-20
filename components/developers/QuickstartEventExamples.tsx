"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/developers/CodeBlock";

type Vertical = "hotel" | "restaurant" | "aparthotel";

const EXAMPLES: Record<Vertical, { label: string; code: string }> = {
  hotel: {
    label: "Hotel",
    code: `// Technical Preview · proposed typed SDK
const radr = new RADR({
  baseUrl: process.env.RADR_API_BASE_URL,
  apiKey: process.env.RADR_API_KEY,
})

await radr.reservations.create({
  location: "canal-house",
  partySize: 2,
  serviceTime: "2026-08-24T15:00:00+02:00",
  channel: "direct",
  roomType: "premium",
})
// Pipeline: EVENT → NORMALIZED OPERATING STATE → FINDING → DECISION → …
// Under the hood, typed methods map to radr.events.ingest(...)`,
  },
  restaurant: {
    label: "Restaurant",
    code: `// Technical Preview · proposed typed SDK
const radr = new RADR({
  baseUrl: process.env.RADR_API_BASE_URL,
  apiKey: process.env.RADR_API_KEY,
})

await radr.reservations.create({
  location: "berlin-mitte",
  partySize: 4,
  serviceTime: "2026-08-24T20:00:00+02:00",
  channel: "direct",
})
// Pipeline: EVENT → NORMALIZED OPERATING STATE → FINDING → DECISION → …
// Under the hood, typed methods map to radr.events.ingest(...)`,
  },
  aparthotel: {
    label: "Aparthotel",
    code: `// Technical Preview · proposed typed SDK
const radr = new RADR({
  baseUrl: process.env.RADR_API_BASE_URL,
  apiKey: process.env.RADR_API_KEY,
})

await radr.reservations.create({
  location: "lisbon-alfama",
  unitId: "1bed-04",
  checkIn: "2026-08-26",
  checkOut: "2026-08-28",
  channel: "direct",
})
// Pipeline: EVENT → NORMALIZED OPERATING STATE → FINDING → DECISION → …
// Under the hood, typed methods map to radr.events.ingest(...)`,
  },
};

export function QuickstartEventExamples() {
  const [vertical, setVertical] = useState<Vertical>("hotel");
  const example = EXAMPLES[vertical];

  return (
    <div className="rx-dev-quick-code">
      <div className="rx-dev-quick-tabs" role="tablist" aria-label="Example vertical">
        {(Object.keys(EXAMPLES) as Vertical[]).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={vertical === id}
            data-on={vertical === id ? "true" : undefined}
            onClick={() => setVertical(id)}
          >
            {EXAMPLES[id].label}
          </button>
        ))}
      </div>
      <CodeBlock language="typescript" code={example.code} />
    </div>
  );
}
