"use client";

import { useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { BRIEF_ATTENTION } from "@/data/demo";
import { demoValueUnderRadr } from "@/lib/radr/decision/economics";

const ROLES = [
  {
    id: "cfo",
    label: "CFO",
    question: "Revenue is up. Why is contribution flat?",
  },
  {
    id: "coo",
    label: "COO",
    question: "Same revenue band. Why does contribution diverge?",
  },
  {
    id: "gm",
    label: "GM",
    question: "You don’t need more information during service.",
  },
] as const;

/**
 * Iconic role screenshots — what each buyer remembers.
 */
export function SectionRoleAwake() {
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("cfo");
  const value = demoValueUnderRadr();
  const active = ROLES.find((r) => r.id === role) ?? ROLES[0];

  return (
    <section
      className="rx-spine-section rx-scene rx-role"
      data-nav-theme="light"
      id="who-awake"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">Who feels it</p>
          <h2 className="rx-spine-title">
            Different roles.
            <br />
            Same economic pressure.
          </h2>
        </header>

        <div className="rx-role-tabs" role="tablist" aria-label="Role lens">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={role === r.id}
              data-on={role === r.id ? "true" : "false"}
              onClick={() => setRole(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <p className="rx-role-q">{active.question}</p>

        {role === "cfo" ? (
          <div className="rx-role-shot" data-role="cfo">
            <strong className="rx-econ-verified">
              {formatDecisionMoney(value.verifiedEuro)}
            </strong>
            <em>VERIFIED VALUE THIS MONTH</em>
            <ul>
              <li>
                <strong>{formatDecisionMoney(value.byKind.recovered)}</strong>
                <span>Recovered</span>
              </li>
              <li>
                <strong>{formatDecisionMoney(value.byKind.protected)}</strong>
                <span>Protected</span>
              </li>
              <li>
                <strong>{formatDecisionMoney(value.byKind.created)}</strong>
                <span>Created</span>
              </li>
              <li>
                <strong>{formatDecisionMoney(value.byKind.avoided)}</strong>
                <span>Avoided</span>
              </li>
            </ul>
            <p className="rx-fut-quiet">DEMO · illustrative product data</p>
          </div>
        ) : null}

        {role === "coo" ? (
          <div className="rx-role-shot" data-role="coo">
            <strong>8 locations</strong>
            <em>3 NEED INTERVENTION</em>
            <ul className="rx-role-locs">
              <li>
                <span>Berlin</span>
                <strong data-tone="up">+4.2%</strong>
                <em>Supplier pattern</em>
              </li>
              <li>
                <span>Amsterdam</span>
                <strong data-tone="down">−1.8%</strong>
                <em>Distribution drag</em>
              </li>
              <li>
                <span>Lisbon</span>
                <strong data-tone="up">+2.1%</strong>
                <em>Orphan playbook</em>
              </li>
            </ul>
            <p className="rx-pain-punch">
              Consistency should not depend on who is working tonight.
            </p>
          </div>
        ) : null}

        {role === "gm" ? (
          <div className="rx-role-shot" data-role="gm">
            <strong>{BRIEF_ATTENTION.needsYou}</strong>
            <em>THINGS NEED YOU</em>
            <ul>
              <li>
                <strong className="rx-econ-risk">€620</strong>
                <span>Vs seat-now · decide by 18:53</span>
              </li>
              <li>
                <strong className="rx-econ-risk">€284</strong>
                <span>Exposure · watching → ask</span>
              </li>
            </ul>
            <p className="rx-pain-punch">
              Everything else operating within expectations.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
