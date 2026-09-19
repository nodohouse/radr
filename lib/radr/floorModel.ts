/**
 * Floor / service map domain: operational intelligence surface.
 */

export type TableShape = "rect" | "round";

export type TableState =
  | "AVAILABLE"
  | "RESERVED"
  | "SEATED"
  | "TURNING"
  | "CANCELLED"
  | "BLOCKED";

/** Reserved header band inside every section (SVG units). */
export const SECTION_HEADER_HEIGHT = 64;
/** Gap between header bottom and first table. */
export const SECTION_HEADER_GAP = 22;
/** Minimum gap between table bounding boxes. */
export const TABLE_MIN_GAP = 16;

export type FloorServer = {
  id: string;
  name: string;
  /** Short label on map, e.g. LENA */
  short: string;
  sectionId: string;
  role: "server" | "host" | "runner";
};

export type KitchenStation = {
  id: string;
  name: string;
  /** Who is on the station */
  person: string;
  /** What they are picking up / owning */
  picking: string;
};

export type FloorSection = {
  id: string;
  name: string;
  capacity: number;
  assignedFoh: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Named FOH covering this zone */
  servers?: FloorServer[];
};

export type FloorTable = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: TableShape;
  seats: number;
  sectionId: string;
  combinableWith?: string[];
};

export type FloorPlan = {
  id: string;
  locationId: string;
  name: string;
  width: number;
  height: number;
  seats: number;
  sections: FloorSection[];
  tables: FloorTable[];
  /** Kitchen station ownership for GM / kitchen overview */
  kitchen?: KitchenStation[];
};

export type TableMoment = {
  tableId: string;
  state: TableState;
  covers?: number;
  expectedSpend?: number;
  reservationId?: string;
  note?: string;
};

export type FloorOverlay = "occupancy" | "revenue" | "pressure" | "turns";

export type ServiceTimeKey = "now" | "18:00" | "19:00" | "20:00" | "21:00";

export type FloorBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Absolute Y where table canvas begins inside a section. */
export function sectionCanvasTop(section: FloorSection): number {
  return section.y + SECTION_HEADER_HEIGHT + SECTION_HEADER_GAP;
}

export function sectionHeaderBottom(section: FloorSection): number {
  return section.y + SECTION_HEADER_HEIGHT;
}

export function tableBounds(t: FloorTable): FloorBounds {
  return { x: t.x, y: t.y, width: t.width, height: t.height };
}

function intersects(a: FloorBounds, b: FloorBounds, gap = 0): boolean {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

export type FloorGeometryIssue = {
  kind: "header-overlap" | "table-overlap" | "out-of-section";
  message: string;
};

/** Deterministic geometry validation: no visual inspection required. */
export function validateFloorGeometry(plan: FloorPlan): FloorGeometryIssue[] {
  const issues: FloorGeometryIssue[] = [];
  const bySection = new Map(plan.sections.map((s) => [s.id, s]));

  for (const t of plan.tables) {
    const section = bySection.get(t.sectionId);
    if (!section) {
      issues.push({
        kind: "out-of-section",
        message: `${t.id}: unknown section ${t.sectionId}`,
      });
      continue;
    }
    const canvasTop = sectionCanvasTop(section);
    if (t.y < canvasTop) {
      issues.push({
        kind: "header-overlap",
        message: `${t.id}: top ${t.y} < canvas top ${canvasTop} (header safe zone)`,
      });
    }
    if (
      t.x < section.x + 8 ||
      t.y + t.height > section.y + section.height - 8 ||
      t.x + t.width > section.x + section.width - 8
    ) {
      issues.push({
        kind: "out-of-section",
        message: `${t.id}: extends outside section ${section.id} padding`,
      });
    }
  }

  for (let i = 0; i < plan.tables.length; i++) {
    for (let j = i + 1; j < plan.tables.length; j++) {
      const a = plan.tables[i]!;
      const b = plan.tables[j]!;
      if (a.sectionId !== b.sectionId) continue;
      if (intersects(tableBounds(a), tableBounds(b), TABLE_MIN_GAP)) {
        issues.push({
          kind: "table-overlap",
          message: `${a.id} ↔ ${b.id}: bounding boxes closer than ${TABLE_MIN_GAP}px`,
        });
      }
    }
  }

  return issues;
}
