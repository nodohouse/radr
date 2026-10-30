"use client";

import { Component, type ReactNode } from "react";
import type { LiveEntity } from "@/lib/radr/spatial-live/types";
import type { VenueZoneKind } from "@/lib/radr/spatial-live/venueLayout";
import { WebGLFailurePanel } from "./WebGLFailurePanel";

type Props = {
  children: ReactNode;
  zones: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHoverZone: (kind: VenueZoneKind | null) => void;
};

type State = { error: Error | null };

/**
 * Isolates canvas crashes. Shows HARD FAIL — never a pretty SVG during review.
 * Emergency SVG only via ?fallback=1 on VenueCanvas itself.
 */
export class LiveCanvasBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[radr:live-canvas]", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rp-live3-canvas">
          <WebGLFailurePanel
            diag={{
              webgl2: null,
              webgl1: null,
              renderer: "failed",
              gpu: null,
              canvas: null,
              scene: "failed",
              camera: "missing",
              detail: this.state.error.message,
            }}
            onRetry={() => this.setState({ error: null })}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
