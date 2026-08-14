import {
  INGEST_CHANNELS,
  PIPELINE,
  STACK_SOURCES,
} from "../config/architecture";
import { RadrWordmark } from "../RadrWordmark";

/**
 * Architecture — don't replace your stack; put it on RADR.
 */
export function SectionSystem() {
  return (
    <section
      className="rx-section rx-section-tight rx-dark"
      id="system"
      data-nav-theme="dark"
    >
      <div className="rx-shell rx-system">
        <div>
          <p className="rx-kicker">Architecture</p>
          <h2 className="rx-display rx-display-sm">
            Don&apos;t replace
            <br />
            your stack.
          </h2>
          <p className="rx-display rx-display-xs rx-system-sub">
            Put it on RADR.
          </p>
          <p className="rx-lead-inv rx-lead-short">
            RADR watches the economics between the systems you already run —
            then turns differences into verified value.
          </p>
        </div>
        <div className="rx-system-board">
          <ul>
            {STACK_SOURCES.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <div className="rx-system-hub">
            <RadrWordmark size="md" />
            <ol className="rx-system-pipe">
              {PIPELINE.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            <strong className="rx-system-hub-out">Verified value</strong>
          </div>
        </div>

        <ul className="rx-system-ingest" aria-label="Ingestion status">
          {INGEST_CHANNELS.filter((c) => c.status !== "PLANNED")
            .concat(INGEST_CHANNELS.filter((c) => c.status === "PLANNED").slice(0, 2))
            .map((c) => (
              <li key={c.id}>
                <strong>{c.title}</strong>
                <em data-status={c.status.toLowerCase().replace(" ", "-")}>
                  {c.status}
                </em>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
