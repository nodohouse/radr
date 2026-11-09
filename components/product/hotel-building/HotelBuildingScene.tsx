"use client";

import { useEffect, useRef } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import { ACESFilmicToneMapping, Vector3 } from "three";
import type { OrbitControls as Controls } from "three-stdlib";
import {
  buildingFloors,
  type HotelBuildingSpec,
} from "@/lib/product/hotelBuilding";

type Props = {
  spec: HotelBuildingSpec;
  active: boolean;
  highlighted: number | null;
  entering: number | null;
  reduced: boolean;
  onHover: (floor: number | null) => void;
  onEnter: (floor: number) => void;
  onReady: () => void;
  onFailure: () => void;
};
function Architecture({ spec, highlighted, onHover, onEnter }: Props) {
  const floors = buildingFloors(spec);
  const width = Math.max(9, Math.min(18, (spec.rooms / spec.floors) * 0.42));
  const depth = width * 0.62;
  const height = spec.floors * 1.7 + 1.2;
  function hover(e: ThreeEvent<PointerEvent>, floor: number) {
    e.stopPropagation();
    onHover(floor);
  }
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#dce7ed" roughness={0.9} />
      </mesh>
      <RoundedBox
        args={[width + 6, 0.25, depth + 6]}
        position={[0, 0.12, 0]}
        radius={0.12}
        receiveShadow
      >
        <meshStandardMaterial color="#edf0ed" />
      </RoundedBox>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 1.2, depth]} />
        <meshStandardMaterial color="#e0dcd2" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.65, depth / 2 + 0.03]}>
        <boxGeometry args={[width * 0.43, 1.15, 0.06]} />
        <meshPhysicalMaterial
          color="#154c75"
          metalness={0.4}
          roughness={0.15}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 1.17, depth / 2 + 0.5]} castShadow>
        <boxGeometry args={[width * 0.56, 0.1, 1.2]} />
        <meshStandardMaterial
          color="#2c3e48"
          metalness={0.55}
          roughness={0.3}
        />
      </mesh>
      {floors.map((floor) => {
        const y = 1.2 + (floor.number - 1) * 1.7;
        const selected = highlighted === floor.number;
        const front = Math.min(12, Math.max(2, Math.ceil(floor.rooms * 0.65)));
        const side = Math.min(7, Math.max(1, Math.floor(floor.rooms * 0.35)));
        return (
          <group
            key={floor.number}
            onPointerOver={(e) => hover(e, floor.number)}
            onPointerOut={(e) => {
              e.stopPropagation();
              onHover(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (e.delta < 5) onEnter(floor.number);
            }}
          >
            <mesh position={[0, y + 0.84, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 1.6, depth]} />
              <meshStandardMaterial
                color={selected ? "#c3efe3" : "#f0ede6"}
                roughness={0.6}
              />
            </mesh>
            <mesh position={[0, y + 0.04, 0]} castShadow>
              <boxGeometry args={[width + 0.25, 0.13, depth + 0.25]} />
              <meshStandardMaterial
                color={selected ? "#00df9c" : "#bec9cc"}
                metalness={0.2}
                roughness={0.5}
              />
            </mesh>
            {Array.from({ length: front }, (_, i) => (
              <mesh
                key={`f${i}`}
                position={[
                  -width / 2 + ((i + 0.5) * width) / front,
                  y + 0.85,
                  depth / 2 + 0.025,
                ]}
              >
                <boxGeometry args={[(width / front) * 0.71, 1.08, 0.06]} />
                <meshPhysicalMaterial
                  color={
                    selected ? "#048b9f" : i % 4 === 1 ? "#426b87" : "#174475"
                  }
                  metalness={0.55}
                  roughness={0.18}
                  clearcoat={1}
                />
              </mesh>
            ))}
            {Array.from({ length: side }, (_, i) => (
              <mesh
                key={`s${i}`}
                position={[
                  width / 2 + 0.025,
                  y + 0.85,
                  -depth / 2 + ((i + 0.5) * depth) / side,
                ]}
              >
                <boxGeometry args={[0.06, 1.08, (depth / side) * 0.65]} />
                <meshPhysicalMaterial
                  color={selected ? "#079a9e" : "#255983"}
                  metalness={0.55}
                  roughness={0.22}
                  clearcoat={1}
                />
              </mesh>
            ))}
            <mesh position={[0, y + 0.85, -depth / 2 - 0.02]}>
              <boxGeometry args={[width * 0.92, 0.96, 0.04]} />
              <meshStandardMaterial
                color="#265176"
                metalness={0.35}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}
      <RoundedBox
        position={[0, height + 0.12, 0]}
        args={[width + 0.6, 0.25, depth + 0.6]}
        radius={0.06}
        castShadow
      >
        <meshStandardMaterial
          color="#b5c4c7"
          metalness={0.2}
          roughness={0.55}
        />
      </RoundedBox>
      <mesh position={[-width * 0.2, height + 0.55, -depth * 0.15]} castShadow>
        <boxGeometry args={[width * 0.35, 0.7, depth * 0.45]} />
        <meshStandardMaterial color="#e9e8e1" />
      </mesh>
      <mesh position={[width * 0.22, height + 0.3, -depth * 0.17]}>
        <boxGeometry args={[width * 0.3, 0.1, depth * 0.35]} />
        <meshStandardMaterial color="#1b455e" metalness={0.4} roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * (width / 2 + 1.3), 0.25, depth * 0.32]}
        >
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.9, 0.5, 2.6]} />
            <meshStandardMaterial color="#c8ccc3" />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.85, (i - 1) * 0.78]} castShadow>
              <sphereGeometry args={[0.6, 12, 8]} />
              <meshStandardMaterial color="#486a61" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
