"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { LiveEntity } from "@/lib/radr/spatial-live/types";
import {
  SEV_HEX,
  type VenueZoneGeom,
  type VenueZoneKind,
} from "@/lib/radr/spatial-live/venueLayout";

type Props = {
  geom: VenueZoneGeom;
  entity: LiveEntity;
  selected: boolean;
  dimmed: boolean;
  /** Kitchen load 0–1 for emissive accent scaling. */
  pressure?: number;
  onHover: (kind: VenueZoneKind | null) => void;
  onSelect: (id: string) => void;
};

const FLOOR_TINT: Record<VenueZoneKind, string> = {
  kitchen: "#3a4046",
  bar: "#4a3e32",
  main: "#453e34",
  terrace: "#4e4a42",
  delivery: "#3c403c",
};

const WALL_COLOR = "#4a433a";
const TIMBER = "#6b5644";
const STEEL = "#5a6268";

function Wall({
  position,
  args,
  opacity,
}: {
  position: [number, number, number];
  args: [number, number, number];
  opacity: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
        <meshStandardMaterial
        color={WALL_COLOR}
        roughness={0.72}
        metalness={0.05}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function GlassRail({
  position,
  args,
  opacity,
}: {
  position: [number, number, number];
  args: [number, number, number];
  opacity: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color="#9aada2"
        roughness={0.18}
        metalness={0.45}
        transparent
        opacity={Math.min(0.14, opacity * 0.14)}
        depthWrite={false}
      />
    </mesh>
  );
}

function DiningFurniture({ opacity }: { opacity: number }) {
  const tables: [number, number][] = [
    [-4.2, -1.6],
    [-1.6, -1.9],
    [1.0, -1.5],
    [3.4, -1.8],
    [-3.8, 1.4],
    [-0.8, 1.7],
    [2.2, 1.3],
    [4.4, 1.6],
  ];
  const chairOffsets: [number, number][] = [
    [0.72, 0],
    [-0.72, 0],
    [0, 0.72],
    [0, -0.72],
  ];
  return (
    <group>
      {tables.map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.38, 0]} castShadow>
            <cylinderGeometry args={[0.48, 0.48, 0.08, 20]} />
            <meshStandardMaterial
              color={TIMBER}
              roughness={0.42}
              metalness={0.06}
              transparent
              opacity={opacity}
            />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.1, 0.36, 10]} />
            <meshStandardMaterial
              color="#2a2f2c"
              roughness={0.7}
              transparent
              opacity={opacity}
            />
          </mesh>
          {chairOffsets.map(([cx, cz], ci) => (
            <mesh key={ci} position={[cx, 0.22, cz]} castShadow>
              <boxGeometry args={[0.28, 0.32, 0.28]} />
              <meshStandardMaterial
                color="#3a342e"
                roughness={0.6}
                transparent
                opacity={opacity}
              />
            </mesh>
          ))}
          {/* Soft occupancy marker */}
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial
              color="#00d978"
              emissive="#00d978"
              emissiveIntensity={0.35}
              transparent
              opacity={0.18 * opacity}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function KitchenFurniture({
  w,
  d,
  h,
  opacity,
}: {
  w: number;
  d: number;
  h: number;
  opacity: number;
}) {
  return (
    <group>
      {/* Hot line — stainless run */}
      <mesh position={[0, 0.52, d * 0.26]} castShadow>
        <boxGeometry args={[w * 0.82, 0.88, 0.78]} />
          <meshStandardMaterial
          color={STEEL}
          roughness={0.32}
          metalness={0.48}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Burner glow strip */}
      <mesh position={[0, 0.98, d * 0.26]}>
        <boxGeometry args={[w * 0.7, 0.04, 0.35]} />
        <meshStandardMaterial
          color="#c86b5c"
          emissive="#c86b5c"
          emissiveIntensity={0.35}
          transparent
          opacity={opacity * 0.7}
        />
      </mesh>
      {/* Pass shelf */}
      <mesh position={[0, 1.2, d * 0.18]} castShadow>
        <boxGeometry args={[w * 0.82, 0.07, 0.62]} />
        <meshStandardMaterial
          color="#524c46"
          roughness={0.3}
          metalness={0.45}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Exhaust hood */}
      <mesh position={[-w * 0.08, h * 0.78, -d * 0.05]} castShadow>
        <boxGeometry args={[w * 0.5, 0.55, d * 0.42]} />
        <meshStandardMaterial
          color="#2e3431"
          roughness={0.5}
          metalness={0.22}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh position={[-w * 0.08, h * 0.55, -d * 0.05]} castShadow>
        <boxGeometry args={[w * 0.46, 0.12, d * 0.38]} />
        <meshStandardMaterial
          color="#3a403c"
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Prep island */}
      <mesh position={[w * 0.2, 0.4, -d * 0.2]} castShadow>
        <boxGeometry args={[w * 0.34, 0.68, d * 0.3]} />
        <meshStandardMaterial
          color="#333936"
          roughness={0.55}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Cold station */}
      <mesh position={[-w * 0.28, 0.36, -d * 0.24]} castShadow>
        <boxGeometry args={[w * 0.24, 0.58, d * 0.24]} />
        <meshStandardMaterial
          color="#2c363a"
          roughness={0.3}
          metalness={0.3}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Ticket rail */}
      <mesh position={[0, 1.55, d * 0.32]} castShadow>
        <boxGeometry args={[w * 0.55, 0.05, 0.08]} />
        <meshStandardMaterial
          color="#5a534c"
          roughness={0.4}
          metalness={0.35}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

