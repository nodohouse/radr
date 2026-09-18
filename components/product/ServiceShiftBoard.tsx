"use client";

import type {
  FloorPlan,
  FloorSection,
  FloorTable,
} from "@/lib/radr/floorModel";
import type { BerlinDayRoster } from "@/lib/radr/berlinWeekRoster";

type Props = {
  floor: FloorPlan;
  roster: BerlinDayRoster;
  mealLine: string;
  tablesForServer: (
    serverId: string,
    section: FloorSection,
    tables: FloorTable[],
  ) => string[];
  formatTableRun: (labels: string[]) => string;
};

/**
 * Compact shift lockup — who / where / kitchen in one calm strip.
 * Floor map stays in the first viewport.
 */
export function ServiceShiftBoard({
  floor,
  roster,
  mealLine,
  tablesForServer,
  formatTableRun,
}: Props) {
  const fohCount = floor.sections.reduce(
    (n, s) => n + (s.servers?.length ?? 0),
    0,
  );
  const bohCount = floor.kitchen?.length ?? 0;
  const mealShort = mealLine.replace(/^Dinner service · /, "Dinner · ");

  return (
    <section className="rp-shift-board" aria-label="Who is on this service">
      <header className="rp-shift-board-head">
        <p className="rp-shift-board-kicker">On this service</p>
        <p className="rp-shift-board-title">
          <strong>{roster.weekday}</strong>
          <span>{mealShort}</span>
        </p>
        <p className="rp-shift-board-count">
          {fohCount + bohCount} on
          <i aria-hidden="true">·</i>
          {fohCount} FOH
          <i aria-hidden="true">·</i>
          {bohCount} kitchen
        </p>
        {roster.note ? (
          <p className="rp-shift-board-note">{roster.note}</p>
        ) : null}
      </header>

      <div className="rp-shift-board-body">
        <ul className="rp-shift-board-foh" aria-label="Front of house">
          {floor.sections.map((s) => {
            const people = s.servers ?? [];
            if (people.length === 0) {
              return (
                <li key={s.id} data-closed="true">
                  <em>{s.name}</em>
                  <span>Closed</span>
                </li>
              );
            }
            return (
              <li key={s.id}>
                <em>{s.name}</em>
                <div className="rp-shift-board-run">
                  {people.map((p, i) => {
                    const labels = tablesForServer(p.id, s, floor.tables);
                    return (
                      <span key={p.id}>
                        {i > 0 ? <i aria-hidden="true">·</i> : null}
                        <b title={p.name}>{p.short}</b>
                        <small>{formatTableRun(labels)}</small>
                      </span>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="rp-shift-board-boh" aria-label="Kitchen">
          <em>Kitchen</em>
          {floor.kitchen?.length ? (
            <div className="rp-shift-board-run">
              {floor.kitchen.map((k, i) => (
                <span key={k.id} title={k.picking}>
                  {i > 0 ? <i aria-hidden="true">·</i> : null}
                  <b>{k.name.split(" / ")[0]}</b>
                  <small>{k.person.split(" ")[0]}</small>
                </span>
              ))}
            </div>
          ) : (
            <span className="rp-shift-board-empty">—</span>
          )}
        </div>
      </div>
    </section>
  );
}
