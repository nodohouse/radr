"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { formatEuro } from "@/lib/product/demo/catalog";
import { useProduct } from "@/lib/product/store";
import { TextSep } from "@/components/TextSep";

export default function ControlDetailPage() {
  const params = useParams<{ id: string }>();
  const { controls } = useProduct();
  const control = useMemo(
    () => controls.find((c) => c.id === params.id),
    [controls, params.id],
  );

  if (!control) {
    return (
      <div className="rp-empty">
        <h3>Control not found</h3>
        <p>
          <Link href="/app/controls">Back to controls</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="rp-kicker">
        Control
        <TextSep />
        {control.status}
      </p>
      <h1 className="rp-title">{control.name}</h1>
      <p className="rp-sub">{control.description}</p>

      <div className="rp-stat-grid">
        <div className="rp-stat">
          <em>Source</em>
          <TextSep srOnly>: </TextSep>
          <strong>
            <Link href={`/app/findings/${control.sourceSignalId}`}>
              {control.sourceSignalId}
            </Link>
          </strong>
        </div>
        <div className="rp-stat">
          <em>Scope</em>
          <TextSep srOnly>: </TextSep>
          <strong style={{ fontSize: "1rem" }}>{control.scope}</strong>
        </div>
        <div className="rp-stat">
          <em>Prevented</em>
          <TextSep srOnly>: </TextSep>
          <strong className="rp-money">{control.preventedCount}</strong>
        </div>
        <div className="rp-stat" data-on="true">
          <em>Value protected</em>
          <TextSep srOnly>: </TextSep>
          <strong className="rp-money">
            {formatEuro(control.protectedValue)}
          </strong>
        </div>
      </div>

      <div className="rp-panel">
        <h3>Rule</h3>
        <p className="rp-money" style={{ fontSize: "1.1rem" }}>
          {control.condition}
        </p>
        <p className="rp-signal-card-meta">
          Action
          <TextSep />
          {control.action}
          <TextSep />
          Owner
          <TextSep />
          {control.owner}
        </p>
      </div>

      <section className="rp-section" style={{ marginTop: "1.5rem" }}>
        <h2 className="rp-section-head" style={{ display: "block" }}>
          Run history
        </h2>
        <ol className="rp-timeline">
          {control.runHistory.map((r, i) => (
            <li key={`${r}-${i}`} data-on={r === "Flagged" ? "true" : "false"}>
              {r}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
