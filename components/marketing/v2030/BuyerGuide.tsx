import { Link } from "@/i18n/navigation";
import {
  ECONOMIC_GUIDES,
  LEAK_FIELD_NOTES,
  type EconomicGuideId,
} from "@/lib/marketing/buyerGuide";
import "@/app/buyer-guide.css";

export function SolutionFieldNotes({
  id,
}: {
  id: keyof typeof LEAK_FIELD_NOTES;
}) {
  const note = LEAK_FIELD_NOTES[id];
  return (
    <section className="br-field-notes" aria-labelledby="br-field-title">
      <div className="br-field-heading">
        <p className="rx30-kicker">A practical first check</p>
        <h3 id="br-field-title">What you can investigate today.</h3>
        <p>{note.takeaway}</p>
      </div>
      <dl>
        <div>
          <dt>Gather these records</dt>
          <dd>{note.records}</dd>
        </div>
        <div>
          <dt>Rule out the obvious</dt>
          <dd>{note.check}</dd>
        </div>
        <div>
          <dt>Make the economics reviewable</dt>
          <dd>{note.proof}</dd>
        </div>
      </dl>
      <Link href="/demo" className="br-inline-link">
        Explore the decision workflow in the demo →
      </Link>
    </section>
  );
}
export function EconomicLensOverview({ active }: { active?: EconomicGuideId }) {
  return (
    <section
      className="rx30-pain br-lens-section"
      id="lenses"
      aria-labelledby="br-lenses-title"
    >
      <div className="rx30-shell">
        <p className="rx30-kicker">
          Four economic lenses. One operating model.
        </p>
        <h2 id="br-lenses-title" className="rx30-h2">
          Look across the operation.
        </h2>
        <p className="rx30-lead">
          Purchasing, staffing, demand and recovery affect each other. These are
          connected views of the same decisions.
        </p>
        <div className="br-lens-grid">
          {Object.entries(ECONOMIC_GUIDES).map(([key, g]) => (
            <Link
              key={key}
              href={`/solutions/${key}`}
              aria-current={active === key ? "page" : undefined}
            >
              <span>{key.toUpperCase()}</span>
              <h3>{g.title}</h3>
              <p>{g.question}</p>
              <b>
                Explore this lens <span aria-hidden>→</span>
              </b>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
export function EvaluationChecklist({
  company = false,
}: {
  company?: boolean;
}) {
  const rows = company
    ? [
        [
          "Trace the source",
          "Can you find the records, dates, locations and assumptions behind the recommendation?",
        ],
        [
          "Compare a real alternative",
          "Does the comparison include doing nothing, response costs and operating constraints?",
        ],
        [
          "Keep the operator in control",
          "Is it clear who owns the decision and which actions require approval?",
        ],
        [
          "Check the outcome",
          "Can the expected result be compared with recorded evidence, without counting the same value twice?",
        ],
      ]
    : [
        [
          "Start with comparable records",
          "Prepare location IDs, source timestamps, reporting currency and stable record IDs. Check supported file requirements before importing.",
        ],
        [
          "Test one decision end to end",
          "Ask what changed, why it matters, what the alternatives cost and who makes the call. Include the cost of doing nothing.",
        ],
        [
          "Define proof before acting",
          "Agree on a baseline, a review window and the outcome records. Keep modeled expectations separate from observed and verified results.",
        ],
      ];
  return (
    <section
      className="rx30-connect br-check-section"
      aria-labelledby={company ? "br-company-check" : "br-platform-check"}
    >
      <div className="rx30-shell br-check-layout">
        <div>
          <p className="rx30-kicker">
            {company ? "A standard you can use" : "Evaluate the platform"}
          </p>
          <h2
            className="rx30-h2"
            id={company ? "br-company-check" : "br-platform-check"}
          >
            {company
              ? "Four questions worth asking any decision system."
              : "A useful evaluation starts with a clear test."}
          </h2>
          <p className="rx30-lead">
            {company
              ? "Use these questions when reviewing RADR or any recommendation that could affect your operation."
              : "Use the fictional demo to understand the workflow. Use your own source records later to test whether a decision is supported."}
          </p>
          <Link
            className="br-inline-link"
            href={
              company
                ? "/value-calculator/methodology"
                : "/developers#quickstart"
            }
          >
            {company
              ? "Inspect the calculator’s assumptions"
              : "Review the data requirements"}{" "}
            →
          </Link>
        </div>
        <ol className="br-checklist">
          {rows.map(([title, body], i) => (
            <li key={title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
