"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  buildingFloors,
  buildingRoomNumbers,
  DEFAULT_HOTEL_BUILDING,
  validateHotelBuilding,
  type HotelBuildingSpec,
} from "@/lib/product/hotelBuilding";
import {
  hotelLivePropertyModel,
  roomStateLabel,
} from "@/lib/radr/product/hotelLive";
import { guestSignals } from "@/lib/product/guestSignals";
import { hotelGuestNeeds } from "@/lib/product/hotelGuestNeeds";
import { HospitalityWorld } from "../hospitality-world/HospitalityWorld";
import type { SpatialEntity } from "../hospitality-world/types";
import "./hotel-building.css";

const Scene = dynamic(() => import("./HotelBuildingScene"), { ssr: false });
const model = hotelLivePropertyModel();
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function BuildingFallback({
  spec,
  highlighted,
}: {
  spec: HotelBuildingSpec;
  highlighted: number | null;
}) {
  const floors = buildingFloors(spec);
  const groundY = Math.max(15, 240 - spec.floors * 23) + spec.floors * 23 + 63;
  return (
    <svg
      className="hb-elevation"
      viewBox={`0 0 420 ${Math.max(320, spec.floors * 23 + 115)}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hb-glass" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#266fb4" />
          <stop offset="1" stopColor="#143653" />
        </linearGradient>
      </defs>
      <ellipse cx="220" cy={groundY} rx="178" ry="28" fill="#c9dacc" />
      {[52, 95, 340, 375].map((x, i) => (
        <g key={x} transform={`translate(${x} ${groundY - (i % 2) * 12})`}>
          <path d="M0 0v-35" stroke="#938573" strokeWidth="4" />
          <ellipse
            cy="-43"
            rx={i % 2 ? 15 : 19}
            ry={i % 2 ? 22 : 27}
            fill={i % 2 ? "#678d77" : "#507e6b"}
          />
        </g>
      ))}
      <g transform={`translate(52 ${Math.max(15, 240 - spec.floors * 23)})`}>
        {floors.map((f) => {
          const y = (spec.floors - f.number) * 23 + 35;
          return (
            <g key={f.number}>
              <path
                d={`M30 ${y}h230v23H30Z`}
                fill={highlighted === f.number ? "#b6f2df" : "#e9e8e1"}
                stroke="#b4c9d1"
              />
              <path
                d={`M260 ${y}l52-28v23l-52 28Z`}
                fill={highlighted === f.number ? "#29be9b" : "#b1c2c9"}
                stroke="#99b0bd"
              />
              {Array.from(
                { length: Math.min(10, Math.max(2, f.rooms)) },
                (_, i) => (
                  <rect
                    key={i}
                    x={37 + i * (216 / Math.min(10, Math.max(2, f.rooms)))}
                    y={y + 4}
                    width={Math.min(
                      14,
                      190 / Math.min(10, Math.max(2, f.rooms)),
                    )}
                    height="14"
                    fill="url(#hb-glass)"
                  />
                ),
              )}
              <path
                d={`M30 ${y + 23}h230l52-28`}
                fill="none"
                stroke={highlighted === f.number ? "#00df9c" : "#92acb7"}
                strokeWidth={highlighted === f.number ? 3 : 1}
              />
            </g>
          );
        })}
        <path d="M30 35 82 7h230l-52 28Z" fill="#dbe4e5" stroke="#a4bbc6" />
        <path d={`M30 ${spec.floors * 23 + 35}h230v28H30Z`} fill="#d3d9d7" />
        <path
          d={`M120 ${spec.floors * 23 + 36}h54v26h-54Z`}
          fill="url(#hb-glass)"
        />
      </g>
    </svg>
  );
}
export function HotelBuildingExplorer({
  onEnterFloor,
  storageKey,
  onPreviewChange,
}: {
  onEnterFloor?: (floor: number) => void;
  storageKey?: string;
  onPreviewChange?: (generated: boolean) => void;
}) {
  const [custom, setCustom] = useState<HotelBuildingSpec | null>(null);
  useEffect(() => {
    onPreviewChange?.(!!custom);
  }, [custom, onPreviewChange]);
  const spec = custom || DEFAULT_HOTEL_BUILDING;
  const floors = useMemo(() => buildingFloors(spec), [spec]);
  const [floor, setFloor] = useState<number | null>(null);
  const [highlighted, setHighlighted] = useState<number | null>(3);
  const [entering, setEntering] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [saved, setSaved] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const generatorButton = useRef<HTMLButtonElement>(null);
  const explorationButton = useRef<HTMLButtonElement>(null);
  const floorTitle = useRef<HTMLHeadingElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enteringRef = useRef(false);
  useEffect(() => {
    if (!active) return;
    const exit = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !dialog.current?.open) {
        setActive(false);
        explorationButton.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", exit);
    return () => document.removeEventListener("keydown", exit);
  }, [active]);
  const specRef = useRef(spec);
  specRef.current = spec;
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setWebgl(false);
    setReady(true);
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change();
    media.addEventListener("change", change);
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      setWebgl(!!gl);
      if (!gl) setReady(true);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setReady(true);
    }
    if (storageKey) {
      try {
        const stored = validateHotelBuilding(
          JSON.parse(localStorage.getItem(storageKey) || "null"),
        );
        if (stored) setCustom(stored);
      } catch {
        /* A private browser can still generate a building for this session. */
      }
    }
    return () => {
      media.removeEventListener("change", change);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [storageKey]);
  useEffect(() => {
    if (floor !== null) floorTitle.current?.focus({ preventScroll: true });
  }, [floor]);
  const enter = useCallback(
    (number: number) => {
      if (enteringRef.current || number < 1 || number > specRef.current.floors)
        return;
      enteringRef.current = true;
      setEntering(number);
      setHighlighted(number);
      timer.current = setTimeout(
        () => {
          if (!custom && onEnterFloor) onEnterFloor(number);
          else {
            setFloor(number);
            setSelected(!custom && number === 3 ? "room_310" : null);
          }
          setEntering(null);
          enteringRef.current = false;
          setActive(false);
        },
        reduced ? 0 : 600,
      );
    },
    [custom, onEnterFloor, reduced],
  );
  const floorRooms = useMemo(
    () =>
      floor === null
        ? []
        : custom
          ? []
          : model.rooms.filter((room) => room.floor === floor),
    [floor, custom],
  );
  const generatedNumbers = useMemo(
    () =>
      floor !== null && custom ? buildingRoomNumbers(floors[floor - 1]!) : [],
    [floor, custom, floors],
  );
  const entities: SpatialEntity[] = useMemo(
    () =>
      custom
        ? generatedNumbers.map((number, i) => ({
            id: `generated-${number}`,
            label: `Room ${number}`,
            number,
            x: ((i % 6) - 2.5) * 3.8,
            z:
              (Math.floor(i / 6) -
                Math.floor((generatedNumbers.length - 1) / 6) / 2) *
              4.3,
            width: 3.4,
            depth: 3.8,
            tone: "unknown",
            status: "Not connected",
            detail: "Awaiting room and booking records",
            signals: [],
          }))
        : floorRooms.map((room) => ({
            id: room.id,
            label: `Room ${room.number}`,
            number: room.number,
            x: (room.x + room.w / 2 - 50) * 0.28,
            z: (room.y + room.h / 2 - 50) * 0.2,
            width: room.w * 0.28,
            depth: room.h * 0.2,
            tone: room.state,
            status: roomStateLabel(room.state),
            detail: room.expectedReadyAt
              ? `Expected ready ${room.expectedReadyAt}`
              : "No readiness estimate",
            signals: guestSignals(hotelGuestNeeds(room), "incoming"),
          })),
    [custom, generatedNumbers, floorRooms],
  );
  const room = floorRooms.find((room) => room.id === selected);
  const needs = room ? hotelGuestNeeds(room) : undefined;
  const currentFloor =
    highlighted === null
      ? null
      : model.floors.find((f) => f.id === highlighted);
  const showExterior = () => {
    setFloor(null);
    setSelected(null);
    setActive(false);
    setReady(!webgl);
  };
  const updateSpec = (next: HotelBuildingSpec | null) => {
    if (timer.current) clearTimeout(timer.current);
    enteringRef.current = false;
    setEntering(null);
    setCustom(next);
    setFloor(null);
    setSelected(null);
    setHighlighted(null);
    setActive(false);
    setReady(!webgl);
    if (storageKey) {
      try {
        if (next) localStorage.setItem(storageKey, JSON.stringify(next));
        else localStorage.removeItem(storageKey);
        setSaved("Building saved on this device.");
      } catch {
        setSaved(
          "Building generated for this session. Device storage is unavailable.",
        );
      }
    } else
      setSaved(
        next ? "Your building preview is ready." : "Demo property restored.",
      );
  };
  return (
    <section
      className="hb-root"
      data-view={floor === null ? "exterior" : "floor"}
      data-generated={!!custom}
      aria-label="Hotel property explorer"
    >
      <header className="hb-head">
        <div>
          <span className="hb-eyebrow">PROPERTY EXPLORER</span>
          <h3>{spec.name}</h3>
          <p>
            {spec.floors} floors <span>·</span> {spec.rooms} rooms{" "}
            <span>·</span> {custom ? "Your building preview" : "Demo property"}
          </p>
        </div>
        <div className="hb-head-actions">
          {floor !== null ? (
            <button type="button" onClick={showExterior}>
              Whole building
            </button>
          ) : null}
          {custom ? (
            <button type="button" onClick={() => updateSpec(null)}>
              Reset demo
            </button>
          ) : null}
          <button
            ref={generatorButton}
            disabled={entering !== null}
            className="hb-generate"
            type="button"
            onClick={() => dialog.current?.showModal()}
          >
            Generate your building <span aria-hidden="true">+</span>
          </button>
        </div>
      </header>
      {floor === null ? (
        <div className="hb-overview">
          <div
            className="hb-scene"
            data-active={active}
            data-ready={ready}
            data-entering={entering !== null}
            data-renderer={webgl ? "webgl" : "elevation"}
          >
            <div className="hb-scene-label">
              <span>EXTERIOR</span>
              <strong>
                {entering
                  ? `Entering floor ${entering}`
                  : "Your property, in perspective."}
              </strong>
            </div>
            <div className="hb-canvas" aria-hidden="true">
              {webgl ? (
                <SceneBoundary
                  key={`${spec.name}-${spec.floors}-${spec.rooms}`}
                  onFailure={onFailure}
                >
                  <Scene
                    spec={spec}
                    active={active}
                    highlighted={highlighted}
                    entering={entering}
                    reduced={reduced}
                    onHover={setHighlighted}
                    onEnter={enter}
                    onReady={onReady}
                    onFailure={onFailure}
                  />
                </SceneBoundary>
              ) : (
                <BuildingFallback spec={spec} highlighted={highlighted} />
              )}
            </div>
            {!ready ? (
              <div className="hb-loading" role="status">
                Preparing your property
              </div>
            ) : null}
            <div className="hb-scene-foot">
              <span>
                {active
                  ? "Drag to orbit · Scroll to zoom · Esc to finish"
                  : "Select a floor to step inside"}
              </span>
              {webgl ? (
                <button
                  ref={explorationButton}
                  disabled={!ready || entering !== null}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActive((v) => !v)}
                >
                  {active ? "Done exploring" : "Explore in 3D"}
                </button>
              ) : null}
            </div>
          </div>
          <aside className="hb-floor-panel" aria-label="Building floors">
            <div className="hb-panel-title">
              <span>CHOOSE YOUR FLOOR</span>
              <strong>
                One building.
                <br /> Every detail connected.
              </strong>
            </div>
            <div className="hb-floor-list">
              {[...floors].reverse().map((f) => {
                const mapped = custom
                  ? null
                  : model.floors.find((m) => m.id === f.number);
                return (
                  <button
                    key={f.number}
                    type="button"
                    disabled={entering !== null}
                    aria-label={`Enter floor ${f.number}`}
                    data-highlighted={highlighted === f.number}
                    onFocus={() => setHighlighted(f.number)}
                    onMouseEnter={() => setHighlighted(f.number)}
                    onClick={() => enter(f.number)}
                  >
                    <span className="hb-floor-number">
                      {String(f.number).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>Floor {f.number}</strong>
                      <small>
                        {custom
                          ? `${f.rooms} rooms · Awaiting data`
                          : `${mapped?.roomCount || 0} mapped rooms`}
                      </small>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        d="m9 5 7 7-7 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
            <div className="hb-floor-context">
              {custom ? (
                <>
                  <strong>Ready to map your operation</strong>
                  <p>
                    Room geometry is generated. Connect room and booking records
                    to see readiness and guest needs.
                  </p>
                </>
              ) : (
                <>
                  <strong>
                    {highlighted ? `Floor ${highlighted}` : "Property overview"}
                  </strong>
                  <p>
                    {currentFloor
                      ? `${currentFloor.cleaning} cleaning · ${currentFloor.inspection} in inspection. Select the floor for room-level context.`
                      : "Select a floor to review room readiness, arrivals and guest requests."}
                  </p>
                  <small>
                    Conceptual exterior · {model.rooms.length} rooms mapped in
                    this demo. Window positions are illustrative.
                  </small>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : (
        <div className="hb-floor-view">
          <div className="hb-floor-heading">
            <h4 ref={floorTitle} tabIndex={-1}>
              Floor {floor}
            </h4>
            <label>
              Change floor{" "}
              <select
                aria-label="Choose building floor"
                value={floor}
                onChange={(e) => {
                  setFloor(Number(e.target.value));
                  setSelected(null);
                  setActive(false);
                }}
              >
                {floors.map((f) => (
                  <option key={f.number} value={f.number}>
                    Floor {f.number}
                  </option>
                ))}
              </select>
            </label>
            <span>
              {entities.length} {custom ? "generated" : "mapped"} rooms
            </span>
          </div>
          <div className="hb-room-layout">
            <div>
              <div className="hb-room-scene" data-active={active}>
                <div inert={!active}>
                  <HospitalityWorld
                    key={`${floor}-${custom ? "custom" : "demo"}`}
                    kind="hotel"
                    label={`Floor ${floor}`}
                    width={28}
                    depth={Math.max(
                      20,
                      Math.ceil(entities.length / 6) * 4.3 + 3,
                    )}
                    entities={entities}
                    selected={selected}
                    onSelect={setSelected}
                  />
                </div>
                <button
                  ref={explorationButton}
                  className="hb-room-explore"
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActive((v) => !v)}
                >
                  {active ? "Done exploring" : "Explore the rooms"}
                </button>
              </div>
              <div
                className="hb-room-picker"
                role="group"
                aria-label="Rooms on selected floor"
              >
                {entities.map((entity) => (
                  <button
                    key={entity.id}
                    type="button"
                    aria-pressed={selected === entity.id}
                    onClick={() => setSelected(entity.id)}
                  >
                    {entity.number}
                    {entity.signals.some((s) => s.kind === "allergy") ? (
                      <span aria-label="Allergy reported">!</span>
                    ) : null}
                    <small>{entity.status}</small>
                  </button>
                ))}
              </div>
            </div>
            <aside
              className="hb-room-details"
              aria-label="Selected room details"
            >
              {room ? (
                <>
                  <span className="hb-eyebrow">ROOM {room.number}</span>
                  <h4>{roomStateLabel(room.state)}</h4>
                  <dl>
                    <div>
                      <dt>Next arrival</dt>
                      <dd>
                        {room.arrivalAt
                          ? `${room.arrivalAt} · ${room.guestName || "Guest name unavailable"}`
                          : "No incoming booking linked"}
                      </dd>
                    </div>
                    <div>
                      <dt>Readiness</dt>
                      <dd>
                        {room.expectedReadyAt
                          ? `Expected ${room.expectedReadyAt}, not confirmed`
                          : room.state === "ready"
                            ? "Marked ready"
                            : "Confirm before handover"}
                      </dd>
                    </div>
                    <div>
                      <dt>Housekeeping owner</dt>
                      <dd>{room.assigned || "Unassigned"}</dd>
                    </div>
                  </dl>
                  <div
                    className="hb-guest-alert"
                    data-alert={!!needs?.allergies?.length}
                  >
                    <strong>
                      {needs?.allergies
                        ?.map((a) => `${a.allergen} allergy`)
                        .join(", ") || "Allergies not confirmed"}
                    </strong>
                    <p>
                      {needs
                        ? "Incoming guest · Guest-reported; reconfirm before serving."
                        : "No allergy record linked to this room. Check guest notes."}
                    </p>
                  </div>
                  {needs ? (
                    <div className="hb-guest-notes">
                      <strong>{needs.occasions?.join(" · ")}</strong>
                      <p>{needs.requests.join(" · ")}</p>
                    </div>
                  ) : null}
                  <ul className="hb-room-tasks">
                    {room.dependencies.map((d) => (
                      <li key={d.id} data-done={d.done}>
                        {d.done ? "Complete" : "Pending"} · {d.label}
                      </li>
                    ))}
                  </ul>
                </>
              ) : selected ? (
                <>
                  <span className="hb-eyebrow">
                    ROOM {entities.find((e) => e.id === selected)?.number}
                  </span>
                  <h4>Awaiting operating data</h4>
                  <p>
                    This is a generated room shell. Readiness, arrivals,
                    allergies and guest requests will appear here when room
                    records are linked.
                  </p>
                </>
              ) : (
                <>
                  <span className="hb-eyebrow">ROOM CONTEXT</span>
                  <h4>
                    {custom
                      ? "Your floor is ready to connect."
                      : "Every room tells a story."}
                  </h4>
                  <p>
                    Select a room to review readiness, arrivals, ownership and
                    guest needs.
                  </p>
                </>
              )}
            </aside>
          </div>
        </div>
      )}
      {saved ? (
        <p className="hb-saved" role="status">
          {saved}
        </p>
      ) : null}
      <dialog
        ref={dialog}
        className="hb-dialog"
        aria-labelledby="hb-generator-title"
        onClose={() => generatorButton.current?.focus({ preventScroll: true })}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <form
          key={`${spec.name}-${spec.floors}-${spec.rooms}`}
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const next = validateHotelBuilding({
              version: 1,
              name: data.get("name"),
              floors: Number(data.get("floors")),
              rooms: Number(data.get("rooms")),
            });
            const input = e.currentTarget.elements.namedItem(
              "rooms",
            ) as HTMLInputElement;
            input.setCustomValidity(
              next
                ? ""
                : "Use at least one room per floor and no more than 60 rooms per floor (960 total).",
            );
            if (!next) {
              input.reportValidity();
              return;
            }
            updateSpec(next);
            dialog.current?.close();
          }}
        >
          <span className="hb-eyebrow">MAKE IT YOURS</span>
          <h3 id="hb-generator-title">
            Your property.
            <br />A new perspective.
          </h3>
          <p>
            Set the size. RADR builds an exterior and a room layout for each
            floor.
          </p>
          <label>
            Property name
            <input
              name="name"
              required
              maxLength={60}
              defaultValue={spec.name}
              autoComplete="organization"
              pattern={".*\\S.*"}
            />
          </label>
          <div className="hb-form-grid">
            <label>
              Guest floors
              <input
                name="floors"
                type="number"
                min={1}
                max={24}
                step={1}
                required
                defaultValue={spec.floors}
                onInput={(e) => {
                  const rooms = e.currentTarget.form?.elements.namedItem(
                    "rooms",
                  ) as HTMLInputElement;
                  rooms?.setCustomValidity("");
                }}
              />
            </label>
            <label>
              Total rooms
              <input
                name="rooms"
                type="number"
                min={1}
                max={960}
                step={1}
                required
                defaultValue={spec.rooms}
                onInput={(e) => e.currentTarget.setCustomValidity("")}
              />
            </label>
          </div>
          <small>
            Rooms are distributed evenly across floors. This creates a
            conceptual layout, not a measured architectural model.{" "}
            {storageKey
              ? "Saved on this device."
              : "Preview only; no account required."}
          </small>
          <div className="hb-dialog-actions">
            <button type="button" onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <button type="submit">Generate building</button>
          </div>
        </form>
      </dialog>
    </section>
  );
}
