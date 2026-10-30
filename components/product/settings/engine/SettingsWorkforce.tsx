"use client";

type Props = { isHotel: boolean };

const RESTAURANT_ROLES = [
  { role: "GM", target: "Labor ≤ 28%", note: "Venue P&L owner" },
  { role: "Service Manager", target: "FOH coverage", note: "Peak windows" },
  { role: "Head Chef", target: "BOH hours", note: "Prep + line" },
  { role: "FOH", target: "Min floor", note: "Service standards" },
  { role: "BOH", target: "Min kitchen", note: "Station coverage" },
];

const HOTEL_ROLES = [
  { role: "Hotel GM", target: "Labor ≤ 32%", note: "Property P&L" },
  { role: "Front Office", target: "Desk coverage", note: "Arrivals wave" },
  { role: "Housekeeping", target: "Rooms / hour", note: "Readiness" },
  { role: "Revenue", target: "—", note: "Functional · not floor labor" },
];

export function SettingsWorkforce({ isHotel }: Props) {
  const rows = isHotel ? HOTEL_ROLES : RESTAURANT_ROLES;
  return (
    <section className="se-panel" data-settings-workforce="true">
      <header className="se-panel-head">
        <div>
          <h2>Workforce</h2>
          <p>
            Human workforce structure and labor targets — not RADR digital
            operators (those live under Autonomy).
          </p>
        </div>
      </header>

      <div className="se-table-wrap">
        <table className="se-table" aria-label="Workforce roles">
          <thead>
            <tr>
              <th>Role</th>
              <th>Labor target</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.role}>
                <td>
                  <strong>{r.role}</strong>
                </td>
                <td>{r.target}</td>
                <td>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
