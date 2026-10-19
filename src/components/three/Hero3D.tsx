"use client";

import { ContactShadows, Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getGiftBox } from "@/config/giftBoxes";
import { getItem } from "@/config/items";
import type { CatalogItem } from "@/lib/types";
import { BOX_HEIGHT, GiftBoxLid, GiftBoxModel, boxSize } from "./GiftBoxModel";
import { ItemModel } from "./ItemModel";
import { computePieces } from "./layout";
import { clamp01, damp, easeOutExpo } from "./motion";
import { StudioLights } from "./StudioLights";
import { glowTexture } from "./textures";

const HERO_BOX_ID = "signature";
/** Chocolates orbiting the hero box, positioned relative to the box. */
const FLOATERS: { id: string; position: [number, number, number]; rotation: [number, number, number]; speed: number }[] = [
  { id: "kitkat-4-finger", position: [-1.75, 1.15, -0.4], rotation: [0.9, 0.4, -0.3], speed: 1.1 },
  { id: "dairy-milk", position: [1.7, 1.45, -0.9], rotation: [1.1, -0.5, 0.4], speed: 0.9 },
  { id: "snickers", position: [-1.6, -0.15, 0.9], rotation: [0.5, 0.8, 0.2], speed: 1.3 },
  { id: "ailisha-heart", position: [1.75, 0.1, 0.7], rotation: [0.7, -0.4, -0.1], speed: 0.8 },
  { id: "mars", position: [0.2, 1.95, -1.4], rotation: [1.2, 0.2, 0.6], speed: 1.0 },
  { id: "fruit-candy", position: [-0.6, 1.75, 0.8], rotation: [0.4, 0.3, 0.9], speed: 1.4 },
  { id: "kitkat-2-finger", position: [1.0, -0.55, 1.4], rotation: [0.6, -0.9, 0.2], speed: 1.2 },
];

interface HeroSceneProps {
  progress: React.RefObject<number>;
  reduced: boolean;
}

