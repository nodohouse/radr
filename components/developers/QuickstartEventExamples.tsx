import { readFile } from "node:fs/promises";
import path from "node:path";
import { CodeBlock } from "@/components/developers/CodeBlock";

/** Display the executable source itself so the docs cannot drift from the example. */
export async function QuickstartEventExamples() {
  const code = await readFile(
    path.join(process.cwd(), "scripts/demo-reference-ingestion.ts"),
    "utf8",
  );
  return (
    <div className="rx-dev-quick-code">
      <h2>Local reference example</h2>
      <p className="rx-dev-badge">Implemented · local reference</p>
      <p>
        No SDK installation or API key is needed. This runs inside the RADR
        source repository and normalizes synthetic reservations; it does not
        persist Decisions or execute actions.
      </p>
      <CodeBlock
        language="bash"
        code="npx tsx scripts/demo-reference-ingestion.ts"
      />
      <CodeBlock language="typescript" code={code} />
      <h3>Expected output</h3>
      <CodeBlock
        language="json"
        code={JSON.stringify(
          {
            mode: "local-reference",
            records: 2,
            provider: "radr-demo-reservations",
            statuses: ["confirmed", "cancelled"],
            provenancePresent: true,
          },
          null,
          2,
        )}
      />
    </div>
  );
}