function CameraRig({ spec, active, entering, reduced, onReady }: Props) {
  const controls = useRef<Controls>(null);
  const { camera, size, invalidate } = useThree();
  const height = spec.floors * 1.7 + 1.2;
  const span = Math.max(height + 7, 23);
  const target = useRef(new Vector3());
  useEffect(() => {
    camera.position.set(span * 0.92, height * 0.65 + span * 0.32, span * 1.05);
    if ("isOrthographicCamera" in camera) {
      camera.zoom = Math.min(size.height / (span * 1.15), size.width / 30);
      camera.updateProjectionMatrix();
    }
    target.current.set(0, height * 0.45, 0);
    controls.current?.target.copy(target.current);
    controls.current?.update();
    invalidate();
    onReady();
  }, [camera, height, span, size.width, size.height, invalidate, onReady]);
  useFrame((_, delta) => {
    if (entering === null || !controls.current) return;
    target.current.set(0, 1.2 + (entering - 0.5) * 1.7, 1.5);
    controls.current.target.lerp(
      target.current,
      reduced ? 1 : 1 - Math.exp(-7 * delta),
    );
    camera.position.lerp(
      new Vector3(span * 0.42, target.current.y + 4, span * 0.63),
      reduced ? 1 : 1 - Math.exp(-5 * delta),
    );
    controls.current.update();
    invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      enabled={active && entering === null}
      enablePan
      enableDamping={false}
      minZoom={3}
      maxZoom={65}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI / 2.1}
      onChange={() => invalidate()}
    />
  );
}
export default function HotelBuildingScene(props: Props) {
  return (
    <Canvas
      orthographic
      shadows
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [28, 24, 32], zoom: 18, near: 0.1, far: 350 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        gl.domElement.addEventListener("webglcontextlost", props.onFailure, {
          once: true,
        });
      }}
    >
      <ambientLight intensity={1.35} />
      <hemisphereLight args={["#d6eeff", "#c6bfb1", 1.1]} />
      <directionalLight
        position={[22, 45, 28]}
        intensity={3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={45}
        shadow-camera-bottom={-30}
        shadow-camera-far={130}
        shadow-bias={-0.0003}
      />
      <directionalLight
        position={[-20, 15, -10]}
        color="#3c8dff"
        intensity={1.2}
      />
      <Architecture {...props} />
      <CameraRig {...props} />
    </Canvas>
  );
}