function Floater({ item, base, rotation, speed, index, progress, reduced }: { item: CatalogItem; base: [number, number, number]; rotation: [number, number, number]; speed: number; index: number; progress: React.RefObject<number>; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame((_, dt) => {
    const group = ref.current;
    if (!group) return;
    const now = performance.now();
    if (start.current === null) start.current = now;
    const intro = reduced ? 1 : easeOutExpo(clamp01((now - start.current - 500 - index * 110) / 1600));
    const p = progress.current ?? 0;
    // drift outward and upward as the visitor scrolls, like the lid letting them out
    const spread = 1 + p * 0.45;
    const tx = base[0] * spread;
    const ty = base[1] + p * (1.2 + index * 0.12);
    const tz = base[2] + p * 0.8;
    const k = damp(6, Math.min(dt, 1 / 30));
    group.position.x += (tx * intro - group.position.x) * k;
    group.position.y += (ty * intro + (1 - intro) * -1.5 - group.position.y) * k;
    group.position.z += (tz - group.position.z) * k;
    group.scale.setScalar(Math.max(0.001, intro) * 0.72);
  });
  return (
    <group ref={ref}>
      <Float speed={reduced ? 0 : speed * 1.4} rotationIntensity={reduced ? 0 : 0.9} floatIntensity={reduced ? 0 : 0.8}>
        <group rotation={rotation}>
          <ItemModel item={item} />
        </group>
      </Float>
    </group>
  );
}

function HeroScene({ progress, reduced }: HeroSceneProps) {
  const box = getGiftBox(HERO_BOX_ID)!;
  const pieces = useMemo(() => computePieces(box, []), [box]);
  const { w, d } = boxSize(box.grid.cols, box.grid.rows);
  const rig = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const innerLight = useRef<THREE.PointLight>(null);
  const innerGlow = useRef<THREE.Mesh>(null);
  const start = useRef<number | null>(null);
  const viewport = useThree((state) => state.viewport);
  const wide = viewport.aspect > 1.1;
  // Phones get fewer, smaller floaters so they never cover the headline or buttons.
  const floaters = useMemo(
    () => FLOATERS.filter((_, i) => wide || [0, 1, 3, 6].includes(i)).map((f) => ({ ...f, item: getItem(f.id)! })).filter((f) => f.item),
    [wide],
  );

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const now = performance.now();
    if (start.current === null) start.current = now;
    const intro = reduced ? 1 : easeOutExpo(clamp01((now - start.current - 150) / 1900));
    const p = progress.current ?? 0;
    const k = damp(4, dt);
    const pointer = reduced ? { x: 0, y: 0 } : state.pointer;

    const group = rig.current;
    if (group) {
      const baseX = wide ? Math.min(viewport.width * 0.22, 2.3) : 0;
      const baseY = wide ? 0 : -1.75;
      group.position.x += (baseX * (1 - p * 0.9) - group.position.x) * k;
      group.position.y += (baseY + (1 - intro) * -2.2 + p * 0.3 - group.position.y) * k;
      const targetRotY = -0.55 + pointer.x * 0.35 + p * 1.05 + (reduced ? 0 : Math.sin(now / 4200) * 0.06);
      const targetRotX = 0.22 + p * 0.55 - pointer.y * 0.12;
      group.rotation.y += (targetRotY - group.rotation.y) * k;
      group.rotation.x += (targetRotX - group.rotation.x) * k;
      group.scale.setScalar((0.82 + intro * 0.18) * (wide ? 0.6 : 0.5));
    }
    if (lid.current) {
      const peek = intro * 0.42;
      const targetY = BOX_HEIGHT - 0.17 + peek + p * 2.4;
      lid.current.position.y += (targetY - lid.current.position.y) * damp(5, dt);
      lid.current.position.z += (-p * 1.6 - 0.05 * intro - lid.current.position.z) * damp(5, dt);
      lid.current.rotation.x += (-(0.12 * intro + p * 0.75) - lid.current.rotation.x) * damp(5, dt);
      lid.current.rotation.z += ((reduced ? 0 : Math.sin(now / 1800) * 0.03) - lid.current.rotation.z) * k;
    }
    const glowStrength = intro * (0.55 + p * 0.9);
    if (innerLight.current) innerLight.current.intensity = glowStrength * 3.2;
    if (innerGlow.current) (innerGlow.current.material as THREE.MeshBasicMaterial).opacity = glowStrength * 0.55;
  });

  return (
    <>
      <StudioLights intensity={0.8} env={0.55} />
      <spotLight position={[-4, 6, 3]} angle={0.5} penumbra={1} intensity={16} color="#ffd9a1" />
      <group ref={rig} position={[0, -2.5, 0]}>
        <GiftBoxModel cols={box.grid.cols} rows={box.grid.rows} fillerColor={box.fillerColor} />
        {pieces.map((piece) => (
          <group key={piece.key} position={piece.position} rotation={[piece.tilt[0], piece.rotationY, piece.tilt[1]]}>
            <ItemModel item={piece.item} />
          </group>
        ))}
        <pointLight ref={innerLight} position={[0, BOX_HEIGHT * 0.9, 0]} color="#ffc977" distance={4} decay={2} intensity={0} />
        <mesh ref={innerGlow} position={[0, BOX_HEIGHT + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w * 1.5, d * 1.5]} />
          <meshBasicMaterial map={glowTexture()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <group ref={lid} position={[0, BOX_HEIGHT - 0.17, 0]}>
          <GiftBoxLid cols={box.grid.cols} rows={box.grid.rows} ribbonColor="#c9a35b" />
        </group>
        <ContactShadows position={[0, -0.02, 0]} scale={9} blur={2.8} opacity={0.6} far={2.5} resolution={512} color="#000000" />
      </group>
      <group position={[wide ? Math.min(viewport.width * 0.22, 2.3) : 0, wide ? 0.25 : -1.65, 0]} scale={wide ? 1 : 0.55}>
        {floaters.map((f, i) => (
          <Floater key={f.id} item={f.item} base={f.position} rotation={f.rotation} speed={f.speed} index={i} progress={progress} reduced={reduced} />
        ))}
      </group>
      {!reduced && <Sparkles count={60} scale={[9, 5, 5]} size={2.4} speed={0.25} opacity={0.7} color="#f3d9a0" />}
    </>
  );
}

export default function Hero3D({ progress, reduced, active }: HeroSceneProps & { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 2.1, 7.4], fov: 34 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
      aria-hidden="true"
    >
      <HeroScene progress={progress} reduced={reduced} />
    </Canvas>
  );
}
