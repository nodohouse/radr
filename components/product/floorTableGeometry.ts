import type { FloorTable } from "@/lib/radr/floorModel";

export type ChairPose = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Chairs sit clearly around the table surface so seat count is readable.
 * Kept inside the allocated table box so geometry validation still holds.
 */
export function chairPosesForTable(t: FloorTable): ChairPose[] {
  const seats = Math.max(1, Math.min(t.seats, 12));
  const pad = 2.5;
  const chairW = Math.max(7, Math.min(12, t.width * 0.28));
  const chairH = Math.max(5, Math.min(8, t.height * 0.22));
  const innerX = t.x + pad;
  const innerY = t.y + pad;
  const innerW = Math.max(chairW, t.width - pad * 2);
  const innerH = Math.max(chairH, t.height - pad * 2);
  const poses: ChairPose[] = [];

  const place = (side: "n" | "e" | "s" | "w", index: number, count: number) => {
    const frac = (index + 0.5) / Math.max(1, count);
    if (side === "n") {
      poses.push({
        x: innerX + innerW * frac - chairW / 2,
        y: innerY,
        w: chairW,
        h: chairH,
      });
    } else if (side === "s") {
      poses.push({
        x: innerX + innerW * frac - chairW / 2,
        y: innerY + innerH - chairH,
        w: chairW,
        h: chairH,
      });
    } else if (side === "w") {
      poses.push({
        x: innerX,
        y: innerY + innerH * frac - chairW / 2,
        w: chairH,
        h: chairW,
      });
    } else {
      poses.push({
        x: innerX + innerW - chairH,
        y: innerY + innerH * frac - chairW / 2,
        w: chairH,
        h: chairW,
      });
    }
  };

  if (seats === 2) {
    place("w", 0, 1);
    place("e", 0, 1);
    return poses;
  }

  const sides: Array<"n" | "e" | "s" | "w"> = [];
  if (seats <= 4) sides.push("n", "e", "s", "w");
  else if (seats <= 6) sides.push("n", "n", "e", "s", "s", "w");
  else if (seats <= 8) sides.push("n", "n", "e", "e", "s", "s", "w", "w");
  else
    sides.push(
      "n",
      "n",
      "n",
      "e",
      "e",
      "e",
      "s",
      "s",
      "s",
      "w",
      "w",
      "w",
    );

  const use = sides.slice(0, seats);
  const counts = { n: 0, e: 0, s: 0, w: 0 };
  const seen = { n: 0, e: 0, s: 0, w: 0 };
  for (const s of use) counts[s]++;
  for (const side of use) {
    place(side, seen[side]++, counts[side]);
  }
  return poses;
}

export function tableSurfaceRect(t: FloorTable): {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
} {
  /** Leave a clear ring for chairs */
  const inset = Math.max(8, Math.min(t.width, t.height) * 0.28);
  const w = Math.max(12, t.width - inset * 2);
  const h = Math.max(12, t.height - inset * 2);
  return {
    x: t.x + (t.width - w) / 2,
    y: t.y + (t.height - h) / 2,
    w,
    h,
    rx: t.shape === "round" ? Math.min(w, h) / 2 : 3.5,
  };
}
