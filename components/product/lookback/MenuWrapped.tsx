"use client";

import { formatEuro } from "@/lib/radr/money";
import type {
  DishIntel,
  MenuMoment,
  MenuWrappedBrief,
} from "@/lib/radr/lookback/demoMenuWrapped";

type Props = {
  brief: MenuWrappedBrief;
  selectedDishId?: string | null;
  onSelectDish?: (dishId: string | null) => void;
  /** When true, omit outer chapter title (parent owns chapter head) */
  embedded?: boolean;
};

/**
 * Editorial "year on the menu" - memorable moments, not a card dump.
 */
export function MenuWrapped({
  brief,
  selectedDishId,
  onSelectDish,
  embedded = false,
}: Props) {
  const featured = brief.moments[0];
  const rest = brief.moments.slice(1);

  return (
    <section
      className="rp-menuwrap"
      aria-label="Your year on the menu"
      data-embedded={embedded ? "true" : undefined}
    >
      {!embedded ? (
        <header className="rp-menuwrap-head">
          <p className="rp-lookback-kicker">Your year on the menu</p>
          <h2 className="rp-menuwrap-title">
            The story of the restaurant’s year
          </h2>
          <p className="rp-menuwrap-lead">
            {brief.yearLabel} · {brief.scopeLine}. Best selling is not best
            performing - contribution, cost, waste, and guests decide.
          </p>
        </header>
      ) : (
        <p className="rp-menuwrap-lead" data-embedded="true">
          {brief.yearLabel} · {brief.scopeLine}. Best selling is not best
          performing.
        </p>
      )}

      <p className="rp-menuwrap-health">
        <strong>{brief.health.strong}</strong> strong ·{" "}
        <strong>{brief.health.review}</strong> need review ·{" "}
        <strong>{brief.health.replace}</strong> replacement candidates
      </p>

      <div className="rp-menuwrap-decisions">
        <p className="rp-lookback-sec-label">Decide first</p>
        <div className="rp-menuwrap-lanes">
          {brief.decisions.map((lane) => (
            <div
              key={lane.id}
              className="rp-menuwrap-lane"
              data-lane={lane.id}
            >
              <h3>{lane.label}</h3>
              <ul>
                {lane.items.map((item) => (
                  <li key={item.dishId}>
                    <button
                      type="button"
                      onClick={() => onSelectDish?.(item.dishId)}
                    >
                      <strong>{item.name}</strong>
                      <span>{item.note}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rp-menuwrap-plan">
        <p className="rp-lookback-sec-label">
          RADR’s {brief.nextYearLabel} menu plan
        </p>
        <ol className="rp-menuwrap-plan-list">
          {brief.plan.map((a) => (
            <li key={a.id}>
              <span className="rp-menuwrap-plan-rank">
                {String(a.rank).padStart(2, "0")}
              </span>
              <div>
                <h3>{a.title}</h3>
                {a.impactValue ? (
                  <p className="rp-menuwrap-plan-impact">
                    <strong>{a.impactValue}</strong>
                    <span>{a.impactLabel}</span>
                    {a.confidence ? <em>{a.confidence} confidence</em> : null}
                  </p>
                ) : null}
                <ul className="rp-menuwrap-plan-why">
                  {a.why.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                {a.drivers?.length ? (
                  <p className="rp-menuwrap-plan-drivers">
                    Drivers: {a.drivers.join(" · ")}
                  </p>
                ) : null}
                <p className="rp-menuwrap-plan-action">{a.action}</p>
                {a.options?.length ? (
                  <p className="rp-menuwrap-plan-opts">
                    Options: {a.options.join(" · ")}
                  </p>
                ) : null}
                {a.dishId ? (
                  <button
                    type="button"
                    className="rp-menuwrap-plan-open"
                    onClick={() => onSelectDish?.(a.dishId!)}
                  >
                    Open dish
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rp-menuwrap-moments">
        <p className="rp-lookback-sec-label">Evidence · menu moments</p>
        {featured ? (
          <MomentBlock
            moment={featured}
            featured
            active={selectedDishId === featured.dishId}
            onOpen={
              featured.dishId
                ? () =>
                    onSelectDish?.(
                      selectedDishId === featured.dishId
                        ? null
                        : featured.dishId!,
                    )
                : undefined
            }
          />
        ) : null}
        <div className="rp-menuwrap-moments-grid">
          {rest.map((m) => (
            <MomentBlock
              key={m.id}
              moment={m}
              active={selectedDishId === m.dishId}
              onOpen={
                m.dishId || m.image
                  ? () => {
                      if (m.dishId) {
                        onSelectDish?.(
                          selectedDishId === m.dishId ? null : m.dishId,
                        );
                      }
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      <div className="rp-menuwrap-buy">
        <p className="rp-lookback-sec-label">
          What to buy differently in {brief.nextYearLabel}
        </p>
        <p className="rp-menuwrap-buy-lead">
          Recommendations - not automatic orders.
        </p>
        <ul className="rp-menuwrap-buy-list">
          {brief.purchasing.map((p) => (
            <li key={p.id} data-tone={p.tone}>
              <strong>{p.item}</strong>
              <em>{p.change}</em>
              <span>{p.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function MomentBlock({
  moment,
  featured = false,
  active,
  onOpen,
}: {
  moment: MenuMoment;
  featured?: boolean;
  active?: boolean;
  onOpen?: () => void;
}) {
  const why = featured ? moment.why : moment.why.slice(0, 2);
  const metrics = featured ? moment.metrics : moment.metrics.slice(0, 4);

  const body = (
    <>
      <div
        className="rp-menuwrap-moment-art"
        aria-hidden="true"
        data-plate={moment.plate}
      >
        {moment.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={moment.image} alt="" className="rp-menuwrap-moment-photo" />
        ) : (
          <span>{moment.title.slice(0, 1)}</span>
        )}
      </div>
      <div className="rp-menuwrap-moment-body">
        <p className="rp-menuwrap-moment-kicker">{moment.kicker}</p>
        <h3 className="rp-menuwrap-moment-title">{moment.title}</h3>
        {moment.lead ? (
          <p className="rp-menuwrap-moment-lead">
            <span className="rp-menuwrap-beat">What</span>
            {moment.lead}
          </p>
        ) : null}

        <dl className="rp-menuwrap-moment-metrics">
          {metrics.map((m) => (
            <div key={m.label} data-tone={m.tone}>
              <dd>{m.value}</dd>
              <dt>
                {m.label}
                {m.hint ? <i> · {m.hint}</i> : null}
              </dt>
            </div>
          ))}
        </dl>

        {why.length ? (
          <div className="rp-menuwrap-moment-whyblock">
            <span className="rp-menuwrap-beat">Why</span>
            <ul className="rp-menuwrap-moment-why">
              {why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {moment.soWhat ? (
          <p className="rp-menuwrap-moment-sowhat">
            <span className="rp-menuwrap-beat">So what</span>
            {moment.soWhat}
          </p>
        ) : null}

        {moment.radrSays ? (
          <p className="rp-menuwrap-moment-radr">
            <span>Now what · RADR</span>
            {moment.radrSays}
          </p>
        ) : null}

        {moment.impactValue ? (
          <p className="rp-menuwrap-moment-impact" data-tone={moment.impactTone}>
            <strong>{moment.impactValue}</strong>
            <span>{moment.impactLabel}</span>
          </p>
        ) : null}

        {featured && moment.evidenceNote ? (
          <p className="rp-menuwrap-moment-evidence">{moment.evidenceNote}</p>
        ) : null}
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        className="rp-menuwrap-moment"
        data-kind={moment.kind}
        data-featured={featured ? "true" : undefined}
        data-plate={moment.plate}
        data-active={active ? "true" : undefined}
        data-photo={moment.image ? "true" : undefined}
        aria-pressed={active}
        onClick={onOpen}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      className="rp-menuwrap-moment"
      data-kind={moment.kind}
      data-featured={featured ? "true" : undefined}
      data-plate={moment.plate}
      data-photo={moment.image ? "true" : undefined}
    >
      {body}
    </div>
  );
}

export function DishIntelligenceSheet({
  dish,
  onClose,
}: {
  dish: DishIntel;
  onClose: () => void;
}) {
  return (
    <aside
      className="rp-lookback-sheet rp-menuwrap-sheet"
      role="region"
      aria-label={`${dish.name} intelligence`}
    >
      <header className="rp-lookback-insight-head">
        <div>
          <p className="rp-lookback-kicker">
            {dish.category} · {dish.matrix.replace("_", " ")} · {dish.trend}
          </p>
          <h3>{dish.name}</h3>
          <p>{dish.recommendationWhy}</p>
        </div>
        <button
          type="button"
          className="rp-lookback-insight-close"
          onClick={onClose}
        >
          Close
        </button>
      </header>

      {dish.image ? (
        <div className="rp-menuwrap-sheet-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dish.image} alt={dish.name} />
        </div>
      ) : null}

      <ul className="rp-lookback-insight-kpis">
        <li>
          <strong>{formatEuro(dish.contribution)}</strong>
          <span>Contribution</span>
        </li>
        <li
          data-tone={
            dish.marginPct >= 40
              ? "good"
              : dish.marginPct < 25
                ? "bad"
                : undefined
          }
        >
          <strong>{dish.marginPct.toFixed(1).replace(".", ",")}%</strong>
          <span>Margin</span>
        </li>
        <li>
          <strong>{formatEuro(dish.revenue)}</strong>
          <span>Revenue</span>
        </li>
        <li>
          <strong>{new Intl.NumberFormat("de-DE").format(dish.units)}</strong>
          <span>Units</span>
        </li>
      </ul>

      <div className="rp-menuwrap-sheet-block">
        <p className="rp-lookback-sec-label">Operating</p>
        <ul className="rp-lookback-mix">
          <li>
            <span>Food cost</span>
            <strong>{dish.foodCostPct.toFixed(1).replace(".", ",")}%</strong>
          </li>
          <li>
            <span>Waste{dish.wasteEstimated ? " (est.)" : ""}</span>
            <strong>{dish.wastePct.toFixed(1).replace(".", ",")}%</strong>
          </li>
          <li>
            <span>Stockouts</span>
            <strong>{dish.stockouts}</strong>
          </li>
          <li>
            <span>Returning affinity</span>
            <strong>{dish.returningAffinityPct}%</strong>
          </li>
          <li>
            <span>Dine-in / delivery</span>
            <strong>
              {dish.channelMix.dineIn}% / {dish.channelMix.delivery}%
            </strong>
          </li>
          <li>
            <span>Vs prior year</span>
            <strong>
              {dish.vsPriorPct > 0 ? "+" : ""}
              {dish.vsPriorPct}%
            </strong>
          </li>
        </ul>
      </div>

      <div className="rp-menuwrap-sheet-block">
        <p className="rp-lookback-sec-label">RADR</p>
        <p className="rp-menuwrap-sheet-rec" data-rec={dish.recommendation}>
          {dish.recommendation.toUpperCase()}
        </p>
        {dish.strategicNote ? (
          <p className="rp-menuwrap-sheet-tradeoff">{dish.strategicNote}</p>
        ) : null}
      </div>

      {dish.ingredients.length ? (
        <div className="rp-menuwrap-sheet-block">
          <p className="rp-lookback-sec-label">Ingredients · cost trend</p>
          <ul className="rp-menuwrap-sheet-ings">
            {dish.ingredients.map((ing) => (
              <li key={ing.name}>
                <strong>{ing.name}</strong>
                <em data-tone={ing.costTrendPct >= 15 ? "bad" : "neutral"}>
                  {ing.costTrendPct > 0 ? "+" : ""}
                  {ing.costTrendPct.toFixed(1).replace(".", ",")}%
                </em>
                <span>{ing.sharePct}% of plate cost</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dish.pairings.length ? (
        <div className="rp-menuwrap-sheet-block">
          <p className="rp-lookback-sec-label">Pairings</p>
          <ul className="rp-menuwrap-sheet-ings">
            {dish.pairings.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong>
                <em>{p.times}×</em>
                <span>{p.attachmentPct}% attachment</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dish.scenarios?.length ? (
        <div className="rp-menuwrap-sheet-block">
          <p className="rp-lookback-sec-label">What if?</p>
          <ul className="rp-menuwrap-scenarios">
            {dish.scenarios.map((s) => (
              <li key={s.id}>
                <strong>{s.label}</strong>
                {s.contribution > 0 ? (
                  <em>→ {formatEuro(s.contribution)} / cover</em>
                ) : (
                  <em>Exit path</em>
                )}
                <span>{s.note}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dish.substitution ? (
        <div className="rp-menuwrap-sheet-block">
          <p className="rp-lookback-sec-label">If unavailable</p>
          <p className="rp-menuwrap-sheet-sub">
            Expected retained contribution{" "}
            <strong>{dish.substitution.retainedPct}%</strong>
            <span> · {dish.substitution.source}</span>
          </p>
          <ul className="rp-menuwrap-sheet-ings">
            {dish.substitution.flows.map((f) => (
              <li key={f.name}>
                <strong>{f.name}</strong>
                <em>{f.pct}%</em>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
