"use client";

/**
 * RADR Floor — three chapters only: NOW · WHY · LEARN.
 * Live hospitality context — not a POS, not a finance recovery phone.
 */

import { useState } from "react";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "../PublicShell";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/kinetic.css";
import "@/app/product-chapters.css";
import "@/app/home.css";

type Chapter = "now" | "why" | "learn";

export function FloorPage() {
  return (
    <div className="radr radr-mineral rx-ch rx-ch-light">
      <PublicNavbar />
      <main>
        <section
          className="rx-rec-sec"
          data-nav-theme="light"
          style={{ paddingTop: "5rem" }}
        >
          <div className="rx-shell">
            <FloorChapters />
            <div className="rx-he-ctas" style={{ marginTop: "2.5rem" }}>
              <NextLink href="/product" className="rx-btn rx-btn-ghost">
                Platform <span aria-hidden="true">→</span>
              </NextLink>
              <Link
                href="/contact?intent=recovery-pilot"
                className="rx-btn rx-btn-primary"
              >
                {CTAS.primaryProduct} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function FloorChapters() {
  const [chapter, setChapter] = useState<Chapter>("now");

  return (
    <div className="rx-floor-live">
      <p className="rx-rec-k">RADR Floor</p>
      <h2 className="rx-rec-h">What this person needs right now.</h2>

      <div className="rx-floor-live-toggle" role="tablist" aria-label="Floor chapters">
        {(
          [
            ["now", "Now"],
            ["why", "Why"],
            ["learn", "Learn"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            data-on={chapter === id ? "true" : undefined}
            onClick={() => setChapter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {chapter === "now" ? <FloorNow /> : null}
      {chapter === "why" ? <FloorWhy /> : null}
      {chapter === "learn" ? <FloorLearn /> : null}

      <p className="rx-pilot-note">
        POS remains system of execution. RADR Floor: context · guidance · brief ·
        exception · learning.
      </p>
    </div>
  );
}

function FloorNow() {
  return (
    <div className="rx-floor-companion" aria-label="Now">
      <header className="rx-floor-companion-head">
        <div>
          <em>NOW</em>
          <strong>19:04</strong>
        </div>
        <div>
          <em>Table 12</em>
          <strong>VIP · returning guest</strong>
        </div>
        <div data-hot="true">
          <em>Cold station</em>
          <strong>92%</strong>
        </div>
      </header>

      <div className="rx-floor-companion-table">
        <em>Table 12</em>
        <strong>Nut allergy · party of 6 · 18:50</strong>
        <span>Last visit: Ribeye + Malbec</span>
      </div>

      <div className="rx-floor-action">
        <em>RADR guidance</em>
        <strong>MENTION RIBEYE</strong>
      </div>
    </div>
  );
}

function FloorWhy() {
  return (
    <div className="rx-floor-companion" aria-label="Why">
      <p className="rx-floor-why-lead">Evidence → guidance</p>

      <div className="rx-floor-causality" aria-label="Reasoning">
        <span>Reservation</span>
        <i>+</i>
        <span>Kitchen</span>
        <i>+</i>
        <span data-hot>Guest</span>
        <i>+</i>
        <span>Menu</span>
        <i>→</i>
        <strong>Mention Ribeye</strong>
      </div>

      <ul className="rx-floor-loop-metrics">
        <li>
          <em>Guest preference</em>
          <strong>Last: Ribeye</strong>
        </li>
        <li>
          <em>Menu contribution</em>
          <strong>Higher vs lean</strong>
        </li>
        <li>
          <em>Current capacity</em>
          <strong>Cold station 92%</strong>
        </li>
        <li>
          <em>Constraint</em>
          <strong>Nut allergy on file</strong>
        </li>
      </ul>
    </div>
  );
}

function FloorLearn() {
  return (
    <div className="rx-floor-companion" data-phase="after" aria-label="Learn">
      <header className="rx-floor-companion-head">
        <div data-hot="true">
          <em>Outcome</em>
          <strong>Recommendation followed</strong>
        </div>
        <div>
          <em>Table 12</em>
          <strong>Guest substituted successfully</strong>
        </div>
      </header>

      <ul className="rx-floor-loop-metrics">
        <li>
          <em>Kitchen pressure</em>
          <strong>Did not materially rise</strong>
        </li>
        <li>
          <em>Turn</em>
          <strong>Within expectation</strong>
        </li>
        <li>
          <em>Guest</em>
          <strong>Substitution successful</strong>
        </li>
        <li>
          <em>Memory</em>
          <strong>Pattern added</strong>
        </li>
      </ul>

      <p className="rx-floor-memory-tag">Pattern added to Operating Memory</p>
    </div>
  );
}
