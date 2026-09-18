"use client";

/**
 * Connection band — systems flow into RADR → Decision → Verified.
 */

const NODES = [
  { id: "inv", label: "Invoices", status: "Demo" },
  { id: "ctr", label: "Contracts", status: "Demo" },
  { id: "ap", label: "AP", status: "Building" },
  { id: "pos", label: "POS", status: "Planned" },
  { id: "proc", label: "Procurement", status: "Planned" },
  { id: "res", label: "Reservations", status: "Planned" },
  { id: "pay", label: "Payments", status: "Planned" },
] as const;

type Props = {
  kicker: string;
  title: string;
  lead: string;
  body: string;
  note: string;
};

export function ConnectionBand({ kicker, title, lead, body, note }: Props) {
  return (
    <div className="rx-connband">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-rec-p">{lead}</p>
      <p className="rx-rec-p">{body}</p>

      <div className="rx-connband-flow" aria-label="Systems into RADR">
        <div className="rx-connband-sources">
          {NODES.map((n) => (
            <div key={n.id} className="rx-connband-node" data-status={n.status}>
              <em>{n.label}</em>
              <span>{n.status}</span>
            </div>
          ))}
        </div>
        <div className="rx-connband-arrow" aria-hidden="true">
          →
        </div>
        <div className="rx-connband-core">
          <strong>RADR</strong>
          <span>Decision</span>
          <span data-tone="verified">Verified</span>
        </div>
      </div>
      <p className="rx-rec-p rx-rec-muted">{note}</p>
    </div>
  );
}
