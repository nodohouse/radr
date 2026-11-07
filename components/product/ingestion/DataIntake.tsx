"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DATASETS,
  MAX_BYTES,
  intakeTemplate,
  parseIntake,
  suggestMapping,
  validateIntake,
  type Dataset,
  type ParsedIntake,
} from "@/lib/ingestion/intake";
import "./data-intake.css";

export function DataIntake() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [kind, setKind] = useState<Dataset>("sales");
  const [parsed, setParsed] = useState<ParsedIntake | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef(0);
  const validation = useMemo(
    () => (parsed ? validateIntake(parsed, kind, mapping) : null),
    [parsed, kind, mapping],
  );
  async function read(file?: File) {
    if (!file) return;
    const id = ++request.current;
    setBusy(true);
    setError("");
    setParsed(null);
    setFileName(file.name);
    try {
      if (file.size > MAX_BYTES)
        throw new Error("Choose a file up to 2 MB for this preview.");
      const text = new TextDecoder("utf-8", { fatal: true }).decode(
        await file.arrayBuffer(),
      );
      const result = parseIntake(text, file.name);
      if (id !== request.current) return;
      const nextKind = result.suggested || kind;
      setKind(nextKind);
      setMapping(suggestMapping(result.headers, nextKind));
      setParsed(result);
    } catch (e) {
      if (id === request.current)
        setError(
          e instanceof TypeError
            ? "This file is not UTF-8 text. Export it as UTF-8 CSV or JSON first."
            : e instanceof Error
              ? e.message
              : "File could not be read.",
        );
    } finally {
      if (id === request.current) setBusy(false);
    }
  }
  function sample() {
    const result = parseIntake(intakeTemplate(kind), "example.csv");
    request.current++;
    setBusy(false);
    setError("");
    setFileName(`${kind}-example.csv`);
    setParsed(result);
    setMapping(suggestMapping(result.headers, kind));
  }
  function downloadTemplate() {
    const url = URL.createObjectURL(
      new Blob([intakeTemplate(kind)], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `radr-${kind}-template.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="rs-page intake-page">
      <Link className="intake-back" href="/app/connections">
        ← Connections
      </Link>
      <header className="intake-hero">
        <div>
          <p className="intake-kicker">DATA INTAKE</p>
          <h1>
            Turn unfamiliar exports
            <br />
            into evidence you can trust.
          </h1>
          <p>
            Check the structure. Confirm the meaning. Find the gaps before they
            reach a decision.
          </p>
        </div>
        <aside>
          <strong>Private preview</strong>
          <span>
            File contents stay in this browser tab. Nothing is uploaded or added
            to your workspace.
          </span>
        </aside>
      </header>
      <ol className="intake-steps" aria-label="Import steps">
        <li data-active={!parsed}>
          01 <span>Choose data</span>
        </li>
        <li data-active={Boolean(parsed)}>
          02 <span>Confirm columns</span>
        </li>
        <li data-active={Boolean(validation?.ready)}>
          03 <span>Review quality</span>
        </li>
      </ol>
      <section className="intake-upload-grid" aria-labelledby="intake-source">
        <div className="intake-panel">
          <h2 id="intake-source">1. What are you bringing in?</h2>
          <p>
            Choose an operating area. A suggested match is a starting point; you
            confirm what each column means.
          </p>
          <label className="intake-label">
            Dataset
            <select
              aria-label="Dataset"
              disabled={!ready || busy}
              value={kind}
              onChange={(e) => {
                const k = e.target.value as Dataset;
                setKind(k);
                if (parsed) setMapping(suggestMapping(parsed.headers, k));
              }}
            >
              {(Object.keys(DATASETS) as Dataset[]).map((k) => (
                <option key={k} value={k}>
                  {DATASETS[k].label}
                </option>
              ))}
            </select>
          </label>
          <div className="intake-actions">
            <button type="button" disabled={!ready || busy} onClick={sample}>
              Try example data
            </button>
            <button
              type="button"
              disabled={!ready || busy}
              onClick={downloadTemplate}
            >
              Download template
            </button>
          </div>
        </div>
        <div className="intake-panel intake-file-panel">
          <label
            className="intake-drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void read(e.dataTransfer.files[0]);
            }}
          >
            <span className="intake-upload-icon" aria-hidden="true">
              ↑
            </span>
            <strong>
              {busy
                ? "Checking your file…"
                : "Drop an export, or choose a file"}
            </strong>
            <span>CSV · TSV · JSON · JSON Lines</span>
            <small>Up to 2 MB · 10,000 rows · UTF-8</small>
            <input
              type="file"
              aria-label="Choose data file"
              disabled={!ready}
              accept=".csv,.tsv,.json,.jsonl,.ndjson"
              onChange={(e) => {
                void read(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {fileName && <p className="intake-file-name">{fileName}</p>}
          <p className="intake-support">
            Excel, scanned PDFs, photos, audio and video need a dedicated
            extraction step. This preview validates structured exports; it does
            not claim to extract unsupported formats.
          </p>
        </div>
      </section>
      {error && (
        <div className="intake-error" role="alert">
          <strong>Let’s fix the source file.</strong>
          <p>{error}</p>
        </div>
      )}
      {parsed && validation && (
        <>
          <section className="intake-panel" aria-labelledby="intake-mapping">
            <div className="intake-section-top">
              <div>
                <p className="intake-kicker">CONFIRM THE MEANING</p>
                <h2 id="intake-mapping">2. Match your columns</h2>
              </div>
              <span className="intake-tag">
                {parsed.rows.length.toLocaleString()}{" "}
                {parsed.rows.length === 1 ? "row" : "rows"} ·{" "}
                {parsed.headers.length} source columns
              </span>
            </div>
            <p>
              Suggested mappings are editable. Unmapped source columns remain
              visible in your file but are not used in this normalized preview.
            </p>
            <div className="intake-mapping">
              {DATASETS[kind].fields.map((field) => (
                <label key={field.key} className="intake-label">
                  {field.label}
                  {field.required ? " *" : ""}
                  <select
                    aria-label={field.label}
                    aria-required={field.required}
                    value={mapping[field.key] || ""}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, [field.key]: e.target.value }))
                    }
                  >
                    <option value="">Choose a source column</option>
                    {parsed.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </section>
          <section className="intake-panel" aria-labelledby="intake-quality">
            <div className="intake-section-top">
              <div>
                <p className="intake-kicker">QUALITY BEFORE DECISIONS</p>
                <h2 id="intake-quality">3. Review the result</h2>
              </div>
              <span className="intake-tag" data-ready={validation.ready}>
                {validation.ready ? "Structure checks passed" : "Review needed"}
              </span>
            </div>
            <div className="intake-metrics">
              <div>
                <strong>{parsed.rows.length}</strong>
                <span>Rows checked</span>
              </div>
              <div>
                <strong>{validation.invalidRows}</strong>
                <span>Rows to review</span>
              </div>
              <div>
                <strong>{validation.missing.length}</strong>
                <span>Required mappings missing</span>
              </div>
            </div>
            {validation.missing.length > 0 && (
              <p className="intake-warning" role="status">
                Map these required fields: {validation.missing.join(", ")}.
              </p>
            )}
            {validation.duplicateMappings && (
              <p className="intake-warning" role="status">
                A source column is mapped more than once. Assign a separate
                source column to each field.
              </p>
            )}
            {validation.issues.length > 0 && (
              <div
                className="intake-issues"
                role="region"
                aria-label="Rows to correct"
              >
                <h3>What to correct</h3>
                <p>
                  Showing up to 100 issues. Correct the source or mapping, then
                  check again.
                </p>
                <ul>
                  {validation.issues.map((issue, i) => (
                    <li key={i}>
                      <strong>
                        Row {issue.row} · {issue.field}
                      </strong>
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div
              className="intake-table-wrap"
              role="region"
              aria-label="Normalized data preview"
              tabIndex={0}
            >
              <table>
                <caption>
                  First {Math.min(8, validation.rows.length)} normalized rows.
                  Values are displayed as text and never executed.
                </caption>
                <thead>
                  <tr>
                    {DATASETS[kind].fields.map((f) => (
                      <th key={f.key} scope="col">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {validation.rows.slice(0, 8).map((row, i) => (
                    <tr key={i}>
                      {DATASETS[kind].fields.map((f) => (
                        <td key={f.key}>
                          {String(row[f.key] ?? "") || "Missing"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="intake-next">
              <strong>
                {validation.ready
                  ? "Ready for a human review."
                  : "Resolve the highlighted issues before continuing."}
              </strong>
              <p>
                Passing these checks confirms structure and basic field
                validity. It does not prove completeness, reconcile
                transactions, verify savings or write to a connected system.
                Importing into a customer workspace requires authenticated
                storage and a reviewed import job.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
