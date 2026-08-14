import {
  INGEST_CHANNELS,
  OPERATING_MODEL_ENTITIES,
  PIPELINE,
  STACK_SOURCES,
} from "../config/architecture";
import { BRAND } from "../config/brand";
import { RadrWordmark } from "../RadrWordmark";

/**
 * How RADR sees the operation — data in → normalize → intelligence → value.
 */
export function SectionSees() {
  return (
    <section
      className="rx-section rx-dark rx-sees"
      id="sees"
      data-nav-theme="dark"
    >
      <div className="rx-shell">
        <div className="rx-sees-intro">
          <p className="rx-kicker">How RADR sees</p>
          <h2 className="rx-display">
            Your operation already
            <br />
            has the data.
          </h2>
          <p className="rx-display rx-display-sm rx-sees-sub">
            RADR connects the dots.
          </p>
          <p className="rx-lead-inv rx-lead-short">
            RADR brings together operational, financial and commercial data that
            normally lives in separate systems — then continuously compares what
            happened with what should have happened.
          </p>
        </div>

        <div className="rx-sees-flow" aria-label="RADR data pipeline">
          <div className="rx-sees-sources">
            <p className="rx-meta-label">Data sources</p>
            <ul>
              {STACK_SOURCES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <ol className="rx-sees-pipe">
            {PIPELINE.map((step) => (
              <li key={step}>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="rx-sees-hub">
            <RadrWordmark size="md" />
            <p>Normalized operating model</p>
            <strong>Verified value</strong>
          </div>
        </div>

        <div className="rx-sees-grid">
          <article className="rx-sees-card">
            <p className="rx-kicker">Ingestion</p>
            <h3>Don&apos;t replace your stack.</h3>
            <p>Put it on RADR.</p>
            <ul className="rx-sees-ingest">
              {INGEST_CHANNELS.map((c) => (
                <li key={c.id}>
                  <div>
                    <strong>{c.title}</strong>
                    <span>{c.body}</span>
                  </div>
                  <em data-status={c.status.toLowerCase().replace(" ", "-")}>
                    {c.status}
                  </em>
                </li>
              ))}
            </ul>
          </article>

          <article className="rx-sees-card">
            <p className="rx-kicker">Normalization</p>
            <h3>RADR builds a common operating model.</h3>
            <p>
              Every system names the business differently. RADR maps data into
              one operating model so supplier prices can be compared with
              contracts, staffing with demand, payouts with expected settlements,
              and pricing with opportunity.
            </p>
            <ul className="rx-sees-entities">
              {OPERATING_MODEL_ENTITIES.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <p className="rx-sees-footnote">{BRAND.explanation}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
