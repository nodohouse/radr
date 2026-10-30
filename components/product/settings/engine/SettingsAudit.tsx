"use client";

const EVENTS = [
  {
    time: "Today 09:14",
    actor: "Jordan Blake · Human",
    action: "Changed Delivery Throttle autonomy",
    object: "Prepare → Request approval",
    scope: "All restaurants",
  },
  {
    time: "Today 08:02",
    actor: "SERVICE OPERATOR · RADR",
    action: "Prepared delivery throttle",
    object: "Soho · New York · 12 min",
    scope: "Soho · New York",
  },
  {
    time: "Yesterday 18:41",
    actor: "Elena Voss · Human",
    action: "Approved D-4102",
    object: "Supplier variance · €273",
    scope: "Group",
  },
  {
    time: "Yesterday 11:20",
    actor: "System",
    action: "Data Health gate",
    object: "Finance operator → observe (trust 62%)",
    scope: "Organization",
  },
  {
    time: "Mon 16:05",
    actor: "Marcus Chen · Human",
    action: "Invited user",
    object: "Alex Rivera · Viewer",
    scope: "Group",
  },
  {
    time: "Mon 10:12",
    actor: "Jordan Blake · Human",
    action: "Changed Berlin timezone",
    object: "America/New_York (unchanged)",
    scope: "Soho · New York",
  },
] as const;

export function SettingsAudit() {
  return (
    <section className="se-panel" data-settings-audit="true">
      <header className="se-panel-head">
        <div>
          <h2>Audit Trail</h2>
          <p>
            Who changed what — humans, RADR Operators, system, and integrations.
            Demo history is deterministic.
          </p>
        </div>
      </header>

      <div className="se-table-wrap">
        <table className="se-table se-audit-table" aria-label="Audit events">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Object</th>
              <th>Scope</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => (
              <tr key={`${e.time}-${e.action}`}>
                <td>{e.time}</td>
                <td>{e.actor}</td>
                <td>
                  <strong>{e.action}</strong>
                </td>
                <td>{e.object}</td>
                <td>{e.scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
