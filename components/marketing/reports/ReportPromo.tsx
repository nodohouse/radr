import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { Link } from "@/i18n/navigation";
import { HOSPITALITY_REPORT as report } from "@/lib/marketing/report";
import "./reports.css";
export function ReportCover() {
  return (
    <div
      className="rr-cover"
      aria-label="The Hospitality Decision Playbook, November 2026"
    >
      <div className="rr-cover-brand">
        <FrozenRadrLogo variant="mark" theme="dark" width={28} />
        <span>OPERATOR SERIES</span>
      </div>
      <div>
        <small>THE HOSPITALITY</small>
        <strong>
          Decision
          <br />
          Playbook.
        </strong>
        <i>Evidence. Judgment. Action.</i>
      </div>
      <div className="rr-cover-loop" aria-hidden="true">
        <b>CONNECT</b>
        <b>UNDERSTAND</b>
        <b>FUTURES</b>
        <b>DECIDE</b>
        <b>VERIFY</b>
        <b>REMEMBER</b>
      </div>
      <footer>
        <span>{report.edition}</span>
        <span>FIELD GUIDE / 01</span>
      </footer>
    </div>
  );
}
export function ReportPromo() {
  return (
    <aside className="rr-promo">
      <div>
        <span className="rm-eyebrow">THE RADR OPERATOR SERIES</span>
        <h2>
          Better decisions.
          <br />A practical place to start.
        </h2>
        <p>
          Get the {report.pages}-page Hospitality Decision Playbook, including
          an evidence scorecard and a 30-day pilot plan.
        </p>
        <Link href={report.path} className="rm-button">
          Request the report →
        </Link>
        <small>English PDF · Report request includes a sales follow-up.</small>
      </div>
      <ReportCover />
    </aside>
  );
}
