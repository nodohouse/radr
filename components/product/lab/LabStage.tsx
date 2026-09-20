"use client";

/**
 * Cinematic stage — full-bleed room photography as the living background.
 * Service = warm dining; Recover = cooler ledger wash over paper world.
 */

import { VISUAL_ASSETS, objectPosition } from "@/data/demo/visualAssets";
import type { LabSeed } from "./labState";

const DINING = VISUAL_ASSETS.locations.berlinMitte;
const BAR = VISUAL_ASSETS.locations.berlinKitchen;
const TERRACE_SRC = "/demo/facilities/berlin-terrace.jpg";

type Props = {
  seed: LabSeed;
  zone?: "main" | "bar" | "terrace";
  commandOpen?: boolean;
};

export function LabStage({ seed, zone = "main", commandOpen }: Props) {
  const serviceAsset =
    zone === "bar"
      ? BAR
      : zone === "terrace"
        ? {
            src: TERRACE_SRC,
            alt: "Terrace at Berlin Mitte",
            focal: DINING.focal,
          }
        : DINING;

  return (
    <div
      className="lab-stage"
      data-seed={seed}
      data-zone={zone}
      data-command={commandOpen ? "true" : undefined}
      aria-hidden="true"
    >
      {seed === "service" ? (
        <>
          <div
            className="lab-stage-photo"
            style={{
              backgroundImage: `url(${serviceAsset.src})`,
              backgroundPosition: objectPosition(
                "focal" in serviceAsset ? serviceAsset.focal : DINING.focal,
                1440,
              ),
            }}
          />
          <div className="lab-stage-blur" />
          <div className="lab-stage-vignette" />
          <div className="lab-stage-heat" />
          <div className="lab-stage-shimmer" />
        </>
      ) : (
        <>
          <div className="lab-stage-ledger" />
          <div className="lab-stage-paper-grain" />
          <div className="lab-stage-vignette lab-stage-vignette-cool" />
        </>
      )}
      <div className="lab-stage-scrim" />
    </div>
  );
}
