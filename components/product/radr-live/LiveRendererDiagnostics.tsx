"use client";

export type RendererDiag = {
  webgl2: boolean | null;
  webgl1: boolean | null;
  renderer: "pending" | "initialized" | "failed";
  gpu: string | null;
  canvas: { w: number; h: number } | null;
  scene: "pending" | "mounted" | "missing" | "failed";
  camera: "pending" | "active" | "missing";
  detail: string | null;
};

/** Dev / ?liveDebug=1 only — never a product chrome element. */
export function LiveRendererDiagnostics({ diag }: { diag: RendererDiag }) {
  return (
    <aside className="rp-live3-diag" aria-label="RADR Live renderer diagnostics">
      <p className="rp-live3-diag-title">RADR LIVE RENDERER</p>
      <ul>
        <li>WebGL2: {fmt(diag.webgl2)}</li>
        <li>WebGL1: {fmt(diag.webgl1)}</li>
        <li>Renderer: {diag.renderer}</li>
        <li>GPU: {diag.gpu ?? "—"}</li>
        <li>
          Canvas:{" "}
          {diag.canvas ? `${diag.canvas.w} × ${diag.canvas.h}` : "—"}
        </li>
        <li>Scene: {diag.scene}</li>
        <li>Camera: {diag.camera}</li>
        {diag.detail ? <li className="rp-live3-diag-detail">{diag.detail}</li> : null}
      </ul>
    </aside>
  );
}

function fmt(v: boolean | null) {
  if (v === null) return "probing";
  return v ? "available" : "unavailable";
}
