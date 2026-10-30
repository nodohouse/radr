"use client";

import { VendorLogo } from "@/components/product/connections/VendorLogo";
import type { CatalogEntry } from "@/components/product/connections/VendorLogo";
import {
  buildSetupSteps,
  type SetupKind,
} from "@/lib/radr/product/connectionsProofEngine";

type Props = {
  entry: CatalogEntry;
  kind: SetupKind;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConnectionsSetupModal({
  entry,
  kind,
  onClose,
  onConfirm,
}: Props) {
  const steps = buildSetupSteps(entry, kind);
  const title =
    kind === "setup"
      ? `Set up ${entry.name}`
      : kind === "request"
        ? `Request access · ${entry.name}`
        : `Notify me · ${entry.name}`;
  const confirmLabel =
    kind === "setup"
      ? "Connect"
      : kind === "request"
        ? "Submit request"
        : "Notify me";

  return (
    <div
      className="ce-modal"
      role="presentation"
      data-connections-setup="true"
      onClick={onClose}
    >
      <div
        className="ce-modal-card"
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ce-modal-head">
          <VendorLogo id={entry.id} name={entry.name} size={40} />
          <div>
            <h3>{title}</h3>
            <p>
              {entry.category} ·{" "}
              {kind === "setup"
                ? "Read-only by default"
                : kind === "request"
                  ? "Enterprise connector"
                  : "Roadmap connector"}
            </p>
          </div>
        </div>

        <dl className="ce-modal-meta">
          <div>
            <dt>Data</dt>
            <dd>{entry.data}</dd>
          </div>
          <div>
            <dt>RADR unlocks</dt>
            <dd>{entry.unlocks}</dd>
          </div>
        </dl>

        <ol className="ce-setup-steps">
          {steps.map((s) => (
            <li key={s.id} data-state={s.state}>
              <strong>{s.label}</strong>
              {s.detail ? <span>{s.detail}</span> : null}
            </li>
          ))}
        </ol>

        <div className="ce-modal-actions">
          <button type="button" className="ce-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ce-btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
