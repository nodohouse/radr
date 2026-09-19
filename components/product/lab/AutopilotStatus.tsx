"use client";

/**
 * Autopilot status — progressive trust on the active Decision.
 */

import { AUTOPILOT_LADDER, type AutopilotModel } from "./labAutopilot";

export function AutopilotStatus({ model }: { model: AutopilotModel }) {
  return (
    <aside className="lab-auto" data-interrupt={model.interrupt}>
      <header className="lab-auto-head">
        <p className="lab-auto-k">Autopilot</p>
        <ol className="lab-auto-ladder" aria-label="Trust ladder">
          {AUTOPILOT_LADDER.map((step) => (
            <li
              key={step.level}
              data-on={model.level >= step.level ? "true" : undefined}
              data-current={model.level === step.level ? "true" : undefined}
            >
              <strong>{step.level}</strong>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      </header>

      <p className="lab-auto-level">{model.levelLabel}</p>
      <h3 className="lab-auto-headline">{model.headline}</h3>
      <p className="lab-auto-because">because {model.because}</p>
      <p className="lab-auto-memory">{model.memoryNote}</p>

      <div className="lab-auto-policy">
        <p className="lab-auto-policy-k">Policy</p>
        <ul>
          {model.policy.map((p) => (
            <li key={p.id} data-mode={p.mode}>
              <strong>{p.label}</strong>
              <em>
                {p.mode === "auto"
                  ? "Auto"
                  : p.mode === "demo"
                    ? "Demo"
                    : "Ask"}
              </em>
              <span>{p.note}</span>
            </li>
          ))}
        </ul>
      </div>

      {model.receipt ? (
        <div className="lab-auto-receipt">
          <p className="lab-auto-policy-k">Lifecycle</p>
          <ol>
            <li>
              <em>Executed</em>
              <span>{model.receipt.executed}</span>
            </li>
            <li>
              <em>Observed</em>
              <span>{model.receipt.observed}</span>
            </li>
            <li>
              <em>Verified</em>
              <span>{model.receipt.verified}</span>
            </li>
          </ol>
        </div>
      ) : null}
    </aside>
  );
}
