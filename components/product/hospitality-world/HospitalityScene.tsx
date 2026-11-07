"use client";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  Canvas,
  useLoader,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  OrthographicCamera,
  PCFSoftShadowMap,
  PMREMGenerator,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { OrbitControls as Controls } from "three-stdlib";
import { EntityMarker } from "./HospitalityWorld";
import {
  toneColor,
  type HospitalityWorldProps,
  type SpatialCamera,
  type SpatialEntity,
} from "./types";

type Props = HospitalityWorldProps & {
  bridge: MutableRefObject<SpatialCamera | null>;
  onHover: (id: string | null) => void;
  onCamera: (state: string) => void;
};
type V3 = [number, number, number];
function Box({
  at,
  size,
  color,
  radius = 0,
  rotation,
  metal = 0,
}: {
  at: V3;
  size: V3;
  color: string;
  radius?: number;
  rotation?: V3;
  metal?: number;
}) {
  const material = (
    <meshStandardMaterial
      color={color}
      roughness={metal ? 0.28 : 0.65}
      metalness={metal}
    />
  );
  return radius ? (
    <RoundedBox
      args={size}
      position={at}
      rotation={rotation}
      radius={Math.max(
        0.001,
        Math.min(radius, ...size.map((n) => n / 2 - 0.001)),
      )}
      bevelSegments={2}
      smoothness={2}
      castShadow
      receiveShadow
    >
      {material}
    </RoundedBox>
  ) : (
    <mesh position={at} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      {material}
    </mesh>
  );
}
function Plant({ at, scale = 1 }: { at: V3; scale?: number }) {
  return (
    <group position={at} scale={scale}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.25, 0.6, 16]} />
        <meshStandardMaterial color="#d8d0bc" roughness={0.85} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 2.4) * 0.19,
            0.8 + (i % 2) * 0.2,
            Math.cos(i * 2.4) * 0.19,
          ]}
          rotation={[0.25 + i * 0.13, 0, i * 0.8]}
          castShadow
        >
          <sphereGeometry args={[0.3, 10, 8]} />
          <meshStandardMaterial
            color={i % 2 ? "#48674e" : "#638361"}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
function Chair({ at, angle = 0 }: { at: V3; angle?: number }) {
  return (
    <group position={at} rotation={[0, angle, 0]}>
      <Box
        at={[0, 0.53, 0]}
        size={[0.55, 0.14, 0.55]}
        color="#294d4d"
        radius={0.08}
      />
      <Box
        at={[0, 0.84, 0.24]}
        size={[0.58, 0.55, 0.12]}
        color="#294d4d"
        radius={0.055}
      />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Box
            key={`${x}-${z}`}
            at={[x * 0.2, 0.25, z * 0.2]}
            size={[0.05, 0.5, 0.05]}
            color="#453c32"
          />
        )),
      )}
    </group>
  );
}
function PlaceSetting({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 1.01, z]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[0.19, 0.18, 0.025, 24]} />
        <meshStandardMaterial color="#faf8ee" roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.018, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.012, 24]} />
        <meshStandardMaterial color="#ede9df" roughness={0.22} />
      </mesh>
      <Box
        at={[0.27, 0, 0]}
        size={[0.025, 0.02, 0.28]}
        color="#b8b6aa"
        metal={0.8}
      />
      <Box
        at={[-0.27, 0, 0]}
        size={[0.025, 0.02, 0.28]}
        color="#b8b6aa"
        metal={0.8}
      />
      <mesh position={[0.25, 0.11, -0.24]}>
        <cylinderGeometry args={[0.065, 0.045, 0.2, 12]} />
        <meshPhysicalMaterial
          color="#d9f0ed"
          roughness={0.05}
          metalness={0.05}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
