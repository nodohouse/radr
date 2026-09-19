"use client";

import Link from "next/link";
import { useState } from "react";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { berlinPostShiftBrief } from "@/lib/radr/product/shiftIntelligence";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export default function PostShiftPage() {
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const berlinOk = ctx.allowedLocationIds.includes(DEMO_LOCATIONS.berlin.id);
  const brief = berlinPostShiftBrief();
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  if (!berlinOk) {
    return (
      <div className="rp-shift">
        <header className="rp-ledger-head">
          <p className="rp-cc-kicker">Post-shift</p>
          <h1 className="rp-cc-title">What actually happened?</h1>
          <p className="rp-cc-since">
            Post-shift learning is scoped to Berlin Mitte in this demo.
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="rp-shift rp-shift-post">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Post-shift</p>
        <h1 className="rp-cc-title">What actually happened?</h1>
        <p className="rp-cc-since">
          {brief.locationName} · {brief.serviceLabel} · under 2 minutes ·{" "}
          {brief.demoLabel}
        </p>
      </header>

      <ol className="rp-value-flow" aria-label="Close the loop">
        <li>Expected</li>
        <li>Observed</li>
        <li>Difference</li>
        <li>Context</li>
        <li>Verified</li>
        <li>Learning</li>
      </ol>

      <section className="rp-shift-compare">
        <div>
          <span className="rp-cc-section-label">Expected</span>
          <strong>
            {formatDecisionMoney(brief.expectedIncrementalEuro)}
          </strong>
          <span>incremental contribution</span>
        </div>
        <div>
          <span className="rp-cc-section-label">Observed</span>
          <strong>
            {formatDecisionMoney(brief.observedIncrementalEuro)}
          </strong>
          <span>incremental contribution</span>
        </div>
        <div>
          <span className="rp-cc-section-label">Difference</span>
          <strong>
            {formatDecisionMoney(brief.varianceEuro)}
          </strong>
          <span>{brief.varianceNote}</span>
        </div>
      </section>

      <section className="rp-drec-sec">
        <h2>Operator context</h2>
        <p>{brief.operatorContext}</p>
        <p className="rp-drec-quiet">
          {brief.contextHelped
            ? "Context associated with improved guest outcome · DEMO"
            : "Context effect not yet attributed"}
        </p>
      </section>

      <section className="rp-drec-sec">
        <h2>Verified</h2>
        <p className="rp-drec-econ">
          <strong>{formatDecisionMoney(brief.verifiedEuro)}</strong>
          <span>
            verified incremental · {brief.attribution} · DEMO
          </span>
        </p>
      </section>

      <section className="rp-drec-sec">
        <h2>What RADR learned</h2>
        <p>{brief.learning}</p>
      </section>

      <section className="rp-drec-sec">
        <h2>{brief.optionalPrompt}</h2>
        <textarea
          className="rp-shift-textarea"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional — systems cannot know this"
        />
        <button
          type="button"
          className="rp-cc-cta"
          onClick={() => setDone(true)}
        >
          Finalize learning
        </button>
        {done ? (
          <p className="rp-drec-quiet">
            Written to Operating Memory · DEMO (no live backend write)
          </p>
        ) : null}
      </section>

      <div className="rp-ask-fixtures">
        {brief.relatedDecisionIds.map((id) => (
          <Link
            key={id}
            href={`/app/decisions/${id}#replay`}
            className="rp-drec-secondary"
          >
            Replay {displayDecisionId(id)}
          </Link>
        ))}
        <Link href="/app/memory" className="rp-drec-secondary">
          Memory
        </Link>
        <Link href="/app/value" className="rp-drec-secondary">
          Value
        </Link>
        <Link href="/app/calibration" className="rp-drec-secondary">
          Calibration
        </Link>
      </div>
    </div>
  );
}
