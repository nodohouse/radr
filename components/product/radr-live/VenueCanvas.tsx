"use client";

/**
 * RADR Live — WebGL-only primary surface.
 *
 * Rules:
 * - Never probe WebGL before the real R3F mount (context leak).
 * - Acquire ONE context ourselves and hand it to THREE (no double getContext).
 * - On failure: delayed diagnose + one delayed auto-retry (Strict Mode / slot recovery).
 * - Pretty SVG only with ?fallback=1.
 */

import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { LiveEntity } from "@/lib/radr/spatial-live/types";
import {
  VENUE_OVERVIEW_CAM,
  type VenueZoneKind,
} from "@/lib/radr/spatial-live/venueLayout";
import { VenueWorld } from "./venue/VenueWorld";
import { VenueFallback2D } from "./VenueFallback2D";
import {
  LiveRendererDiagnostics,
  type RendererDiag,
} from "./LiveRendererDiagnostics";
import { WebGLFailurePanel } from "./WebGLFailurePanel";

type Props = {
  locationId: string;
  zones: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHoverZone: (kind: VenueZoneKind | null) => void;
  simProgress?: number;
};

type GlAttrs = {
  antialias: boolean;
  alpha: boolean;
  depth: boolean;
  stencil: boolean;
  powerPreference: WebGLPowerPreference;
  failIfMajorPerformanceCaveat: boolean;
  preserveDrawingBuffer: boolean;
};

/** Module guard — Strict Mode must not create two live contexts at once. */
let liveGlMounts = 0;

function releaseProbe(gl: WebGLRenderingContext | WebGL2RenderingContext | null) {
  try {
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    /* ignore */
  }
}

function diagnoseWebGL(): {
  webgl2: boolean;
  webgl1: boolean;
  detail: string;
  gpu: string | null;
} {
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const attrs: WebGLContextAttributes = {
      failIfMajorPerformanceCaveat: false,
      powerPreference: "default",
      antialias: false,
    };
    const gl2 = c.getContext("webgl2", attrs);
    if (gl2) {
      let gpu: string | null = null;
      try {
        const info = gl2.getExtension("WEBGL_debug_renderer_info");
        if (info) {
          gpu = String(gl2.getParameter(info.UNMASKED_RENDERER_WEBGL));
        }
      } catch {
        /* ignore */
      }
      releaseProbe(gl2);
      return { webgl2: true, webgl1: true, detail: "post-fail WebGL2 OK", gpu };
    }
    const gl1 =
      c.getContext("webgl", attrs) ||
      (c.getContext("experimental-webgl", attrs) as WebGLRenderingContext | null);
    if (gl1) {
      releaseProbe(gl1);
      return {
        webgl2: false,
        webgl1: true,
        detail: "post-fail WebGL1 OK",
        gpu: null,
      };
    }
    return {
      webgl2: false,
      webgl1: false,
      detail:
        "Browser refused WebGL (hardware acceleration off, GPU blocked, or context limit)",
      gpu: null,
    };
  } catch (e) {
    return {
      webgl2: false,
      webgl1: false,
      detail: e instanceof Error ? e.message : "diagnose threw",
      gpu: null,
    };
  }
}

function acquireContext(
  canvas: HTMLCanvasElement,
  attrs: GlAttrs,
): { context: WebGLRenderingContext | WebGL2RenderingContext; kind: "webgl2" | "webgl1" } | null {
  const base: WebGLContextAttributes = {
    antialias: attrs.antialias,
    alpha: attrs.alpha,
    depth: attrs.depth,
    stencil: attrs.stencil,
    powerPreference: attrs.powerPreference,
    failIfMajorPerformanceCaveat: attrs.failIfMajorPerformanceCaveat,
    preserveDrawingBuffer: attrs.preserveDrawingBuffer,
  };
  const gl2 = canvas.getContext("webgl2", base);
  if (gl2) return { context: gl2, kind: "webgl2" };
  const gl1 =
    canvas.getContext("webgl", base) ||
    (canvas.getContext("experimental-webgl", base) as WebGLRenderingContext | null);
  if (gl1) return { context: gl1, kind: "webgl1" };
  return null;
}

