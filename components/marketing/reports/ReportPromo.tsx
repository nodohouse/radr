import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HOSPITALITY_REPORT as report } from "@/lib/marketing/report";
import "./reports.css";
export function ReportCover() {
  return (
    <div className="rr-cover rr-cover-real">
      <Image
        src="/marketing/reports/playbook-cover-preview.png"
        alt="Actual report cover: The Hospitality Decision Playbook, with a restaurant and hotel interior"
        width={778}
        height={1100}
        sizes="(max-width: 700px) 300px, 400px"
      />
    </div>
  );
}
export function ReportPromo() {
  return (
    <aside className="rr-promo">
      <div>
        <span className="rm-eyebrow">THE RADR OPERATOR SERIES</span>
        <h2>
          The margin you can still protect.
          <br />A clearer place to start.
        </h2>
        <p>
          Get the {report.pages}-page Hospitality Decision Playbook, including
          six research sources, visual operating examples, a business-case
          worksheet, and a 30-day pilot plan.
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
