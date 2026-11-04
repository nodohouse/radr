"use client";
import { validName, validEmail } from "@/lib/onboarding/requiredFields";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { HOSPITALITY_REPORT as report } from "@/lib/marketing/report";
export function ReportLeadForm({ available }: { available: boolean }) {
  const form = useRef<HTMLFormElement>(null);
  const requestId = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  function update() {
    requestId.current = null;
    const current = form.current;
    if (!current) return;
    const d = new FormData(current);
    setReady(
      current.checkValidity() &&
        validName(String(d.get("fullName") || "")) &&
        String(d.get("company") || "").trim().length >= 2 &&
        validEmail(String(d.get("email") || "")),
    );
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !available || !event.currentTarget.reportValidity()) return;
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/reports/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          fullName: data.get("fullName"),
          email: data.get("email"),
          company: data.get("company"),
          role: data.get("role"),
          locations: data.get("locations"),
          requestContact: false,
          marketingOptIn: data.get("marketingOptIn") === "on",
          website: data.get("website") || "",
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error || "We could not submit your request. Please try again.",
        );
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Please try your request again.",
      );
    } finally {
      setPending(false);
    }
  }
  async function download() {
    setDownloading(true);
    setError("");
    try {
      const response = await fetch("/api/reports/download");
      if (!response.ok)
        throw new Error(
          response.status === 403
            ? "Your download window has expired. Submit the form again to unlock a new download."
            : "The download could not start. Please try again.",
        );
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = report.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setDownloading(false);
    }
  }
  if (done)
    return (
      <div className="rr-form rr-success" role="status">
        <span className="rm-eyebrow">YOUR PLAYBOOK IS READY</span>
        <h2>Your playbook is ready.</h2>
        <p>Download your English PDF below.</p>
        <button
          className="rm-button"
          type="button"
          onClick={download}
          disabled={downloading}
        >
          {downloading ? "Preparing download…" : "Download the playbook →"}
        </button>
        <p className="rr-small">
          Your download is available in this browser for 30 minutes. You can
          save the PDF for later.
        </p>
        {error ? (
          <p role="alert" className="rr-error">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          className="rr-text-button"
          onClick={() => {
            requestId.current = null;
            setDone(false);
            setReady(false);
            setError("");
          }}
        >
          Submit a new request
        </button>
      </div>
    );
  return (
    <form
      ref={form}
      className="rr-form"
      onSubmit={submit}
      onChange={update}
      onInput={update}
    >
      <span className="rm-eyebrow">THE RADR OPERATOR SERIES</span>
      <h2>Get the playbook.</h2>
      <p>Fill in your details to unlock the complete 16-page guide.</p>
      <label>
        Full name
        <input
          name="fullName"
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
        />
      </label>
      <label>
        Work email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </label>
      <label>
        Company
        <input
          name="company"
          autoComplete="organization"
          required
          minLength={2}
          maxLength={200}
        />
      </label>
      <div className="rr-form-row">
        <label>
          Your role
          <select aria-label="Your role" name="role" defaultValue="" required>
            <option value="" disabled>
              Select your role
            </option>
            <option value="owner">Owner / Founder</option>
            <option value="finance">CFO / Finance</option>
            <option value="operations">Operations</option>
            <option value="general-manager">General Manager</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Locations
          <select
            aria-label="Locations"
            name="locations"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select locations
            </option>
            {["1", "2-5", "6-20", "21-50", "50+"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="rr-check">
        <input name="marketingOptIn" type="checkbox" />
        <span>
          Also send me occasional RADR articles and updates. Optional; I can
          unsubscribe.
        </span>
      </label>
      <div className="rr-honey" aria-hidden="true" inert>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {!available ? (
        <p className="rr-availability" role="status">
          Playbook downloads open soon. Please check back shortly.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rr-error">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="rm-button"
        disabled={!ready || pending || !available}
      >
        {pending ? "Sending your request…" : "Get the playbook →"}
      </button>
      <p className="rr-small">
        By requesting the playbook, you acknowledge our{" "}
        <Link href="/privacy">privacy notice</Link>. Updates and optional
        cookies are not required. No sales call is required.
      </p>
    </form>
  );
}