function BarFurniture({
  w,
  d,
  opacity,
}: {
  w: number;
  d: number;
  opacity: number;
}) {
  return (
    <group>
      <mesh position={[0, 0.72, d * 0.12]} castShadow>
        <boxGeometry args={[w * 0.72, 0.85, 1.05]} />
        <meshStandardMaterial
          color="#3d342c"
          roughness={0.38}
          metalness={0.12}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0, 1.18, d * 0.12]} castShadow>
        <boxGeometry args={[w * 0.74, 0.06, 1.1]} />
        <meshStandardMaterial
          color="#4a4036"
          roughness={0.28}
          metalness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Back bar */}
      <mesh position={[0, 1.05, -d * 0.28]} castShadow>
        <boxGeometry args={[w * 0.68, 1.5, 0.35]} />
        <meshStandardMaterial
          color="#2a2825"
          roughness={0.55}
          transparent
          opacity={opacity}
        />
      </mesh>
      {[-1.4, -0.45, 0.5, 1.4].map((sx, i) => (
        <mesh key={i} position={[sx, 0.42, d * 0.38]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.55, 12]} />
          <meshStandardMaterial
            color="#2f2c28"
            roughness={0.5}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function TerraceFurniture({
  w,
  d,
  opacity,
}: {
  w: number;
  d: number;
  opacity: number;
}) {
  const seats: [number, number][] = [
    [-1.4, -1.5],
    [0.2, -1.7],
    [1.5, -1.3],
    [-1.2, 1.2],
    [0.4, 1.5],
    [1.6, 1.1],
  ];
  return (
    <group>
      {seats.map(([tx, tz], i) => (
        <mesh key={i} position={[tx, 0.28, tz]} castShadow>
          <boxGeometry args={[0.85, 0.12, 0.85]} />
          <meshStandardMaterial
            color="#3a403b"
            roughness={0.65}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
      {/* Deck planks cue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[w * 0.92, d * 0.92]} />
        <meshStandardMaterial
          color="#343b36"
          roughness={0.92}
          transparent
          opacity={opacity * 0.9}
        />
      </mesh>
    </group>
  );
}

function DeliveryFurniture({
  w,
  d,
  opacity,
}: {
  w: number;
  d: number;
  opacity: number;
}) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[w * 0.55, 0.95, d * 0.45]} />
        <meshStandardMaterial
          color="#323734"
          roughness={0.55}
          metalness={0.15}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0, 0.22, d * 0.28]} castShadow>
        <boxGeometry args={[w * 0.7, 0.18, d * 0.22]} />
        <meshStandardMaterial
          color="#2a302c"
          roughness={0.7}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

export function ZoneMesh({
  geom,
  entity,
  selected,
  dimmed,
  pressure,
  onHover,
  onSelect,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Mesh>(null);
  const edge = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(1);
  const sev = SEV_HEX[entity.severity];
  const [w, h, d] = geom.size;
  const wallH = geom.kind === "terrace" ? 0.85 : Math.min(h, 2.2);
  const opacity = dimmed ? 0.55 : 1;
  const elevRef = useRef(0);

  useFrame((_, dt) => {
    if (!group.current) return;
    const target = hovered || selected ? 1.018 : 1;
    scaleRef.current = THREE.MathUtils.damp(scaleRef.current, target, 16, dt);
    group.current.scale.setScalar(scaleRef.current);
    const elevTarget = hovered || selected ? 0.08 : 0;
    elevRef.current = THREE.MathUtils.damp(elevRef.current, elevTarget, 12, dt);
    group.current.position.y = elevRef.current;

    if (marker.current) {
      const mat = marker.current.material as THREE.MeshStandardMaterial;
      const pulse =
        entity.severity === "healthy"
          ? 0.22
          : 0.28 + (Math.sin(performance.now() * 0.002) + 1) * 0.14;
      const pressureBoost = pressure ? pressure * 0.35 : 0;
      mat.emissiveIntensity =
        ((selected ? 0.95 : hovered ? 0.6 : pulse) + pressureBoost) *
        (dimmed ? 0.28 : 1);
    }
    if (edge.current) {
      const mat = edge.current.material as THREE.MeshStandardMaterial;
      const want = selected ? 0.22 : hovered ? 0.12 : 0.04;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, want, 10, dt);
      mat.emissiveIntensity = selected ? 0.35 : hovered ? 0.18 : 0.06;
    }
  });

  const primary = entity.metrics[0];
  const metricLine =
    geom.kind === "kitchen"
      ? `${primary?.value ?? "91%"} load`
      : geom.kind === "main" || geom.kind === "bar" || geom.kind === "terrace"
        ? `${primary?.value ?? ""} occupied`.trim()
        : primary?.value ?? entity.status;

  const wt = 0.14;
  const walls = geom.walls;

  return (
    <group
      ref={group}
      position={geom.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(geom.kind);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(entity.id);
      }}
    >
      {/* Invisible hit volume — reliable select across furniture */}
      <mesh position={[0, wallH * 0.45, 0]} visible={false}>
        <boxGeometry args={[w * 0.96, wallH * 0.95, d * 0.96]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Zone floor inlay */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        receiveShadow
      >
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          color={FLOOR_TINT[geom.kind]}
          roughness={0.88}
          metalness={0.04}
          transparent
          opacity={dimmed ? 0.22 : 0.95}
        />
      </mesh>

      {/* Architectural walls / rails */}
      {walls.n ? (
        geom.kind === "terrace" ? (
          <GlassRail
            position={[0, wallH * 0.55, -d / 2 + wt / 2]}
            args={[w, wallH, wt]}
            opacity={opacity}
          />
        ) : (
          <Wall
            position={[0, wallH / 2, -d / 2 + wt / 2]}
            args={[w, wallH, wt]}
            opacity={opacity}
          />
        )
      ) : null}
      {walls.s ? (
        geom.kind === "terrace" ? (
          <GlassRail
            position={[0, wallH * 0.55, d / 2 - wt / 2]}
            args={[w, wallH, wt]}
            opacity={opacity}
          />
        ) : (
          <Wall
            position={[0, wallH / 2, d / 2 - wt / 2]}
            args={[w * 0.92, wallH * 0.75, wt]}
            opacity={opacity}
          />
        )
      ) : null}
      {walls.e ? (
        geom.kind === "terrace" ? (
          <GlassRail
            position={[w / 2 - wt / 2, wallH * 0.55, 0]}
            args={[wt, wallH, d]}
            opacity={opacity}
          />
        ) : (
          <Wall
            position={[w / 2 - wt / 2, wallH / 2, 0]}
            args={[wt, wallH, d]}
            opacity={opacity}
          />
        )
      ) : null}
      {walls.w ? (
        <Wall
          position={[-w / 2 + wt / 2, wallH / 2, 0]}
          args={[wt, wallH, d]}
          opacity={opacity}
        />
      ) : null}

      {/* Partial ceiling slab for enclosed service volumes */}
      {(geom.kind === "kitchen" || geom.kind === "bar") && (
        <mesh position={[0, wallH + 0.06, -d * 0.08]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.92, 0.12, d * 0.72]} />
          <meshStandardMaterial
            color="#242a26"
            roughness={0.82}
            transparent
            opacity={opacity}
          />
        </mesh>
      )}

      {/* Corner columns */}
      {(
        [
          [-w / 2 + 0.12, -d / 2 + 0.12],
          [w / 2 - 0.12, -d / 2 + 0.12],
          [-w / 2 + 0.12, d / 2 - 0.12],
          [w / 2 - 0.12, d / 2 - 0.12],
        ] as [number, number][]
      ).map(([cx, cz], i) => (
        <mesh key={i} position={[cx, wallH * 0.45, cz]} castShadow>
          <boxGeometry args={[0.16, wallH * 0.9, 0.16]} />
          <meshStandardMaterial
            color="#313834"
            roughness={0.65}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}

      {geom.kind === "main" ? <DiningFurniture opacity={opacity} /> : null}
      {geom.kind === "kitchen" ? (
        <KitchenFurniture w={w} d={d} h={h} opacity={opacity} />
      ) : null}
      {geom.kind === "bar" ? <BarFurniture w={w} d={d} opacity={opacity} /> : null}
      {geom.kind === "terrace" ? (
        <TerraceFurniture w={w} d={d} opacity={opacity} />
      ) : null}
      {geom.kind === "delivery" ? (
        <DeliveryFurniture w={w} d={d} opacity={opacity} />
      ) : null}

      {/* Status marker — restrained, not neon building paint */}
      <mesh ref={marker} position={[w * 0.38, 0.55, -d * 0.38]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.42, 12]} />
        <meshStandardMaterial
          color={sev}
          emissive={sev}
          emissiveIntensity={0.55}
          roughness={0.45}
          metalness={0.05}
          transparent
          opacity={dimmed ? 0.15 : 0.95}
        />
      </mesh>

      {/* Soft emissive edge — selection language, not thick diamond border */}
      <mesh
        ref={edge}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.035, 0]}
      >
        <ringGeometry args={[Math.min(w, d) * 0.42, Math.min(w, d) * 0.48, 48]} />
        <meshStandardMaterial
          color={sev}
          emissive={sev}
          emissiveIntensity={0.12}
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>

      {selected ? (
        <pointLight
          position={[0, wallH + 0.55, 0]}
          intensity={0.9}
          color={sev}
          distance={7.5}
          decay={2}
        />
      ) : null}

      {(hovered || selected) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <planeGeometry args={[w + 0.15, d + 0.15]} />
          <meshStandardMaterial
            color={sev}
            emissive={sev}
            emissiveIntensity={selected ? 0.16 : 0.08}
            transparent
            opacity={selected ? 0.11 : 0.06}
            depthWrite={false}
          />
        </mesh>
      )}

      <Html
        position={[0, wallH + 0.65, 0]}
        center
        distanceFactor={18}
        style={{ pointerEvents: "none" }}
        zIndexRange={[20, 0]}
      >
        <div
          className="rp-live3-label"
          data-active={selected ? "true" : undefined}
          data-strong={hovered || selected ? "true" : undefined}
          data-dim={dimmed && !hovered ? "true" : undefined}
        >
          <strong>{entity.label}</strong>
          <span>{metricLine}</span>
          {(hovered || selected) && (
            <em data-sev={entity.severity}>
              {entity.severity === "intervene" || entity.severity === "critical"
                ? "● High pressure"
                : entity.severity === "watch"
                  ? "● Watch"
                  : "● Healthy"}
            </em>
          )}
        </div>
      </Html>
    </group>
  );
}
