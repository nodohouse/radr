"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { LiveEntity } from "@/lib/radr/spatial-live/types";
import {
  VENUE_FLOOR,
  VENUE_ZONE_GEOMS,
  entityIdForZone,
  zoneKindFromEntity,
  type VenueZoneKind,
} from "@/lib/radr/spatial-live/venueLayout";
import { ZoneMesh } from "./ZoneMesh";
import { LiveCameraRig } from "./LiveCameraRig";

type Props = {
  locationId: string;
  zones: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHoverZone: (kind: VenueZoneKind | null) => void;
  /** 0–1 simulation progress (delivery throttle preview). */
  simProgress?: number;
};

function FlowParticle({
  a,
  b,
  lag,
  color,
  speed,
  bunch,
}: {
  a: [number, number, number];
  b: [number, number, number];
  lag: number;
  color: string;
  speed: number;
  bunch: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const slowed = speed * (1 - bunch * 0.55);
    const u = (clock.elapsedTime * slowed + lag) % 1;
    // Bunching: particles linger mid-path when pressure high.
    const eased = bunch > 0.2 ? Math.pow(u, 1 + bunch) : u;
    ref.current.position.set(
      THREE.MathUtils.lerp(a[0], b[0], eased),
      0.42 + Math.sin(eased * Math.PI) * 0.12,
      THREE.MathUtils.lerp(a[2], b[2], eased),
    );
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.05 + Math.sin(eased * Math.PI) * (0.22 + bunch * 0.12);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 10, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.65}
        transparent
        opacity={0.2}
        depthWrite={false}
      />
    </mesh>
  );
}

