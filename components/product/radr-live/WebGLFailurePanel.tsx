"use client";

import type { RendererDiag } from "./LiveRendererDiagnostics";

type Props = {
  diag: RendererDiag;
  onRetry: () => void;
};

/**
 * Hard failure panel — visual review is BLOCKED until WebGL works.
 * Do not replace this with a styled SVG venue during design review.
 */
export function WebGLFailurePanel({ diag, onRetry }: Props) {
  const bothDown = diag.webgl2 === false && diag.webgl1 === false;

  return (
    <div className="rp-live3-fail" role="alert">
      <p className="rp-live3-fail-kicker">RADR LIVE WEBGL FAILURE</p>
      <p className="rp-live3-fail-lead">
        The premium spatial renderer did not start. Do not review visuals until
        this is green.
      </p>
      <ul className="rp-live3-fail-list">
        <li>WebGL2: {yn(diag.webgl2)}</li>
        <li>WebGL1: {yn(diag.webgl1)}</li>
        <li>
          Canvas:{" "}
          {diag.canvas ? `${diag.canvas.w} × ${diag.canvas.h}` : "—"}
        </li>
        <li>Renderer: {diag.renderer}</li>
        <li>Scene: {diag.scene}</li>
        <li>Camera: {diag.camera}</li>
        <li>GPU: {diag.gpu ?? "—"}</li>
        <li className="rp-live3-fail-detail">
          Failure: {diag.detail ?? "unknown"}
        </li>
      </ul>
      <button type="button" className="rp-live3-fail-btn" onClick={onRetry}>
        Retry WebGL
      </button>
      {bothDown ? (
        <div className="rp-live3-fail-steps">
          <p>Your browser is refusing WebGL entirely. Fix in order:</p>
          <ol>
            <li>
              Enable <strong>Use hardware acceleration</strong> in browser
              settings, then fully quit and reopen the browser.
            </li>
            <li>
              Chrome/Edge: open <code>chrome://gpu</code> — WebGL / WebGL2 must
              not say “Software only” or “Unavailable”.
            </li>
            <li>
              Close other GPU-heavy tabs (Figma, Maps, other 3D demos) — browsers
              cap WebGL contexts.
            </li>
            <li>Try Chrome or Arc if you are on Safari with WebGL blocked.</li>
          </ol>
        </div>
      ) : (
        <p className="rp-live3-fail-hint">
          Tip: close other GPU-heavy tabs, then Retry. Emergency 2D only with{" "}
          <code>?fallback=1</code>.
        </p>
      )}
    </div>
  );
}

function yn(v: boolean | null) {
  if (v === null) return "probing";
  return v ? "available" : "unavailable";
}
