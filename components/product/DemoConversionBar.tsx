"use client";
import Link from "next/link";
import { useDemoOrg } from "./useDemoOrg";
import { getRadrEnvironment } from "@/lib/radr/env";
import "@/app/demo-conversion.css";

export function DemoConversionBar() {
  const { isHotel } = useDemoOrg();
  if (getRadrEnvironment() !== "DEMO") return null;
  const world = isHotel ? "hotel" : "restaurant";
  return (
    <aside className="rp-demo-conversion" aria-label="Demo preview and plans">
      <div>
        <span className="rp-demo-preview-label">DEMO PREVIEW</span>
        <p>See RADR working. Then make it yours.</p>
        <small>
          Registration is a preview. No account or subscription has been
          created.
        </small>
      </div>
      <Link href={`/pricing?from=demo&vertical=${world}#plans`}>
        View plans
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 10h12m-5-5 5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </aside>
  );
}
