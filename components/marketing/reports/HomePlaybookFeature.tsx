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
          Your next operating review.
          <br />
          <em>With a better playbook.</em>
        </h2>
        <p className="rm-playbook-lead">
          Know where to look. Decide what to change. Prove what happened after.
          A practical field guide for the people accountable for the night and
          the numbers.
        </p>
        <ul className="rm-playbook-tools">
          <li>
            <span>p.12</span>
            <div>
              <strong>An evidence scorecard</strong>
              <p>
                Check sources, freshness, uncertainty and authority before
                backing a Decision.
              </p>
            </div>
          </li>
          <li>
            <span>p.14</span>
            <div>
              <strong>A worksheet you can use tomorrow</strong>
              <p>
                Put the owner, alternatives, expected value and outcome on one
                Decision record.
              </p>
            </div>
          </li>
          <li>
            <span>p.13</span>
            <div>
              <strong>Your first 30 days, mapped out</strong>
              <p>
                Frame one problem. Review the evidence. Act through your
                process. Verify before expanding.
              </p>
            </div>
          </li>
        </ul>
        <div className="rm-playbook-ctas">
          <Link href={report.path} className="rm-button">
            Get the playbook <span aria-hidden="true">→</span>
          </Link>
          <span>
            {report.pages} pages · English PDF
            <br />6 linked research sources
          </span>
        </div>
        <p className="rm-playbook-note">
          Request access with your business details. Sales follow-up and email
          updates are optional. Examples and modeled figures are clearly
          labeled.
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
