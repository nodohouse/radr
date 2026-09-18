"use client";

/**
 * Platform signature moments — Decision evolution, Futures, Verified, Memory.
 * Prepended to the existing Platform live environment.
 */

import { useState } from "react";
import {
  PHONE_GM_PERISHABLE,
  PHONE_VERIFIED,
  RadrPhone,
} from "@/components/marketing/scenes/home/RadrPhone";

const LIFE = [
  "Detected",
  "Understood",
  "Futures",
  "Recommended",
  "Approved",
  "Observed",
  "Verified",
  "Learned",
] as const;

const FUTURES = [
  {
    id: "seat",
    title: "Seat now",
    euro: "€0",
    note: "Kitchen →97% · 9 second turns lost",
    rec: false,
  },
  {
    id: "wait",
    title: "Wait 12m",
    euro: "+€620",
    note: "Protect peak · reversible",
    rec: true,
  },
  {
    id: "kill",
    title: "Kill delivery",
    euro: "+€180",
    note: "Over-corrects · guest friction",
    rec: false,
  },
] as const;

const VALUE = [
  "Identified",
  "Expected",
  "Observed",
  "Attributed",
  "Verified",
] as const;

export function PlatformSignature() {
  const [life, setLife] = useState(0);
  const [future, setFuture] = useState(1);
  const [value, setValue] = useState(4);
  const sealed = life >= 6;

  return (
    <div className="rx-psig">
      <section className="rx-psig-block" id="evidence" data-nav-theme="light">
        <div className="rx-shell">
          <p className="rx-rec-k">The Decision object</p>
          <h2 className="rx-rec-h">The Decision should survive the moment.</h2>
          <p className="rx-rec-p">
            Most software stores the transaction. RADR stores why the Decision
            existed, what evidence supported it, what alternatives were
            considered, what action was chosen, what happened, and what should
            change next time.
          </p>

          <div className="rx-psig-decision" data-sealed={sealed ? "true" : undefined}>
            <header>
              <em>D-1911 · Berlin Mitte</em>
              <strong>{LIFE[life]}</strong>
            </header>
            <h3>Wait 12 minutes</h3>
            <p className="rx-psig-euro" data-grade={sealed ? "Verified" : "Expected"}>
              {sealed ? "€620 Verified" : "€620 Expected"}
            </p>
            <p>
              because 38 inbound + delivery pressure push kitchen toward 97% and
              expose 9 second turns.
            </p>
            <div className="rx-psig-life" role="tablist">
              {LIFE.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={life === i}
                  data-on={life === i ? "true" : undefined}
                  data-done={i < life ? "true" : undefined}
                  onClick={() => setLife(i)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rx-psig-block rx-psig-band" data-nav-theme="light">
        <div className="rx-shell rx-psig-split">
          <div>
            <p className="rx-rec-k">Futures</p>
            <h2 className="rx-rec-h">Same baseline. Different paths.</h2>
            <p className="rx-rec-p">
              Expected contribution · capacity · risk · uncertainty — on a common
              scale.
            </p>
            <div className="rx-psig-futures">
              {FUTURES.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  className="rx-psig-future"
                  data-on={future === i ? "true" : undefined}
                  data-rec={f.rec ? "true" : undefined}
                  onClick={() => setFuture(i)}
                >
                  <strong>{f.title}</strong>
                  <em>{f.euro}</em>
                  <span>{f.note}</span>
                  {f.rec ? <i>REC</i> : null}
                </button>
              ))}
            </div>
          </div>
          <RadrPhone state={PHONE_GM_PERISHABLE} />
        </div>
      </section>

      <section className="rx-psig-block" data-nav-theme="light">
        <div className="rx-shell rx-psig-split">
          <div>
            <p className="rx-rec-k">Verified Value</p>
            <h2 className="rx-rec-h">Follow the euro home.</h2>
            <div className="rx-psig-value" role="tablist">
              {VALUE.map((v, i) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={value === i}
                  data-on={value === i ? "true" : undefined}
                  data-done={i < value ? "true" : undefined}
                  onClick={() => setValue(i)}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="rx-psig-value-note">
              {value === 4
                ? "€273 recovered · matched to INV-88421 · AP-POST-991"
                : value === 3
                  ? "Linked to Decision D-4102 + prepared dispute"
                  : value === 2
                    ? "Credit memo observed on supplier ledger"
                    : value === 1
                      ? "€273 Expected if dispute path holds — not cash"
                      : "Contract variance identified across invoice + terms"}
            </p>
          </div>
          <RadrPhone state={PHONE_VERIFIED} />
        </div>
      </section>

      <section className="rx-psig-block rx-psig-band" id="autopilot" data-nav-theme="light">
        <div className="rx-shell">
          <p className="rx-rec-k">Operating Memory → Autopilot</p>
          <h2 className="rx-rec-h">Trust is earned from what verified.</h2>
          <div className="rx-psig-memory">
            <div>
              <strong>12</strong>
              <span>similar services</span>
            </div>
            <div>
              <strong>5</strong>
              <span>pattern matches</span>
            </div>
            <div>
              <strong>4</strong>
              <span>interventions</span>
            </div>
            <div data-hot>
              <strong>3</strong>
              <span>Verified favorable</span>
            </div>
          </div>
          <p className="rx-psig-auto">
            Playbook v3 · <em>Auto-stage now allowed</em> · Always ask before
            sending material external actions.
          </p>
          <div className="rx-prog-trust">
            <div>
              <p className="rx-intel-class-k">Permission</p>
              <ol>
                <li>Suggest</li>
                <li>Stage</li>
                <li>Auto within policy</li>
              </ol>
            </div>
            <div>
              <p className="rx-intel-class-k">Lifecycle</p>
              <ol>
                <li>Executed</li>
                <li>Observed</li>
                <li>Verified</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
