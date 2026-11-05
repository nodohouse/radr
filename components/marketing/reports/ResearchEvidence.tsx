import type { EditorialContent } from "@/lib/marketing/editorial2026";
import { Link } from "@/i18n/navigation";
import "./research-evidence.css";

export function ResearchEvidence({
  research,
}: {
  research: NonNullable<EditorialContent["research"]>;
}) {
  const max = Math.max(...research.rows.map((row) => row.value), 1);
  return (
    <aside className="rr-evidence" aria-label="Research and worked example">
      <figure className="rr-evidence-chart">
        <p className="rr-evidence-kicker">THE NUMBERS, IN CONTEXT</p>
        <h2>{research.title}</h2>
        <div className="rr-evidence-bars">
          {research.rows.map((row) => (
            <div className="rr-evidence-row" key={row.label}>
              <div>
                <span>{row.label}</span>
                <strong>{row.display}</strong>
              </div>
              <div className="rr-evidence-track" aria-hidden="true">
                <span style={{ width: `${(row.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <figcaption>{research.caption}</figcaption>
      </figure>
      <section
        className="rr-evidence-model"
        aria-label="Illustrative calculation"
      >
        <p className="rr-evidence-kicker">
          WORKED EXAMPLE · ASSUMPTIONS, NOT A PROMISE
        </p>
        <h2>{research.calculation.title}</h2>
        <p>{research.calculation.assumptions}</p>
        <p className="rr-evidence-formula">{research.calculation.formula}</p>
        <strong className="rr-evidence-result">
          {research.calculation.result}
        </strong>
        <p>{research.calculation.limitation}</p>
        <Link href="/value-calculator">Model your own operation →</Link>
      </section>
      <section className="rr-evidence-sources" aria-label="Research sources">
        <h2>Sources & scope</h2>
        <p>
          Reviewed 5 November 2026. Industry research informs the context. It
          does not demonstrate RADR customer returns.
        </p>
        <ol>
          {research.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title} →
              </a>
              <p>{source.scope}</p>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
