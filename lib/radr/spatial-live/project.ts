/**
 * Perspective projection for Canvas 2D spatial Live.
 * Same world coords as venueLayout — no WebGL / Three.js.
 */

export type Vec3 = { x: number; y: number; z: number };

export type CamState = {
  position: Vec3;
  target: Vec3;
  fov: number;
};

export function v3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpV(a: Vec3, b: Vec3, t: number): Vec3 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) };
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Build camera basis from position → target (Y-up). */
function camBasis(cam: CamState) {
  const fx = cam.target.x - cam.position.x;
  const fy = cam.target.y - cam.position.y;
  const fz = cam.target.z - cam.position.z;
  const fl = Math.hypot(fx, fy, fz) || 1;
  const forward = { x: fx / fl, y: fy / fl, z: fz / fl };
  // right = forward × up
  const up = { x: 0, y: 1, z: 0 };
  let rx = forward.y * up.z - forward.z * up.y;
  let ry = forward.z * up.x - forward.x * up.z;
  let rz = forward.x * up.y - forward.y * up.x;
  const rl = Math.hypot(rx, ry, rz) || 1;
  rx /= rl;
  ry /= rl;
  rz /= rl;
  // true up = right × forward
  const ux = ry * forward.z - rz * forward.y;
  const uy = rz * forward.x - rx * forward.z;
  const uz = rx * forward.y - ry * forward.x;
  return { forward, right: { x: rx, y: ry, z: rz }, up: { x: ux, y: uy, z: uz } };
}

export type ScreenPt = { x: number; y: number; depth: number; visible: boolean };

/**
 * Project world point to canvas pixels.
 * depth ≈ camera-space -z (larger = farther).
 */
export function project(
  p: Vec3,
  cam: CamState,
  width: number,
  height: number,
): ScreenPt {
  const { forward, right, up } = camBasis(cam);
  const dx = p.x - cam.position.x;
  const dy = p.y - cam.position.y;
  const dz = p.z - cam.position.z;
  const cx = dx * right.x + dy * right.y + dz * right.z;
  const cy = dx * up.x + dy * up.y + dz * up.z;
  const cz = dx * forward.x + dy * forward.y + dz * forward.z;
  if (cz <= 0.15) {
    return { x: 0, y: 0, depth: cz, visible: false };
  }
  const fovRad = (cam.fov * Math.PI) / 180;
  const f = 0.5 * height / Math.tan(fovRad * 0.5);
  const aspect = width / Math.max(1, height);
  const sx = width * 0.5 + (cx * f) / cz;
  const sy = height * 0.5 - (cy * f) / cz;
  // aspect-correct horizontal
  const sxAdj = width * 0.5 + ((sx - width * 0.5) / aspect) * Math.min(aspect, 1.35);
  return { x: sxAdj, y: sy, depth: cz, visible: true };
}

export function boxCorners(
  cx: number,
  cy: number,
  cz: number,
  w: number,
  h: number,
  d: number,
): Vec3[] {
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;
  return [
    v3(cx - hw, cy - hh, cz - hd),
    v3(cx + hw, cy - hh, cz - hd),
    v3(cx + hw, cy - hh, cz + hd),
    v3(cx - hw, cy - hh, cz + hd),
    v3(cx - hw, cy + hh, cz - hd),
    v3(cx + hw, cy + hh, cz - hd),
    v3(cx + hw, cy + hh, cz + hd),
    v3(cx - hw, cy + hh, cz + hd),
  ];
}

/** Face indices into boxCorners (quads). */
export const BOX_FACES: number[][] = [
  [0, 1, 2, 3], // bottom
  [4, 5, 6, 7], // top
  [0, 1, 5, 4], // -z
  [3, 2, 6, 7], // +z
  [0, 3, 7, 4], // -x
  [1, 2, 6, 5], // +x
];
