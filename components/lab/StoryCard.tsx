import Link from "next/link";
import type { MoneyGrade } from "@/lib/lab/types";
import { BecauseMoney } from "./BecauseMoney";

type Props = {
  href: string;
  kicker: string;
  title: string;
  because: string;
  cta?: string;
  euro?: number;
  grade?: MoneyGrade;
  lineage?: string;
  demo?: boolean;
  clock?: string;
  wash?: "sand" | "mint";
};

export function StoryCard({
  href,
  kicker,
  title,
  because,
  cta = "Open",
  euro,
  grade,
  lineage,
  demo,
  clock,
  wash = "sand",
}: Props) {
  return (
    <Link href={href} className="lab-card" data-wash={wash}>
      <p className="lab-kicker">{kicker}</p>
      <h2 className="lab-h" style={{ fontSize: "1.45rem", marginTop: "0.25rem" }}>
        {title}
      </h2>
      {euro != null && grade ? (
        <BecauseMoney euro={euro} grade={grade} because={because} lineage={lineage} demo={demo} />
      ) : (
        <p className="lab-because">{because}</p>
      )}
      {clock ? <p className="lab-clock">{clock}</p> : null}
      <p className="lab-lead" style={{ marginTop: "0.7rem", fontWeight: 700 }}>
        {cta} →
      </p>
    </Link>
  );
}
