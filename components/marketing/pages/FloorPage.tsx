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
          <strong>18:42</strong>
        </div>
        <div data-hot="true">
          <em>Table 12</em>
          <strong>VIP · TABLE 12</strong>
        </div>
        <div>
          <em>Hold</em>
          <strong>Do not release</strong>
        </div>
      </header>

      <div className="rx-floor-companion-table">
        <em>FOH brief</em>
        <strong>Nut allergy on file</strong>
        <span>Seat by 18:50 · party of 6 · returning guest</span>
      </div>

      <div className="rx-floor-action">
        <em>Instruction</em>
        <strong>SEAT BY 18:50 · ALLERGY BRIEF OPEN</strong>
      </div>
    </div>
  );
}

function FloorWhy() {
  return (
    <div className="rx-floor-companion" aria-label="Why">
      <p className="rx-floor-why-lead">Guest · kitchen · timing</p>

      <div className="rx-floor-causality" aria-label="Reasoning">
        <span>Reservation</span>
        <i>+</i>
        <span data-hot>Allergy</span>
        <i>+</i>
        <span>Cold station 92%</span>
        <i>→</i>
        <strong>Hold table · brief FOH</strong>
      </div>

      <ul className="rx-floor-loop-metrics">
        <li>
          <em>Guest</em>
          <strong>VIP · nut allergy</strong>
        </li>
        <li>
          <em>Deadline</em>
          <strong>Seat by 18:50</strong>
        </li>
        <li>
          <em>Capacity</em>
          <strong>Cold station pressure</strong>
        </li>
        <li>
          <em>Constraint</em>
          <strong>Do not release Table 12</strong>
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
          <strong>Brief followed</strong>
        </div>
        <div>
          <em>Table 12</em>
          <strong>Seated on time · allergy honored</strong>
        </div>
      </header>

      <ul className="rx-floor-loop-metrics">
        <li>
          <em>Service</em>
          <strong>No allergy incident</strong>
        </li>
        <li>
          <em>Turn</em>
          <strong>Within expectation</strong>
        </li>
        <li>
          <em>FOH</em>
          <strong>Brief acknowledged</strong>
        </li>
        <li>
          <em>Memory</em>
          <strong>VIP allergy pattern retained</strong>
        </li>
      </ul>

      <p className="rx-floor-memory-tag">Pattern added to Operating Memory</p>
    </div>
  );
}