function createLiveRenderer(defaultProps: {
  canvas: HTMLCanvasElement;
}): THREE.WebGLRenderer {
  const canvas = defaultProps.canvas;

  // One acquisition only — a null getContext poisons this canvas element.
  // Further attribute retries must happen via Canvas remount (new DOM node).
  const attrs: GlAttrs = {
    antialias: false,
    alpha: false,
    depth: true,
    stencil: false,
    powerPreference: "default",
    failIfMajorPerformanceCaveat: false,
    preserveDrawingBuffer: false,
  };

  const acquired = acquireContext(canvas, attrs);
  if (!acquired) {
    throw new Error("THREE.WebGLRenderer: Error creating WebGL context");
  }

  return new THREE.WebGLRenderer({
    canvas,
    context: acquired.context,
    antialias: attrs.antialias,
    alpha: attrs.alpha,
    depth: attrs.depth,
    stencil: attrs.stencil,
    powerPreference: attrs.powerPreference,
    failIfMajorPerformanceCaveat: false,
    preserveDrawingBuffer: false,
  });
}

class R3FErrorBridge extends Component<
  { children: ReactNode; onError: (msg: string) => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error.message || "R3F render error");
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function VenueCanvas(props: Props) {
  const [ready, setReady] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const fatalRef = useRef(false);
  const autoRetryRef = useRef(0);
  const mountedRef = useRef(false);
  const [diag, setDiag] = useState<RendererDiag>({
    webgl2: null,
    webgl1: null,
    renderer: "pending",
    gpu: null,
    canvas: null,
    scene: "pending",
    camera: "pending",
    detail: null,
  });

  const allowPrettyFallback = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("fallback");
  }, []);

  const forceDiag = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (process.env.NODE_ENV !== "production") return true;
    return new URLSearchParams(window.location.search).has("liveDebug");
  }, []);

  const bumpCanvas = useCallback((reason: string) => {
    fatalRef.current = false;
    setFatal(null);
    setDiag((d) => ({
      ...d,
      renderer: "pending",
      scene: "pending",
      camera: "pending",
      detail: reason,
    }));
    setReady(false);
    setCanvasKey((k) => k + 1);
  }, []);

  const fail = useCallback(
    (msg: string) => {
      if (fatalRef.current) return;

      // Recover once after a short delay — Strict Mode / context-slot churn.
      if (
        /Error creating WebGL context|contextlost|getContext returned null/i.test(
          msg,
        ) &&
        autoRetryRef.current < 2
      ) {
        autoRetryRef.current += 1;
        console.warn(
          `[radr:live] ${msg} — delayed auto-retry ${autoRetryRef.current}/2`,
        );
        window.setTimeout(() => {
          bumpCanvas(`auto-retry after ${msg}`);
        }, 350 * autoRetryRef.current);
        return;
      }

      fatalRef.current = true;
      console.error("[radr:live] WEBGL FAILURE:", msg);

      // Delay diagnose so lost contexts can free GPU slots first.
      window.setTimeout(() => {
        const probe = diagnoseWebGL();
        setFatal(msg);
        setDiag((d) => ({
          ...d,
          webgl2: probe.webgl2,
          webgl1: probe.webgl1,
          gpu: probe.gpu ?? d.gpu,
          renderer: "failed",
          scene: "failed",
          detail: `${msg} · ${probe.detail}`,
        }));
      }, 280);
    },
    [bumpCanvas],
  );

  // Wait for non-zero host size — do NOT touch WebGL here.
  useEffect(() => {
    fatalRef.current = false;
    let cancelled = false;
    let attempts = 0;

    const tryReady = () => {
      if (cancelled) return;
      const el = hostRef.current;
      const w = el?.clientWidth ?? 0;
      const h = el?.clientHeight ?? 0;
      if (w >= 2 && h >= 2) {
        setDiag((d) => ({
          ...d,
          canvas: { w: Math.round(w), h: Math.round(h) },
          detail: "host sized · mounting Canvas",
        }));
        setReady(true);
        return;
      }
      attempts += 1;
      if (attempts > 40) {
        fail(`Canvas host has zero size (${w}×${h})`);
        setReady(true);
        return;
      }
      requestAnimationFrame(tryReady);
    };

    setReady(false);
    const id = requestAnimationFrame(tryReady);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [canvasKey, fail]);

  useEffect(() => {
    const onErr = (event: ErrorEvent) => {
      const msg = String(event.message || event.error || "");
      if (
        /WebGL|WEBGL|create.*context|contextlost/i.test(msg) ||
        /THREE\.WebGLRenderer/i.test(msg)
      ) {
        fail(msg);
      }
    };
    const onRej = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message || event.reason || "");
      if (/WebGL|WEBGL|create.*context/i.test(msg)) fail(msg);
    };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, [fail]);

  const glFactory = useCallback((defaultProps: THREE.WebGLRendererParameters) => {
    const canvas = defaultProps.canvas;
    if (!(canvas instanceof HTMLCanvasElement)) {
      const err = new Error(
        "THREE.WebGLRenderer: Error creating WebGL context",
      );
      queueMicrotask(() => fail(`${err.message} (no HTML canvas)`));
      throw err;
    }
    if (liveGlMounts > 0 && !mountedRef.current) {
      const err = new Error(
        "THREE.WebGLRenderer: Error creating WebGL context",
      );
      queueMicrotask(() => fail(`${err.message} (mount busy)`));
      throw err;
    }
    try {
      liveGlMounts += 1;
      mountedRef.current = true;
      return createLiveRenderer({ canvas });
    } catch (e) {
      liveGlMounts = Math.max(0, liveGlMounts - 1);
      mountedRef.current = false;
      const msg =
        e instanceof Error
          ? e.message
          : "THREE.WebGLRenderer: Error creating WebGL context";
      queueMicrotask(() => fail(msg));
      throw e instanceof Error ? e : new Error(msg);
    }
  }, [fail]);

  const onCreated = useCallback(
    (state: {
      gl: THREE.WebGLRenderer;
      scene: THREE.Scene;
      camera: THREE.Camera;
      size: { width: number; height: number };
    }) => {
      const { gl, scene, camera, size } = state;
      gl.outputColorSpace = THREE.SRGBColorSpace;
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.12;
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
      gl.setClearColor("#161410", 1);

      const canvas = gl.domElement;
      const onLost = (ev: Event) => {
        ev.preventDefault();
        fail("webglcontextlost");
      };
      const onRestored = () => {
        autoRetryRef.current = 0;
        bumpCanvas("webglcontextrestored");
      };
      canvas.addEventListener("webglcontextlost", onLost, false);
      canvas.addEventListener("webglcontextrestored", onRestored, false);

      let gpu: string | null = null;
      let isWebgl2 = false;
      try {
        const ctx = gl.getContext();
        isWebgl2 = typeof (ctx as WebGL2RenderingContext).createVertexArray === "function";
        const info = ctx.getExtension("WEBGL_debug_renderer_info");
        if (info) {
          gpu = String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL));
        }
      } catch {
        /* ignore */
      }

      fatalRef.current = false;
      autoRetryRef.current = 0;
      setFatal(null);
      setDiag({
        webgl2: isWebgl2,
        webgl1: true,
        renderer: "initialized",
        gpu,
        canvas: { w: Math.round(size.width), h: Math.round(size.height) },
        scene: scene ? "mounted" : "missing",
        camera: camera ? "active" : "missing",
        detail: "WebGLRenderer created · explicit context handoff",
      });
    },
    [bumpCanvas, fail],
  );

  // Release mount counter when Canvas unmounts / key changes.
  useEffect(() => {
    return () => {
      if (mountedRef.current) {
        liveGlMounts = Math.max(0, liveGlMounts - 1);
        mountedRef.current = false;
      }
    };
  }, [canvasKey]);

  const retry = useCallback(() => {
    autoRetryRef.current = 0;
    liveGlMounts = 0;
    mountedRef.current = false;
    bumpCanvas("manual retry");
  }, [bumpCanvas]);

  if (fatal && !allowPrettyFallback) {
    return (
      <div className="rp-live3-canvas" ref={hostRef}>
        <WebGLFailurePanel diag={{ ...diag, detail: fatal }} onRetry={retry} />
      </div>
    );
  }

  if (fatal && allowPrettyFallback) {
    return (
      <div className="rp-live3-canvas" ref={hostRef}>
        <VenueFallback2D
          zones={props.zones}
          selectedId={props.selectedId}
          onSelect={props.onSelect}
          onHoverZone={props.onHoverZone}
          reduced
          reason={forceDiag ? fatal : undefined}
        />
        {forceDiag ? (
          <LiveRendererDiagnostics diag={{ ...diag, detail: fatal }} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="rp-live3-canvas" ref={hostRef} data-testid="radr-live-canvas">
      {ready ? (
        <Canvas
          key={canvasKey}
          shadows
          dpr={[1, 1.5]}
          gl={glFactory as never}
          camera={{
            position: VENUE_OVERVIEW_CAM.position,
            fov: VENUE_OVERVIEW_CAM.fov,
            near: 0.1,
            far: 120,
          }}
          onPointerMissed={() => props.onSelect("")}
          onCreated={onCreated}
        >
          <Suspense fallback={null}>
            <R3FErrorBridge onError={fail}>
              <VenueWorld
                locationId={props.locationId}
                zones={props.zones}
                selectedId={props.selectedId}
                onSelect={(id) => props.onSelect(id)}
                onHoverZone={props.onHoverZone}
                simProgress={props.simProgress ?? 0}
              />
            </R3FErrorBridge>
          </Suspense>
        </Canvas>
      ) : null}
      {forceDiag ? <LiveRendererDiagnostics diag={diag} /> : null}
    </div>
  );
}
