import { Link } from "@/i18n/navigation";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { PUBLIC_RESTAURANT as venue } from "@/lib/marketing/publicCanon";

/** Public illustration of the same Decision record used in the product demo. */
export function ProductBriefPreview() {
  return (
    <div
      className="rm-brief"
      aria-label="RADR Control Center illustrative demo"
    >
      <div className="rm-brief-chrome">
        <FrozenRadrLogo variant="mark" width={28} />
        <span>CONTROL CENTER</span>
        <span className="rm-live-dot">Demo · {venue.clock}</span>
      </div>
      <div className="rm-brief-heading">
        <div>
          <small>YOUR OPERATION, IN FOCUS</small>
          <h3>Good evening, Alex.</h3>
          <p>{venue.displayName} · Dinner service</p>
        </div>
        <span className="rm-avatar">A</span>
      </div>
      <div className="rm-brief-metrics">
        <div>
          <span>Needs you</span>
          <strong>01</strong>
          <small>One decision to review</small>
        </div>
        <div>
          <span>Confidence</span>
          <strong>
            {venue.confidencePct}
            <em>%</em>
          </strong>
          <small>Evidence behind this decision</small>
        </div>
        <div>
          <span>Expected protected</span>
          <strong>{venue.expectedFormatted}</strong>
          <small>Tonight · model estimate</small>
        </div>
      </div>
      <div className="rm-brief-decision">
        <div className="rm-brief-status">
          <span>● NEEDS YOU</span>
          <span>{venue.decisionId}</span>
        </div>
        <h4>Pace the next seating wave.</h4>
        <p>
          Demand is ahead of plan. Give the kitchen 12 minutes before the next
          seating wave.
        </p>
        <div className="rm-brief-signal">
          <span>Demand ahead</span>
          <svg
            viewBox="0 0 240 46"
            role="img"
            aria-label="Illustrative service pressure rising above planned capacity"
          >
            <path
              d="M0 33H240"
              stroke="currentColor"
              strokeDasharray="4 5"
              opacity=".35"
            />
            <path
              d="M0 39L24 35L48 37L72 22L96 26L120 19L144 25L168 8L192 13L216 4L240 10"
              fill="none"
              stroke="#00e895"
              strokeWidth="3"
            />
          </svg>
          <span>Kitchen under pressure</span>
        </div>
        <div className="rm-brief-action">
          <Link href="/product/decisions">
            Review the decision <b>→</b>
          </Link>
          <small>Approval stays with you</small>
        </div>
      </div>
      <div className="rm-brief-evidence">
        <span>POS signals</span>
        <span>Reservations</span>
        <span>Kitchen capacity</span>
        <strong>One connected decision →</strong>
      </div>
    </div>
  );
}
