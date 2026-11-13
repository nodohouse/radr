"use client";

import { useId, type CSSProperties } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { TERRITORY_DEFINITIONS } from "@/lib/radr/intelligence/architecture";
import { analyticsAllowed } from "@/lib/privacy/consent";
import {
  CATEGORY_LENS,
  LENS_COLORS,
  categoryDecision,
  lensBreakdown,
  resultStory,
} from "@/lib/marketing/value-calculator/resultStory";
import {
  formatMoneyIntl,
  type CategoryId,
  type CategoryResult,
  type JourneyState,
} from "@/lib/marketing/value-calculator";
import { categoryDisplayLabel } from "./valueMapSemantics";

function track(
  destination: "demo" | "playbook" | "packages",
  placement: "brief" | "detail" | "close",
) {
  if (!analyticsAllowed()) return;
  (window as Window & { dataLayer?: unknown[] }).dataLayer?.push({
    event: "calculator_next_step",
    destination,
    placement,
  });
}
export function ValueLensChart({
  categories,
  active,
  journey,
  divisor,
  onSelect,
}: {
  categories: CategoryResult[];
  active?: CategoryResult;
  journey: JourneyState;
  divisor: number;
  onSelect: (id: CategoryId) => void;
}) {
  const titleId = useId();
  const lenses = lensBreakdown(categories);
  const selected = lenses.find(
    (l) => l.id === (active ? CATEGORY_LENS[active.id] : "BUY"),
  )!;
  const total = lenses.reduce((sum, l) => sum + l.amount, 0);
  let offset = 0;
  return (
    <div className="vc4-lenses" data-testid="lens-chart">
      <div className="vc4-ring">
        <svg viewBox="0 0 200 200" role="img" aria-labelledby={titleId}>
          <title id={titleId}>
            {total > 0
              ? "Share of adjusted central exposure by economic lens. Use the labeled buttons to explore."
              : "No monetary breakdown until revenue is supplied."}
          </title>
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#e0eaf6"
            strokeWidth="18"
          />
          {lenses.map((l) => {
            const start = offset;
            offset += l.share * 100;
            return (
              <circle
                key={l.id}
                cx="100"
                cy="100"
                r="80"
                pathLength="100"
                fill="none"
                stroke={LENS_COLORS[l.id]}
                strokeWidth={selected.id === l.id ? 22 : 15}
                strokeDasharray={`${l.share * 100} ${100 - l.share * 100}`}
                strokeDashoffset={-start}
                transform="rotate(-90 100 100)"
                opacity={selected.id === l.id ? 1 : 0.5}
              />
            );
          })}
        </svg>
        <div className="vc4-ring-label">
          <span>{selected.id}</span>
          <strong>
            {total > 0
              ? `${Math.round(selected.share * 100)}%`
              : "Not quantified"}
          </strong>
          <small>of central exposure</small>
        </div>
      </div>
      <div
        className="vc4-lens-legend"
        role="group"
        aria-label="Explore economic lenses"
      >
        {lenses.map((l) => (
          <button
            key={l.id}
            disabled={!l.members.length}
            aria-pressed={selected.id === l.id}
            onClick={() => {
              if (l.members[0]) onSelect(l.members[0].id);
            }}
            style={{ "--lens-color": LENS_COLORS[l.id] } as CSSProperties}
          >
            <span className="vc4-lens-name">
              <i aria-hidden />
              {l.id}
              <small>
                {l.members.length
                  ? `${l.members.length} ${l.members.length === 1 ? "area" : "areas"}`
                  : "Outside your scope"}
              </small>
            </span>
            <b>
              {!l.members.length
                ? "Not selected"
                : total > 0
                  ? formatMoneyIntl(l.amount / divisor, journey.currency)
                  : "Not quantified"}
            </b>
          </button>
        ))}
      </div>
      <p className="vc4-lens-note">
        {TERRITORY_DEFINITIONS[selected.id].definition} Each category appears in
        one lens; amounts add to the adjusted central total.
      </p>
    </div>
  );
}
export function ValueDecisionBridge({
  journey,
  active,
  hasRevenue,
  divisor,
}: {
  journey: JourneyState;
  active?: CategoryResult;
  hasRevenue: boolean;
  divisor: number;
}) {
  const story = resultStory(journey);
  return (
    <section className="vc4-bridge" aria-labelledby="vc4-bridge-title">
      <div>
        <span className="vc3-eyebrow">Your next decision, in focus</span>
        <h2 id="vc4-bridge-title">{story.question}</h2>
        <p>{story.focus}</p>
      </div>
      <div className="vc4-bridge-focus">
        <span>
          {active
            ? categoryDisplayLabel(active, journey.vertical)
            : "Explore the operating picture"}
        </span>
        <strong>
          {hasRevenue && active
            ? formatMoneyIntl(active.modeled / divisor, journey.currency)
            : "Start with the evidence"}
        </strong>
        <small>
          {hasRevenue && active
            ? `central modeled exposure ${divisor === 12 ? "per month" : "per year"}`
            : "Supply revenue to quantify your scenario"}
        </small>
      </div>
      <div>
        <Link
          className="vc3-btn vc3-btn--blue"
          href={story.demoHref}
          onClick={() => track("demo", "brief")}
        >
          {story.demoLabel}
          <Arrow />
        </Link>
        <small className="vc4-register-note">
          Register to explore fictional data.
        </small>
      </div>
    </section>
  );
}
export function ValueDecisionExample({
  journey,
  category,
}: {
  journey: JourneyState;
  category: CategoryResult;
}) {
  const d = categoryDecision(category.id, journey);
  const story = resultStory(journey);
  return (
    <div className="vc4-decision-example">
      <span className="vc3-eyebrow">The decision behind the number</span>
      <h3>{d.question}</h3>
      <ol>
        <li>
          <span>01</span>
          <div>
            <b>Compare the response</b>
            <p>{d.response}</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <b>Define what would prove it</b>
            <p>{d.verify}</p>
          </div>
        </li>
      </ol>
      <Link href={story.demoHref} onClick={() => track("demo", "detail")}>
        See how a decision works in the demo <Arrow />
      </Link>
      <small>
        A fictional product walkthrough. Your calculator inputs stay here.
      </small>
    </div>
  );
}
export function ValueNextSteps({ journey }: { journey: JourneyState }) {
  const story = resultStory(journey);
  return (
    <section className="vc4-next" aria-labelledby="vc4-next-title">
      <div className="vc4-next-heading">
        <span className="vc3-eyebrow">Keep the momentum</span>
        <h2 id="vc4-next-title">
          The number starts the conversation.
          <br />
          <em>The next decision makes it useful.</em>
        </h2>
        <p>
          Explore the product, build your case or compare the scope. Choose what
          helps you move forward.
        </p>
      </div>
      <div className="vc4-paths">
        <article className="vc4-path vc4-path--demo">
          <span className="vc3-eyebrow">See it in context</span>
          <h3>
            From evidence
            <br />
            to a clear next move.
          </h3>
          <p>{story.demoDetail}</p>
          <div className="vc4-demo-trace" aria-hidden>
            <span>Evidence</span>
            <i />
            <span>Decision</span>
            <i />
            <span>Verify</span>
          </div>
          <Link
            className="vc3-btn vc3-btn--jade"
            href={story.demoHref}
            onClick={() => track("demo", "close")}
          >
            {story.demoLabel}
            <Arrow />
          </Link>
          <small>Registration required. Explore at your pace.</small>
        </article>
        <article className="vc4-path vc4-path--book">
          <div className="vc4-book-preview">
            <Image
              src="/marketing/reports/playbook-cover-preview.png"
              alt="The RADR Hospitality Decision Playbook cover"
              width={640}
              height={900}
            />
          </div>
          <span className="vc3-eyebrow">Build a stronger case</span>
          <h3>
            Take the thinking
            <br />
            into your operation.
          </h3>
          <p>
            Research-backed context, an evidence scorecard and a decision
            worksheet to structure your next review.
          </p>
          <Link
            className="vc3-btn vc3-btn--light"
            href="/resources/hospitality-decision-playbook#request-report"
            onClick={() => track("playbook", "close")}
          >
            Get the playbook
            <Arrow />
          </Link>
          <small>Includes sources and reusable review tools.</small>
        </article>
        <article className="vc4-path">
          <span className="vc3-eyebrow">Explore the fit</span>
          <h3>
            The right scope.
            <br />
            Room to grow.
          </h3>
          <p>
            Compare Core, Expand and Enterprise by location coverage and
            included capabilities.
          </p>
          <ul className="vc4-plan-list">
            <li>
              <b>Core</b>
              <span>1 location</span>
            </li>
            <li>
              <b>Expand</b>
              <span>2–5 locations</span>
            </li>
            <li>
              <b>Enterprise</b>
              <span>6+ · Contact sales</span>
            </li>
          </ul>
          <Link
            className="vc3-btn vc3-btn--light"
            href="/pricing"
            onClick={() => track("packages", "close")}
          >
            Compare packages
            <Arrow />
          </Link>
          <small>
            Published prices, 12-month commitment. Payments are not active yet.
          </small>
        </article>
      </div>
    </section>
  );
}
function Arrow() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
