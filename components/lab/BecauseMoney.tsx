import { labEuro } from "@/lib/lab/format";
import type { MoneyGrade } from "@/lib/lab/types";

type Props = {
  euro: number;
  grade: MoneyGrade;
  because: string;
  lineage?: string;
  demo?: boolean;
  compact?: boolean;
  className?: string;
};

export function BecauseMoney({
  euro,
  grade,
  because,
  lineage,
  demo,
  compact,
  className = "",
}: Props) {
  const sealed = grade === "Verified";
  return (
    <div className={className}>
      <p className="lab-euro" data-grade={grade}>
        {labEuro(euro, compact)}
        <span className="lab-grade" data-grade={grade}>
          {grade}
        </span>
        {demo && !sealed ? (
          <span className="lab-grade">Demo</span>
        ) : null}
      </p>
      <p className="lab-because">{because}</p>
      {sealed && lineage ? (
        <p className="lab-because">Trace · {lineage}</p>
      ) : null}
    </div>
  );
}
