"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { checkById } from "@/lib/product/demo/checks";
import { formatCompactEuro } from "@/lib/product/demo/command";
import { TextSep } from "@/components/TextSep";

/** Check detail: expected logic, sources, value, optional worked example. */
export default function CheckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const check = checkById(id);
  if (!check) notFound();

  const ex = check.example;

  return (
    <div className="rp-check-detail">
      <p className="rp-crumb">
        <Link href="/app/checks">RADR Checks</Link>
        <span>/</span>
        {check.name}
      </p>

      <header className="rp-terr-hero">
        <p className="rp-check-area">{check.area.toUpperCase()}</p>
        <h1 className="rp-title">{check.name}</h1>
        <p className="rp-sub">{check.rule}</p>
        <p className="rp-check-status">
          {check.status.replace("_", " ")}
          <TextSep />
          Checked {check.lastChecked}
        </p>
      </header>

      <ul className="rp-terr-kpis">
        <li>
          <em>30D identified</em>
          <TextSep srOnly>: </TextSep>
          <strong>{formatCompactEuro(check.identified30d)}</strong>
        </li>
        <li>
          <em>30D verified</em>
          <TextSep srOnly>: </TextSep>
          <strong className="rp-cc-pos">{formatCompactEuro(check.verified30d)}</strong>
        </li>
        <li>
          <em>Firings</em>
          <TextSep srOnly>: </TextSep>
          <strong>{check.firings30d}</strong>
        </li>
      </ul>

      {ex ? (
        <section className="rp-check-example">
          <h2>{ex.title}</h2>
          <p className="rp-muted">{ex.period}</p>
          <ul className="rp-check-lines">
            {ex.lines.map((row) => (
              <li key={row.label} data-tone={row.tone ?? "default"}>
                <span>{row.label}</span>
                <TextSep>: </TextSep>
                <strong>{row.value}</strong>
              </li>
            ))}
          </ul>

          <div className="rp-check-delta">
            <div>
              <em>Expected</em>
              <TextSep srOnly>: </TextSep>
              <strong>{ex.expected}</strong>
            </div>
            <div>
              <em>Actual</em>
              <TextSep srOnly>: </TextSep>
              <strong>{ex.actual}</strong>
            </div>
            <div data-delta>
              <em>Δ</em>
              <TextSep srOnly>: </TextSep>
              <strong>{ex.delta}</strong>
            </div>
          </div>

          <h3>Why RADR expected {ex.expected}</h3>
          <ul className="rp-check-why">
            {ex.whyExpected.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          {ex.explained ? (
            <>
              <h3>Explained</h3>
              <ul className="rp-check-lines">
                {ex.explained.map((row) => (
                  <li key={row.label}>
                    <span>{row.label}</span>
                    <TextSep>: </TextSep>
                    <strong>{row.value}</strong>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {ex.actionable ? (
            <p className="rp-check-actionable">
              <em>Actionable</em>
              <TextSep>: </TextSep>
              {ex.actionable}
            </p>
          ) : null}

          {ex.signalId ? (
            <Link
              href={`/app/findings/${ex.signalId}`}
              className="rp-btn rp-btn-primary"
            >
              Open signal →
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="rp-section">
        <h2>Data sources</h2>
        <ul className="rp-check-sources">
          {check.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="rp-section">
        <h2>Expected logic</h2>
        <p>{check.expectedLogic}</p>
        <p className="rp-muted">
          Tolerance
          <TextSep />
          {check.tolerance}
        </p>
      </section>

      <section className="rp-section">
        <h2>Owner</h2>
        <p>{check.owner}</p>
      </section>

      <p className="rp-muted" style={{ marginTop: "1.5rem" }}>
        Check = what RADR watches. Finding = a financially relevant issue. Action = work to do.
        Verified value = proof the money moved.
      </p>
    </div>
  );
}
