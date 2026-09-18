"use client";

type Table = {
  id: string;
  label: string;
  zone: string;
  x: number;
  y: number;
  state: "occ" | "open" | "reserved" | "turn";
  why: string;
};

const TABLES: Table[] = [
  { id: "a1", label: "A1", zone: "Main", x: 18, y: 22, state: "occ", why: "Seated · mid-course" },
  { id: "a2", label: "A2", zone: "Main", x: 32, y: 18, state: "occ", why: "Seated · mid-course" },
  { id: "a3", label: "A3", zone: "Main", x: 46, y: 22, state: "reserved", why: "Reserved · inbound covers claim this seat" },
  { id: "a4", label: "A4", zone: "Main", x: 18, y: 38, state: "occ", why: "Seated · dessert" },
  { id: "a5", label: "A5", zone: "Main", x: 32, y: 36, state: "open", why: "Open · available after clear" },
  { id: "a6", label: "A6", zone: "Main", x: 46, y: 38, state: "reserved", why: "Reserved · inbound covers claim this seat" },
  { id: "a7", label: "A7", zone: "Main", x: 24, y: 54, state: "turn", why: "Turn risk · second seating after inbound wave" },
  { id: "a8", label: "A8", zone: "Main", x: 40, y: 56, state: "turn", why: "Turn risk · cold-station constrained if seat-now" },
  { id: "a9", label: "A9", zone: "Main", x: 56, y: 52, state: "open", why: "Open · terrace overflow" },
  { id: "b1", label: "B1", zone: "Bar", x: 72, y: 20, state: "occ", why: "Seated · bar party" },
  { id: "b2", label: "B2", zone: "Bar", x: 84, y: 24, state: "occ", why: "Seated · bar party" },
  { id: "b3", label: "B3", zone: "Bar", x: 78, y: 40, state: "turn", why: "Turn risk · bar party blocking peak tables" },
  { id: "t1", label: "T1", zone: "Terrace", x: 68, y: 58, state: "reserved", why: "Reserved · inbound covers claim this seat" },
  { id: "t2", label: "T2", zone: "Terrace", x: 82, y: 60, state: "open", why: "Open · weather-ok" },
  { id: "t3", label: "T3", zone: "Terrace", x: 94, y: 56, state: "turn", why: "Turn risk · terrace under-served if kitchen slips" },
];

const STATE_LABEL: Record<Table["state"], string> = {
  occ: "Seated",
  open: "Open",
  reserved: "Reserved",
  turn: "Turn risk",
};

type Props = {
  highlightTurns?: boolean;
  highlightReserved?: boolean;
  focusTable: string | null;
  onFocusTable: (id: string | null) => void;
  decisionId?: string;
  onOpenDecision?: () => void;
};

export function LiveFloorMini({
  highlightTurns,
  highlightReserved,
  focusTable,
  onFocusTable,
  decisionId = "D-1911",
  onOpenDecision,
}: Props) {
  const focused = TABLES.find((t) => t.id === focusTable) ?? null;

  return (
    <div className="lab-floor-mini lab-floor-utility">
      <div className="lab-floor-mini-head">
        <h3>Floor</h3>
        <ul className="lab-floor-mini-legend">
          <li data-k="occ">Seated</li>
          <li data-k="open">Open</li>
          <li data-k="res">Reserved</li>
          <li data-k="turn">Turn risk</li>
        </ul>
      </div>
      <div className="lab-floor-body">
        <svg
          className="lab-floor-mini-svg"
          viewBox="0 0 110 78"
          role="img"
          aria-label="Floor occupancy"
        >
          <rect x="8" y="8" width="54" height="42" rx="3" className="lab-floor-zone" />
          <text x="11" y="16" className="lab-floor-zone-label">
            Main
          </text>
          <rect x="64" y="8" width="38" height="36" rx="3" className="lab-floor-zone" />
          <text x="67" y="16" className="lab-floor-zone-label">
            Bar
          </text>
          <rect x="8" y="52" width="94" height="20" rx="3" className="lab-floor-zone" />
          <text x="11" y="60" className="lab-floor-zone-label">
            Terrace
          </text>

          {TABLES.map((t) => {
            const on =
              focusTable === t.id ||
              (highlightTurns && t.state === "turn") ||
              (highlightReserved && t.state === "reserved");
            const pattern =
              t.state === "turn"
                ? "url(#turnHatch)"
                : t.state === "reserved"
                  ? undefined
                  : undefined;
            return (
              <g key={t.id}>
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={t.state === "turn" ? 3.4 : 2.8}
                  className={`lab-ft lab-ft-${t.state}`}
                  data-on={on ? "true" : undefined}
                  fill={pattern}
                  role="button"
                  tabIndex={0}
                  aria-label={`Table ${t.label} · ${STATE_LABEL[t.state]}`}
                  onMouseEnter={() => onFocusTable(t.id)}
                  onFocus={() => onFocusTable(t.id)}
                  onClick={() =>
                    onFocusTable(focusTable === t.id ? null : t.id)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onFocusTable(focusTable === t.id ? null : t.id);
                    }
                  }}
                />
                {on ? (
                  <text
                    x={t.x}
                    y={t.y - 5}
                    textAnchor="middle"
                    className="lab-ft-label"
                  >
                    {t.label}
                  </text>
                ) : null}
              </g>
            );
          })}
          <defs>
            <pattern
              id="turnHatch"
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="3"
                stroke="#c48a2e"
                strokeWidth="1"
              />
            </pattern>
          </defs>
        </svg>

        <div className="lab-floor-panel" role="status">
          {focused ? (
            <>
              <p className="lab-floor-panel-id">
                <strong>{focused.label}</strong>
                <span data-state={focused.state}>
                  {STATE_LABEL[focused.state]}
                </span>
              </p>
              <p className="lab-floor-panel-zone">{focused.zone}</p>
              <p className="lab-floor-panel-why">{focused.why}</p>
              {(focused.state === "turn" || focused.state === "reserved") &&
              onOpenDecision ? (
                <button
                  type="button"
                  className="lab-floor-panel-link"
                  onClick={onOpenDecision}
                >
                  Linked · {decisionId}
                </button>
              ) : null}
            </>
          ) : (
            <p className="lab-floor-panel-idle">
              Focus a table — status, why, link to active decision
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