function AmbientDust() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 48;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.sin(i * 12.1) * 0.5 + 0.5) * 18 - 9;
      pos[i * 3 + 1] = 0.3 + (i % 7) * 0.18;
      pos[i * 3 + 2] = (Math.cos(i * 7.7) * 0.5 + 0.5) * 12 - 6;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.012;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#8a9a8e"
        size={0.035}
        transparent
        opacity={0.18}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export function VenueWorld({
  locationId,
  zones,
  selectedId,
  onSelect,
  onHoverZone,
  simProgress = 0,
}: Props) {
  const [hoverKind, setHoverKind] = useState<VenueZoneKind | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, LiveEntity>();
    for (const z of zones) m.set(z.id, z);
    return m;
  }, [zones]);

  const selectedKind = useMemo(() => {
    if (!selectedId) return null;
    const ent = byId.get(selectedId);
    return ent ? zoneKindFromEntity(ent) : null;
  }, [selectedId, byId]);

  const kitchenPressure = useMemo(() => {
    const k = byId.get(entityIdForZone(locationId, "zone_kitchen"));
    const raw = Number.parseFloat(String(k?.metrics[0]?.value ?? "91"));
    // Simulation calms kitchen load 91 → 83
    return THREE.MathUtils.lerp(raw / 100, 0.83, simProgress);
  }, [byId, locationId, simProgress]);

  const deliveryBunch = useMemo(() => {
    // Higher kitchen pressure → delivery flow bunches; sim reduces it.
    return THREE.MathUtils.clamp(kitchenPressure - 0.72, 0, 0.45) * (1 - simProgress);
  }, [kitchenPressure, simProgress]);

  const [fw, fh, fd] = VENUE_FLOOR.size;

  const handleHover = (kind: VenueZoneKind | null) => {
    setHoverKind(kind);
    onHoverZone(kind);
  };

  return (
    <>
      <color attach="background" args={["#161410"]} />
      <fog attach="fog" args={["#161410", 34, 62]} />

      {/* Architectural studio lighting — depth without UI */}
      <hemisphereLight args={["#f0e6d8", "#2a241c", 0.72]} />
      <ambientLight intensity={0.42} color="#e8dcc8" />
      <directionalLight
        castShadow
        position={[10, 15, 7]}
        intensity={2.05}
        color="#fff6e8"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-camera-far={55}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <directionalLight position={[-8, 6, -5]} intensity={0.55} color="#a8bdd4" />
      <pointLight position={[-4.2, 2.6, -2.8]} intensity={0.95} color="#ffb584" distance={12} />
      <pointLight position={[3.2, 2.2, -2.2]} intensity={0.5} color="#a8d4c4" distance={11} />
      <pointLight position={[-1.0, 2.0, 2.4]} intensity={0.42} color="#ffe8cc" distance={10} />
      {/* Soft status pool under kitchen when pressurized */}
      <pointLight
        position={[-4.35, 1.8, -3.15]}
        intensity={0.35 + kitchenPressure * 0.65}
        color="#c86b5c"
        distance={7}
        decay={2}
      />

      <LiveCameraRig focusKind={selectedKind} hoverKind={hoverKind} />

      {/* Warm ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.15, -0.48, -0.15]} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#141210" roughness={1} metalness={0} />
      </mesh>

      {/* Warm stone podium */}
      <mesh position={VENUE_FLOOR.position} receiveShadow castShadow>
        <boxGeometry args={[fw, fh, fd]} />
        <meshStandardMaterial color="#3a342c" roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[VENUE_FLOOR.position[0], 0.01, VENUE_FLOOR.position[2]]}
        receiveShadow
      >
        <planeGeometry args={[fw * 0.94, fd * 0.94]} />
        <meshStandardMaterial color="#4a433a" roughness={0.82} metalness={0.06} />
      </mesh>

      {/* Back wall / building shell */}
      <mesh position={[0.15, 1.35, -fd / 2 + 0.95]} castShadow receiveShadow>
        <boxGeometry args={[fw * 0.88, 2.55, 0.28]} />
        <meshStandardMaterial color="#3c362e" roughness={0.75} />
      </mesh>
      <mesh position={[-fw / 2 + 1.05, 1.4, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 2.65, fd * 0.72]} />
        <meshStandardMaterial color="#3c362e" roughness={0.75} />
      </mesh>

      {/* Circulation spine */}
      <mesh position={[-0.35, 0.07, -0.4]} receiveShadow>
        <boxGeometry args={[14.2, 0.06, 0.55]} />
        <meshStandardMaterial color="#524a40" roughness={0.5} metalness={0.12} />
      </mesh>

      {/* Pass / expo between kitchen and dining */}
      <mesh position={[-2.6, 0.55, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.95, 0.7]} />
        <meshStandardMaterial color="#4a4540" roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[-2.6, 1.1, -0.35]} castShadow>
        <boxGeometry args={[2.6, 0.08, 0.55]} />
        <meshStandardMaterial
          color="#c9a05a"
          emissive="#c9a05a"
          emissiveIntensity={0.15 + kitchenPressure * 0.35}
          roughness={0.4}
        />
      </mesh>

      {VENUE_ZONE_GEOMS.map((geom) => {
        const id = entityIdForZone(locationId, geom.entitySuffix);
        const entity = byId.get(id);
        if (!entity) return null;
        const dimmed = Boolean(selectedId && selectedId !== id);
        return (
          <ZoneMesh
            key={id}
            geom={geom}
            entity={entity}
            selected={selectedId === id}
            dimmed={dimmed}
            pressure={geom.kind === "kitchen" ? kitchenPressure : undefined}
            onHover={handleHover}
            onSelect={onSelect}
          />
        );
      })}

      {/* Operational flows */}
      <FlowParticle a={[-1.2, 0, 1.6]} b={[-4.0, 0, -2.2]} lag={0} color="#00d978" speed={0.2} bunch={deliveryBunch} />
      <FlowParticle a={[-1.2, 0, 1.6]} b={[-4.0, 0, -2.2]} lag={0.28} color="#00d978" speed={0.2} bunch={deliveryBunch} />
      <FlowParticle a={[-1.2, 0, 1.6]} b={[-4.0, 0, -2.2]} lag={0.55} color="#3dcf8e" speed={0.18} bunch={deliveryBunch} />
      <FlowParticle a={[-4.2, 0, -1.4]} b={[-6.4, 0, 2.2]} lag={0.08} color="#c9a05a" speed={0.22} bunch={deliveryBunch} />
      <FlowParticle a={[-4.2, 0, -1.4]} b={[-6.4, 0, 2.2]} lag={0.33} color="#c9a05a" speed={0.2} bunch={deliveryBunch} />
      <FlowParticle a={[-4.2, 0, -1.4]} b={[-6.4, 0, 2.2]} lag={0.58} color="#c86b5c" speed={0.24} bunch={deliveryBunch} />
      <FlowParticle a={[-4.2, 0, -1.4]} b={[-6.4, 0, 2.2]} lag={0.78} color="#c86b5c" speed={0.19} bunch={deliveryBunch} />
      {/* Kitchen → Pass → Dining return */}
      <FlowParticle a={[-4.0, 0, -2.0]} b={[-0.8, 0, 1.8]} lag={0.15} color="#7ec8a8" speed={0.16} bunch={deliveryBunch * 0.5} />
      <FlowParticle a={[-4.0, 0, -2.0]} b={[-0.8, 0, 1.8]} lag={0.62} color="#7ec8a8" speed={0.16} bunch={deliveryBunch * 0.5} />

      <AmbientDust />

      <ContactShadows
        position={[0.15, 0.02, -0.15]}
        opacity={0.48}
        scale={34}
        blur={2.6}
        far={18}
        color="#0a0908"
      />
    </>
  );
}
