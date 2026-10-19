"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getGiftBox, defaultBoxId } from "@/config/giftBoxes";
import { getItem } from "@/config/items";
import { occupancyWith } from "@/lib/packing";
import { FLIGHT_MS, LIFT_OUT_MS, stageBridge } from "@/lib/stageBridge";
import type { ExtraInstance, GiftBox, Placement } from "@/lib/types";
import { useBuilderStore, useStageStore } from "@/store/useBuilderStore";
import { BOX_HEIGHT, FLOOR, GiftBoxModel, boxSize } from "./GiftBoxModel";
import { CELL, ItemModel, itemSize } from "./ItemModel";
import { computePieces, placementCenter, type RenderPiece } from "./layout";
import { clamp01, damp, easeOutBounce, easeOutCubic } from "./motion";
import { StudioLights } from "./StudioLights";
import { glowTexture } from "./textures";

const DROP_MS = 520;

export interface StageControls {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

const FOV = 32;
const ELEVATION = 0.92; // radians above the horizon

/** Camera position that frames the whole box (plus a margin) for a given stage aspect. */
function cameraHome(box: GiftBox, aspect: number) {
  const { w, d } = boxSize(box.grid.cols, box.grid.rows);
  const half = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const fitWidth = (w * 1.42) / 2 / (half * Math.max(aspect, 0.3));
  const fitDepth = (d * Math.sin(ELEVATION) + BOX_HEIGHT * Math.cos(ELEVATION)) * 1.55 / 2 / half;
  const dist = Math.max(fitWidth, fitDepth);
  return new THREE.Vector3(0, dist * Math.sin(ELEVATION), dist * Math.cos(ELEVATION));
}

/* ------------------------------------------------------------------ pieces */

function PlacedItem({
  piece,
  delay,
  dropHeight,
  reduced,
  onLand,
}: {
  piece: RenderPiece;
  delay: number;
  dropHeight: number;
  reduced: boolean;
  onLand?: (piece: RenderPiece) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const landed = useRef(false);
  const target = useMemo(() => new THREE.Vector3(...piece.position), [piece.position]);

  useFrame((_, rawDt) => {
    const group = ref.current;
    if (!group) return;
    const dt = Math.min(rawDt, 1 / 30);
    const now = performance.now();
    if (start.current === null) {
      start.current = now + (reduced ? 0 : delay);
      group.position.copy(target);
      group.rotation.set(0, piece.rotationY, 0);
    }
    const t = (now - start.current) / (reduced ? 1 : DROP_MS);
    if (t < 0) {
      group.visible = false;
      return;
    }
    group.visible = true;
    if (t < 1) {
      const fall = easeOutBounce(t);
      const settle = easeOutCubic(t);
      group.position.set(target.x, target.y + (1 - fall) * dropHeight, target.z);
      group.rotation.set((1 - settle) * 0.55, piece.rotationY + (1 - settle) * 1.1, (1 - settle) * -0.3);
      group.scale.setScalar(0.72 + 0.28 * settle);
      return;
    }
    if (!landed.current) {
      landed.current = true;
      group.scale.setScalar(1);
      onLand?.(piece);
    }
    // Ease into new resting spots when the layout changes.
    const k = damp(9, dt);
    group.position.lerp(target, k);
    group.rotation.x += (0 - group.rotation.x) * k;
    group.rotation.z += (0 - group.rotation.z) * k;
    group.rotation.y += (piece.rotationY - group.rotation.y) * k;
  });

  return (
    <group ref={ref} visible={false}>
      <group rotation={[piece.tilt[0], 0, piece.tilt[1]]}>
        <ItemModel item={piece.item} />
      </group>
    </group>
  );
}

function ExitingItem({ piece, onDone }: { piece: RenderPiece; onDone: (key: string) => void }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const done = useRef(false);
  useFrame(() => {
    const group = ref.current;
    if (!group || done.current) return;
    const now = performance.now();
    if (start.current === null) start.current = now;
    const t = clamp01((now - start.current) / LIFT_OUT_MS);
    const e = easeOutCubic(t);
    group.position.set(piece.position[0], piece.position[1] + e * 0.8, piece.position[2]);
    group.rotation.set(-e * 0.5, piece.rotationY + e * 1.6, e * 0.25);
    group.scale.setScalar(1 - e * 0.65);
    if (t >= 1) {
      done.current = true;
      group.visible = false;
      onDone(piece.key);
    }
  });
  return (
    <group ref={ref}>
      <ItemModel item={piece.item} />
    </group>
  );
}

const burstMaterial = new THREE.MeshBasicMaterial({ color: "#ffe2a0", toneMapped: false, transparent: true });

function Burst({ position, onDone, id }: { position: [number, number, number]; id: number; onDone: (id: number) => void }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const dirs = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.2;
        const up = 0.4 + ((i * 37) % 10) / 14;
        return new THREE.Vector3(Math.cos(a), up, Math.sin(a)).normalize();
      }),
    [],
  );
  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    const now = performance.now();
    if (start.current === null) start.current = now;
    const t = clamp01((now - start.current) / 700);
    const e = easeOutCubic(t);
    group.children.forEach((child, i) => {
      child.position.copy(dirs[i]).multiplyScalar(e * 0.42);
      child.position.y -= t * t * 0.15;
      child.scale.setScalar((1 - t) * 0.028 + 0.001);
      child.rotation.set(t * 6, t * 4 + i, 0);
    });
    if (t >= 1) onDone(id);
  });
  return (
    <group ref={ref} position={position}>
      {dirs.map((_, i) => (
        <mesh key={i} material={burstMaterial}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
}

/* --------------------------------------------------------------- the scene */

interface SceneProps {
  box: GiftBox;
  extras: ExtraInstance[];
  reduced: boolean;
  compact: boolean;
  controlsRef: React.RefObject<StageControls | null>;
}

function Scene({ box, extras, reduced, compact, controlsRef }: SceneProps) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  const orbit = useRef<OrbitControlsImpl>(null);
  const boxGroup = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const preview = useRef<THREE.Mesh>(null);
  const spring = useRef({ y: 0, vy: 0, rz: 0, vrz: 0, lift: 0 });
  const intro = useRef<{ start: number; from: THREE.Vector3 } | null>(null);
  const [ghosts, setGhosts] = useState<RenderPiece[]>([]);
  const [bursts, setBursts] = useState<{ id: number; position: [number, number, number] }[]>([]);

  const lastEvent = useBuilderStore((state) => state.lastEvent);
  const dragItemId = useStageStore((state) => state.dragItemId);
  const overDropZone = useStageStore((state) => state.overDropZone);

  const pieces = useMemo(() => computePieces(box, extras), [box, extras]);
  const piecesRef = useRef(pieces);
  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  const ribbon = extras.find((extra) => getItem(extra.itemId)?.model.kind === "ribbon");
  const ribbonItem = ribbon ? getItem(ribbon.itemId) : undefined;
  const ribbonColor = ribbonItem?.model.kind === "ribbon" ? ribbonItem.model.color : null;
  const { w, d } = boxSize(box.grid.cols, box.grid.rows);
  const home = useMemo(() => cameraHome(box, aspect), [box, aspect]);

  // Fly the camera in on first load and whenever the box changes.
  useEffect(() => {
    intro.current = reduced ? null : { start: performance.now(), from: home.clone().multiplyScalar(1.35).setY(home.y * 0.7) };
    if (reduced) camera.position.copy(home);
    orbit.current?.target.set(0, 0.15, 0);
  }, [home, reduced, camera]);

  // Removals: keep the piece around long enough to lift it out.
  useEffect(
    () =>
      useBuilderStore.subscribe((state, prev) => {
        const event = state.lastEvent;
        if (!event || event === prev.lastEvent) return;
        if (event.type === "remove") {
          const piece = piecesRef.current.find((p) => p.key === event.key);
          if (piece && !reduced) setGhosts((current) => [...current, piece]);
          if (!piece && !reduced && event.placement === null) spring.current.vy -= 0.6;
        }
        if (event.type === "rejected") {
          spring.current.vrz += spring.current.rz > 0 ? -0.9 : 0.9;
        }
        if (event.type === "add" && event.placement === null) {
          // decorations (ribbon) — give the box a happy hop
          spring.current.vy += 1.2;
        }
      }),
    [reduced],
  );

  // Screen projection for the DOM flight animations.
  useEffect(() => {
    const project = (placement: Placement | null) => {
      const group = boxGroup.current;
      if (!group) return null;
      const local = new THREE.Vector3(0, BOX_HEIGHT * 0.9, d / 2);
      if (placement) {
        const c = placementCenter(box, placement);
        const piece = piecesRef.current.find((p) => p.placement === placement);
        local.set(c.x, (piece ? piece.position[1] : FLOOR) + 0.08, c.z);
      }
      const world = group.localToWorld(local);
      world.project(camera);
      const rect = gl.domElement.getBoundingClientRect();
      return { x: rect.left + ((world.x + 1) / 2) * rect.width, y: rect.top + ((1 - world.y) / 2) * rect.height };
    };
    return stageBridge.setProjector(project);
  }, [box, camera, gl, d]);

  // Zoom / reset buttons.
  useEffect(() => {
    const moveTo = (position: THREE.Vector3) => {
      gsap.to(camera.position, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration: reduced ? 0 : 0.7,
        ease: "power3.out",
        onUpdate: () => orbit.current?.update(),
      });
    };
    const zoom = (factor: number) => {
      const controls = orbit.current;
      const target = controls?.target ?? new THREE.Vector3();
      const offset = camera.position.clone().sub(target);
      const min = controls?.minDistance ?? 1;
      const max = controls?.maxDistance ?? 20;
      const length = THREE.MathUtils.clamp(offset.length() * factor, min, max);
      moveTo(target.clone().add(offset.setLength(length)));
    };
    controlsRef.current = {
      zoomIn: () => zoom(0.8),
      zoomOut: () => zoom(1.25),
      reset: () => {
        orbit.current?.target.set(0, 0.15, 0);
        moveTo(home);
      },
    };
    return () => {
      controlsRef.current = null;
    };
  }, [camera, controlsRef, home, reduced]);

  const dragItem = dragItemId ? getItem(dragItemId) : undefined;
  const previewSpot = useMemo(() => {
    if (!dragItem || dragItem.placement !== "inside") return null;
    const spot = occupancyWith(box, extras).findSpot(dragItem);
    if (!spot) return null;
    const c = placementCenter(box, spot);
    const top = pieces
      .filter((p) => p.placement.layer < spot.layer)
      .filter((p) => p.placement.col < spot.col + spot.w && spot.col < p.placement.col + p.placement.w && p.placement.row < spot.row + spot.d && spot.row < p.placement.row + p.placement.d)
      .reduce((max, p) => Math.max(max, p.position[1] + itemSize(p.item).h), FLOOR);
    return { x: c.x, z: c.z, y: top + 0.012, w: spot.w * CELL * 0.96, d: spot.d * CELL * 0.96 };
  }, [dragItem, box, extras, pieces]);
  const dragBlocked = !!dragItem && dragItem.placement === "inside" && !previewSpot;

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const s = spring.current;
    s.vy += (-170 * s.y - 11 * s.vy) * dt;
    s.y += s.vy * dt;
    s.vrz += (-260 * s.rz - 9 * s.vrz) * dt;
    s.rz += s.vrz * dt;
    s.lift += ((overDropZone ? 0.06 : 0) - s.lift) * damp(10, dt);
    const group = boxGroup.current;
    if (group) {
      group.scale.set(1 - s.y * 0.35, 1 + s.y, 1 - s.y * 0.35);
      group.rotation.z = s.rz;
      group.position.y = s.lift;
    }
    if (glow.current) {
      const material = glow.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = overDropZone ? 0.95 : dragItemId ? 0.45 : 0;
      material.opacity += (targetOpacity - material.opacity) * damp(8, dt);
      material.color.set(dragBlocked ? "#e0603a" : "#ffffff");
    }
    if (preview.current) {
      const material = preview.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.35 + Math.sin(performance.now() / 180) * 0.15;
    }
    if (intro.current) {
      const t = clamp01((performance.now() - intro.current.start) / 1400);
      camera.position.lerpVectors(intro.current.from, home, easeOutCubic(t));
      orbit.current?.update();
      if (t >= 1) intro.current = null;
    }
  });

  const onLand = useCallback(
    (piece: RenderPiece) => {
      if (!piece.isExtra || reduced) return;
      spring.current.vy -= 0.75;
      const { h } = itemSize(piece.item);
      setBursts((current) => [...current.slice(-4), { id: Date.now() + Math.random(), position: [piece.position[0], piece.position[1] + h, piece.position[2]] }]);
    },
    [reduced],
  );

  const recentAddKey = lastEvent?.type === "add" ? lastEvent.key : null;
  const recentAddHadFlight = lastEvent?.type === "add" && !!lastEvent.origin;
  const podiumRadius = Math.hypot(w, d) * 0.62;

  return (
    <>
      <StudioLights />
      <OrbitControls
        ref={orbit}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={home.length() * 0.45}
        maxDistance={home.length() * 1.6}
        minPolarAngle={0.12}
        maxPolarAngle={1.32}
        rotateSpeed={0.7}
        zoomSpeed={0.6}
        target={[0, 0.15, 0]}
      />

      {/* podium */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[podiumRadius, podiumRadius * 1.02, 0.1, 96]} />
        <meshStandardMaterial color="#f6eee2" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[podiumRadius * 0.985, podiumRadius, 128]} />
        <meshStandardMaterial color="#c9a35b" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh ref={glow} position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 1.9, d * 1.9]} />
        <meshBasicMaterial map={glowTexture()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <ContactShadows position={[0, 0.003, 0]} scale={Math.max(w, d) * 2.2} blur={2.4} opacity={0.55} far={1.2} resolution={compact ? 512 : 1024} color="#2b1910" />

      <group ref={boxGroup} key={box.id}>
        <GiftBoxModel cols={box.grid.cols} rows={box.grid.rows} fillerColor={box.fillerColor} ribbonColor={ribbonColor} />
        {pieces.map((piece, index) => {
          const isRecent = piece.key === recentAddKey;
          return (
            <PlacedItem
              key={piece.key}
              piece={piece}
              reduced={reduced}
              delay={isRecent ? (recentAddHadFlight ? FLIGHT_MS - 120 : 0) : 250 + index * 55}
              dropHeight={isRecent ? 0.9 : 0.55}
              onLand={isRecent ? onLand : undefined}
            />
          );
        })}
        {ghosts.map((piece) => (
          <ExitingItem key={`ghost-${piece.key}`} piece={piece} onDone={(key) => setGhosts((current) => current.filter((g) => g.key !== key))} />
        ))}
        {bursts.map((burst) => (
          <Burst key={burst.id} id={burst.id} position={burst.position} onDone={(id) => setBursts((current) => current.filter((b) => b.id !== id))} />
        ))}
        {previewSpot && overDropZone && (
          <mesh ref={preview} position={[previewSpot.x, previewSpot.y, previewSpot.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[previewSpot.w, previewSpot.d]} />
            <meshBasicMaterial color="#ffd27a" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
          </mesh>
        )}
      </group>
    </>
  );
}

/* ---------------------------------------------------------------- wrapper */

interface InteractiveGiftBox3DProps {
  reduced: boolean;
  compact: boolean;
  /** Receives zoom / reset handlers for the on-screen view buttons. */
  controlsRef: React.RefObject<StageControls | null>;
}

export default function InteractiveGiftBox3D({ reduced, compact, controlsRef }: InteractiveGiftBox3DProps) {
  const boxId = useBuilderStore((state) => state.boxId);
  const extras = useBuilderStore((state) => state.extras);
  const box = getGiftBox(boxId) ?? getGiftBox(defaultBoxId)!;
  const initialCamera = useMemo(() => cameraHome(box, 1).multiplyScalar(1.35), [box]);

  return (
    <Canvas
      className="!touch-none"
      dpr={compact ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: 0.1, far: 80, position: initialCamera.toArray() }}
      aria-label={`3D view of the ${box.name}. Drag to rotate, scroll or pinch to zoom.`}
      role="img"
    >
      <Scene box={box} extras={extras} reduced={reduced} compact={compact} controlsRef={controlsRef} />
    </Canvas>
  );
}