function DiningTable({ entity: e }: { entity: SpatialEntity }) {
  const round = (e.seats || 4) <= 2;
  const w = e.width,
    d = e.depth;
  return (
    <>
      {round ? (
        <>
          <mesh position={[0, 0.94, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.78, 0.78, 0.12, 48]} />
            <meshStandardMaterial color="#c3aa85" roughness={0.32} />
          </mesh>
          <mesh position={[0, 0.44, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.17, 0.88, 16]} />
            <meshStandardMaterial
              color="#665947"
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.36, 0.4, 0.08, 24]} />
            <meshStandardMaterial color="#645b4d" metalness={0.4} />
          </mesh>
        </>
      ) : (
        <>
          <Box
            at={[0, 0.94, 0]}
            size={[w, 0.12, d]}
            color="#b79b77"
            radius={0.065}
          />
          {[-1, 1].map((side) => (
            <Box
              key={side}
              at={[side * w * 0.32, 0.44, 0]}
              size={[0.12, 0.88, d * 0.7]}
              color="#706450"
              radius={0.025}
            />
          ))}
        </>
      )}
      <Chair at={[-(round ? 0.95 : w / 2 + 0.38), 0, 0]} angle={Math.PI / 2} />
      <Chair at={[round ? 0.95 : w / 2 + 0.38, 0, 0]} angle={-Math.PI / 2} />
      {!round ? (
        <>
          <Chair at={[0, 0, -d / 2 - 0.38]} />
          <Chair at={[0, 0, d / 2 + 0.38]} angle={Math.PI} />
        </>
      ) : null}
      {(e.seats || 4) >= 6 ? (
        <>
          <Chair at={[-w * 0.32, 0, d / 2 + 0.38]} angle={Math.PI} />
          <Chair at={[w * 0.32, 0, -d / 2 - 0.38]} />
        </>
      ) : null}
      <PlaceSetting x={round ? -0.38 : -w * 0.3} z={0} />
      <PlaceSetting x={round ? 0.38 : w * 0.3} z={0} />
      <mesh position={[0, 1.09, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.11, 0.18, 12]} />
        <meshStandardMaterial color="#a29a76" metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#66815a" />
      </mesh>
    </>
  );
}
function HotelRoom({ entity: e }: { entity: SpatialEntity }) {
  const w = e.width,
    d = e.depth;
  const bedW = Math.min(1.5, w * 0.65),
    bedD = Math.min(2, d * 0.64);
  return (
    <>
      <Box at={[0, 0.05, 0]} size={[w - 0.08, 0.1, d - 0.08]} color="#e5dbca" />
      <Box at={[-w / 2, 0.52, 0]} size={[0.075, 1.04, d]} color="#ece9e0" />
      <Box at={[0, 0.6, -d / 2]} size={[w, 1.2, 0.08]} color="#ded9cc" />
      <Box
        at={[0, 0.54, -d / 2 + 0.1]}
        size={[bedW + 0.3, 1.05, 0.12]}
        color="#607b82"
        radius={0.035}
      />
      <Box
        at={[0, 0.3, -d / 2 + bedD / 2 + 0.25]}
        size={[bedW, 0.4, bedD]}
        color="#a49b88"
        radius={0.06}
      />
      <Box
        at={[0, 0.56, -d / 2 + bedD / 2 + 0.25]}
        size={[bedW, 0.2, bedD]}
        color="#f9f8f2"
        radius={0.08}
      />
      <Box
        at={[0, 0.68, -d / 2 + bedD * 0.76]}
        size={[bedW + 0.02, 0.055, 0.42]}
        color="#97b4b3"
        radius={0.025}
      />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          at={[side * bedW * 0.25, 0.71, -d / 2 + 0.54]}
          size={[bedW * 0.4, 0.12, 0.36]}
          color="#fffdf7"
          radius={0.05}
        />
      ))}
      <Box
        at={[w * 0.35, 0.32, -d * 0.28]}
        size={[0.34, 0.52, 0.38]}
        color="#a38e70"
        radius={0.025}
      />
      <mesh position={[w * 0.35, 0.79, -d * 0.28]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 0.27, 12]} />
        <meshStandardMaterial
          color="#fff3d8"
          emissive="#edc581"
          emissiveIntensity={0.12}
        />
      </mesh>
      <Box
        at={[0, 0.12, d * 0.32]}
        size={[Math.min(w * 0.8, 2), 0.03, d * 0.23]}
        color="#c5d4cf"
        radius={0.015}
      />
      <Box
        at={[-w * 0.32, 0.43, d * 0.29]}
        size={[w * 0.23, 0.7, 0.62]}
        color="#aab7ac"
        radius={0.08}
      />
      <Box
        at={[w * 0.25, 0.45, d * 0.32]}
        size={[w * 0.34, 0.07, 0.4]}
        color="#b4a186"
        radius={0.025}
      />
      <Box
        at={[w * 0.25, 0.22, d * 0.32]}
        size={[0.06, 0.44, 0.06]}
        color="#6e695e"
      />
    </>
  );
}
function RestaurantArchitecture({
  width: w,
  depth: d,
}: {
  width: number;
  depth: number;
}) {
  return (
    <>
      <Box at={[0, 0.45, -d / 2]} size={[w, 0.9, 0.22]} color="#d9d1bd" />
      <Box at={[-w / 2, 0.7, 0]} size={[0.22, 1.4, d]} color="#e6e0d2" />
      {[-0.38, -0.12, 0.14, 0.4].map((x, i) => (
        <group key={x}>
          <Box
            at={[x * w, 1.75, -d / 2]}
            size={[0.08, 2.6, 0.12]}
            color="#7d877e"
          />
          <mesh position={[x * w - w * 0.1, 1.8, -d / 2 - 0.015]}>
            <boxGeometry args={[w * 0.19, 1.8, 0.04]} />
            <meshPhysicalMaterial
              color="#b9d1ca"
              roughness={0.1}
              metalness={0.1}
              transparent
              opacity={0.22}
            />
          </mesh>
          {i < 3 ? (
            <Box
              at={[x * w, 2.5, -d / 2]}
              size={[w * 0.26, 0.07, 0.14]}
              color="#7d877e"
            />
          ) : null}
        </group>
      ))}
      <Box
        at={[w * 0.32, 0.63, -d * 0.37]}
        size={[w * 0.24, 1.26, 1.15]}
        color="#d2c4a8"
        radius={0.05}
      />
      <Box
        at={[w * 0.32, 1.3, -d * 0.37]}
        size={[w * 0.25, 0.1, 1.25]}
        color="#e9e3d6"
        radius={0.035}
      />
      {Array.from({ length: 9 }, (_, i) => (
        <Box
          key={i}
          at={[w * 0.21 + i * 0.29, 0.64, -d * 0.37 + 0.59]}
          size={[0.045, 1.15, 0.04]}
          color="#a28b69"
        />
      ))}
      {[-1, 0, 1].map((i) => (
        <group key={i}>
          <mesh position={[w * 0.32 + i * 1.2, 2.8, -d * 0.37]}>
            <cylinderGeometry args={[0.3, 0.55, 0.28, 24]} />
            <meshStandardMaterial
              color="#bda27c"
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[w * 0.32 + i * 1.2, 3.35, -d * 0.37]}>
            <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
            <meshStandardMaterial color="#4b514b" />
          </mesh>
        </group>
      ))}
      {[
        [-w / 2 + 0.8, 0, -d / 2 + 0.9],
        [-w / 2 + 0.8, 0, d / 2 - 0.8],
        [w / 2 - 0.8, 0, -d / 2 + 0.8],
      ].map((p, i) => (
        <Plant key={i} at={p as V3} scale={1.25} />
      ))}
      <Box
        at={[-w * 0.37, 0.42, -d * 0.31]}
        size={[1.3, 0.8, 3.2]}
        color="#748b7c"
        radius={0.12}
      />
    </>
  );
}
function ModelEntity({
  entity,
  kind,
  selected,
  onSelect,
  onHover,
}: {
  entity: SpatialEntity;
  kind: Props["kind"];
  selected: boolean;
  onSelect: () => void;
  onHover: (value: boolean) => void;
}) {
  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta <= 5) onSelect();
  };
  return (
    <group
      position={[entity.x, 0, entity.z]}
      onClick={click}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
    >
      {kind === "restaurant" ? (
        <DiningTable entity={entity} />
      ) : (
        <HotelRoom entity={entity} />
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry
          args={
            kind === "restaurant"
              ? [
                  Math.max(entity.width, entity.depth) * 0.7,
                  Math.max(entity.width, entity.depth) * 0.7 + 0.045,
                  48,
                ]
              : [0.2, 0.25, 24]
          }
        />
        <meshBasicMaterial
          color={selected ? "#00c989" : toneColor(entity.tone)}
          transparent
          opacity={selected ? 0.95 : 0.3}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
function EntityLabels(props: Props) {
  const { camera, size, gl } = useThree();
  const [visible, setVisible] = useState<Set<string>>(() => new Set());
  const signature = useRef("");
  useFrame(() => {
    const mobile = size.width < 600;
    const width =
      props.kind === "hotel" ? (mobile ? 50 : 62) : mobile ? 44 : 54;
    const height = mobile ? 37 : 43;
    const canvasRect = gl.domElement.getBoundingClientRect();
    const root = gl.domElement.closest(".hw-root");
    const overlays = root
      ? [
          ...root.querySelectorAll(
            ".hw-heading,.hw-context,.hw-camera-tools,.hw-hint,.hw-access-list",
          ),
        ].map((el) => {
          const r = el.getBoundingClientRect();
          return {
            left: r.left - canvasRect.left,
            right: r.right - canvasRect.left,
            top: r.top - canvasRect.top,
            bottom: r.bottom - canvasRect.top,
          };
        })
      : [];
    const boxes: { x: number; y: number }[] = [];
    const ids: string[] = [];
    const sorted = [...props.entities].sort((a, b) => {
      const score = (e: SpatialEntity) =>
        e.id === props.selected
          ? 100
          : e.signals.some((s) => s.kind === "allergy")
            ? 10
            : 0;
      return score(b) - score(a);
    });
    for (const e of sorted) {
      const point = new Vector3(
        e.x,
        props.kind === "hotel" ? 0.95 : 1.3,
        e.z + (props.kind === "hotel" ? e.depth * 0.36 : 0),
      ).project(camera);
      const x = ((point.x + 1) * size.width) / 2,
        y = ((1 - point.y) * size.height) / 2;
      if (
        point.z < -1 ||
        point.z > 1 ||
        x < width / 2 + 8 ||
        x > size.width - width / 2 - 8 ||
        y < height / 2 + 8 ||
        y > size.height - height / 2 - 8
      )
        continue;
      if (
        overlays.some(
          (r) =>
            x + width / 2 > r.left - 6 &&
            x - width / 2 < r.right + 6 &&
            y + height / 2 > r.top - 6 &&
            y - height / 2 < r.bottom + 6,
        )
      )
        continue;
      if (
        boxes.some(
          (b) => Math.abs(b.x - x) < width && Math.abs(b.y - y) < height,
        )
      )
        continue;
      boxes.push({ x, y });
      ids.push(e.id);
    }
    const next = ids.sort().join("|");
    if (next !== signature.current) {
      signature.current = next;
      setVisible(new Set(ids));
    }
  });
  return (
    <>
      {props.entities
        .filter((e) => visible.has(e.id))
        .map((e) => (
          <Html
            key={e.id}
            position={[
              e.x,
              props.kind === "hotel" ? 0.95 : 1.3,
              e.z + (props.kind === "hotel" ? e.depth * 0.36 : 0),
            ]}
            center
            zIndexRange={[20, 1]}
            style={{ pointerEvents: "auto" }}
          >
            <EntityMarker
              entity={e}
              selected={props.selected === e.id}
              onSelect={() => props.onSelect(e.id)}
              onHover={(v) => props.onHover(v ? e.id : null)}
            />
          </Html>
        ))}
    </>
  );
}

function World(props: Props) {
  const { camera, gl, scene, invalidate, size } = useThree();
  const controls = useRef<Controls>(null);
  const texture = useLoader(
    TextureLoader,
    "/layout-materials/restaurant-oak-floor.webp",
  );
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const snapshot = () =>
    props.onCamera(
      JSON.stringify({
        position: camera.position.toArray().map((n) => +n.toFixed(3)),
        target: controls.current?.target.toArray().map((n) => +n.toFixed(3)),
        zoom: +(camera as OrthographicCamera).zoom.toFixed(3),
      }),
    );
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const map = generator.fromScene(room, 0.03);
    scene.environment = map.texture;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      map.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, scene]);
  useEffect(() => {
    const fit = (top = false) => {
      if (!(camera instanceof OrthographicCamera)) return;
      const p = latest.current;
      camera.position.set(
        top ? 0 : p.width * 0.9,
        top ? 60 : p.width * (size.width < 600 ? 1.8 : 1.2),
        top ? 0.001 : p.depth * 2.2,
      );
      camera.up.set(0, 1, 0);
      controls.current?.target.set(0, 0.4, 0);
      camera.lookAt(0, 0.4, 0);
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      const points = [-1, 1].flatMap((x) =>
        [-1, 1].flatMap((z) =>
          [0, 3.7].map((y) =>
            new Vector3(
              x * (p.width / 2 + 0.8),
              y,
              z * (p.depth / 2 + 0.8),
            ).project(camera),
          ),
        ),
      );
      const spanX =
        ((Math.max(...points.map((v) => v.x)) -
          Math.min(...points.map((v) => v.x))) *
          size.width) /
        2;
      const spanY =
        ((Math.max(...points.map((v) => v.y)) -
          Math.min(...points.map((v) => v.y))) *
          size.height) /
        2;
      camera.zoom = Math.max(
        3,
        Math.min((size.width - 45) / spanX, (size.height - 105) / spanY),
      );
      camera.updateProjectionMatrix();
      controls.current?.update();
      invalidate();
      snapshot();
    };
    props.bridge.current = {
      reset: () => fit(),
      top: () => fit(true),
      zoom: (f) => {
        if (camera instanceof OrthographicCamera) {
          camera.zoom = Math.max(4, Math.min(140, camera.zoom / f));
          camera.updateProjectionMatrix();
          invalidate();
          snapshot();
        }
      },
      pan: (x, z) => {
        camera.position.x += x;
        camera.position.z += z;
        controls.current?.target.add(new Vector3(x, 0, z));
        controls.current?.update();
        invalidate();
        snapshot();
      },
    };
    fit();
    return () => {
      props.bridge.current = null;
    };
    // Selection and hover preserve the operator's camera position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.label,
    props.width,
    props.depth,
    size.width,
    size.height,
    camera,
    invalidate,
  ]);
  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#e6f0ff", "#b8a98c", 0.75]} />
      <directionalLight
        position={[-12, 25, 15]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-normalBias={0.04}
        shadow-bias={-0.0001}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-far={80}
      />
      <directionalLight
        position={[15, 12, -10]}
        intensity={1.8}
        color="#c5dfff"
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.32, 0]}
        receiveShadow
      >
        <planeGeometry args={[160, 160]} />
        <shadowMaterial transparent opacity={0.13} />
      </mesh>
      <Box
        at={[0, -0.14, 0]}
        size={[props.width + 0.3, 0.3, props.depth + 0.3]}
        color="#c4c3b7"
        radius={0.12}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.018, 0]}
        receiveShadow
      >
        <planeGeometry args={[props.width, props.depth]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.68}
          color={props.kind === "hotel" ? "#f3eee3" : "#f5eddd"}
        />
      </mesh>
      {props.kind === "restaurant" ? (
        <RestaurantArchitecture width={props.width} depth={props.depth} />
      ) : (
        <>
          <Box
            at={[0, 0.035, -0.6]}
            size={[props.width - 0.5, 0.025, 1.35]}
            color="#c5d6d2"
          />
          <Plant at={[-props.width / 2 + 0.6, 0, 0]} />
          <Plant at={[props.width / 2 - 0.6, 0, 0]} />
        </>
      )}
      {props.entities.map((e) => (
        <ModelEntity
          key={e.id}
          entity={e}
          kind={props.kind}
          selected={props.selected === e.id}
          onSelect={() => props.onSelect(e.id)}
          onHover={(v) => props.onHover(v ? e.id : null)}
        />
      ))}
      <EntityLabels {...props} />
      <OrbitControls
        ref={controls}
        makeDefault
        domElement={
          gl.domElement.closest<HTMLElement>(".hw-stage") ?? gl.domElement
        }
        enableDamping={false}
        minZoom={4}
        maxZoom={140}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI / 2.65}
        onEnd={snapshot}
      />
    </>
  );
}
export default function HospitalityScene(props: Props) {
  return (
    <Canvas
      orthographic
      shadows
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [24, 30, 35], zoom: 22, near: 0.1, far: 300 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.95;
        gl.shadowMap.type = PCFSoftShadowMap;
      }}
    >
      <Suspense fallback={null}>
        <World {...props} />
      </Suspense>
    </Canvas>
  );
}
