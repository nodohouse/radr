import { Link } from "@/i18n/navigation";
import { HOSPITALITY_REPORT as report } from "@/lib/marketing/report";
import { PlaybookBook } from "./PlaybookBook";
import "./playbook-book.css";

export function HomePlaybookFeature() {
  return (
    <section
      className="rm-playbook rm-shell"
      data-nav-theme="light"
      aria-labelledby="home-playbook-title"
      id="hospitality-playbook"
    >
      <div className="rm-playbook-copy">
        <p className="rm-eyebrow">THE HOSPITALITY DECISION PLAYBOOK</p>
        <h2 id="home-playbook-title">
          Busy doesn’t mean profitable.
          <br />
          <em>Know where to look next.</em>
        </h2>
        <p className="rm-playbook-lead">
          When costs outrun revenue, a busy operation can still lose ground. Get
          the research, the operating examples and a practical place to start.
        </p>
        <ul className="rm-playbook-tools rm-playbook-research">
          <li>
            <span>2.8%</span>
            <div>
              <strong>How thin can the margin get?</strong>
              <p>
                Median pre-tax income relative to sales for U.S. full-service
                restaurants, using 2024 survey data.
              </p>
              <a href="https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/new-association-report-helps-operators-gauge-their-restaurant-performance/">
                National Restaurant Association, 2025 →
              </a>
            </div>
          </li>
          <li>
            <span>4.1%</span>
            <div>
              <strong>Hotel costs grew faster than revenue.</strong>
              <p>
                Expenses above gross operating profit rose 4.1%, against 2.3%
                total revenue growth. U.S. hotel sample, 2024 vs 2023.
              </p>
              <a href="https://www.cbre.com/insights/articles/all-eyes-on-operating-costs-in-2025-lessons-learned-in-2024">
                CBRE, 2025 · 2,600 hotels →
              </a>
            </div>
          </li>
        </ul>
        <div className="rm-playbook-ctas">
          <Link href={report.path} className="rm-button">
            Explore the playbook <span aria-hidden="true">→</span>
          </Link>
          <span>
            English PDF
            <br />
            Research. Decisions. A plan to act.
          </span>
        </div>
        <p className="rm-playbook-note">
          Explore the research and sample pages. Download availability is shown
          on the playbook page. Research findings are not estimates of RADR
          returns.
        </p>
      </div>
      <div className="rm-playbook-visual">
        <PlaybookBook />
        <p className="rm-playbook-preview-note">
          A preview of the publication, not the full download.
        </p>
      </div>
    </section>
  );
}
