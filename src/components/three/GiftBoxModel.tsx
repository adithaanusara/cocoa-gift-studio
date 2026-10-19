"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CELL } from "./ItemModel";
import { kraftTexture } from "./textures";

export const BOX_HEIGHT = 0.62;
export const WALL = 0.035;
export const FLOOR = 0.03;

export function boxSize(cols: number, rows: number) {
  return { w: cols * CELL, d: rows * CELL };
}

function useKraftMaterials() {
  return useMemo(() => {
    const map = kraftTexture();
    const outer = new THREE.MeshStandardMaterial({ map, color: "#ffffff", roughness: 0.88, metalness: 0 });
    const inner = new THREE.MeshStandardMaterial({ map, color: "#d8c0a0", roughness: 0.92, metalness: 0 });
    const rim = new THREE.MeshStandardMaterial({ map, color: "#f3e3cc", roughness: 0.85, metalness: 0 });
    return { outer, inner, rim };
  }, []);
}

/** Thin curled strips of paper scattered on the box floor. */
function Filler({ w, d, color }: { w: number; d: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = Math.round(w * d * 70);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    let seed = 11;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const tint = new THREE.Color();
    const base = new THREE.Color(color);
    for (let i = 0; i < count; i++) {
      // bias strips towards the walls where they peek out between items
      const edge = rand() < 0.55;
      let x = (rand() - 0.5) * (w - 0.08);
      let z = (rand() - 0.5) * (d - 0.08);
      if (edge) {
        if (rand() < 0.5) x = Math.sign(x || 1) * (w / 2 - 0.05 - rand() * 0.08);
        else z = Math.sign(z || 1) * (d / 2 - 0.05 - rand() * 0.08);
      }
      dummy.position.set(x, FLOOR + 0.004 + rand() * (edge ? 0.12 : 0.03), z);
      dummy.rotation.set((rand() - 0.5) * 1.2, rand() * Math.PI, (rand() - 0.5) * 1.2);
      dummy.scale.set(0.6 + rand() * 0.9, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      tint.copy(base).offsetHSL(0, 0, (rand() - 0.5) * 0.12);
      mesh.setColorAt(i, tint);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, w, d, color]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.13, 0.004, 0.014]} />
      <meshStandardMaterial roughness={0.6} metalness={0.05} />
    </instancedMesh>
  );
}

function satin(color: string) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.32,
    metalness: 0.15,
    sheen: 1,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.45),
    clearcoat: 0.3,
  });
}

/** A two-loop satin bow, sitting on y = 0 and facing +z. */
export function Bow({ color, scale = 1 }: { color: string; scale?: number }) {
  const material = useMemo(() => satin(color), [color]);
  return (
    <group scale={scale}>
      {[-1, 1].map((side) => (
        <mesh key={side} material={material} position={[side * 0.17, 0.11, 0]} rotation={[0, side * 0.35, side * 0.55]} scale={[1.25, 0.75, 1]}>
          <torusGeometry args={[0.13, 0.034, 12, 40]} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`tail${side}`} material={material} position={[side * 0.09, 0.02, 0.16]} rotation={[-0.3, side * 0.5, side * 0.25]}>
          <boxGeometry args={[0.07, 0.008, 0.34]} />
        </mesh>
      ))}
      <mesh material={material} position={[0, 0.07, 0]} scale={[1, 0.85, 0.9]}>
        <sphereGeometry args={[0.065, 20, 16]} />
      </mesh>
    </group>
  );
}

interface GiftBoxModelProps {
  cols: number;
  rows: number;
  fillerColor: string;
  ribbonColor?: string | null;
}

/** Open kraft tray with folded rim, paper filler and an optional ribbon. */
export function GiftBoxModel({ cols, rows, fillerColor, ribbonColor }: GiftBoxModelProps) {
  const { w, d } = boxSize(cols, rows);
  const mats = useKraftMaterials();
  const ribbonMat = useMemo(() => (ribbonColor ? satin(ribbonColor) : null), [ribbonColor]);
  const H = BOX_HEIGHT;
  const ow = w + WALL * 2;
  const od = d + WALL * 2;

  return (
    <group>
      {/* floor */}
      <mesh material={mats.inner} position={[0, FLOOR / 2, 0]} receiveShadow>
        <boxGeometry args={[ow, FLOOR, od]} />
      </mesh>
      {/* walls: outer faces use the brighter kraft */}
      <mesh position={[0, H / 2, od / 2 - WALL / 2]} material={[mats.inner, mats.inner, mats.rim, mats.inner, mats.outer, mats.inner]}>
        <boxGeometry args={[ow, H, WALL]} />
      </mesh>
      <mesh position={[0, H / 2, -od / 2 + WALL / 2]} material={[mats.inner, mats.inner, mats.rim, mats.inner, mats.inner, mats.outer]}>
        <boxGeometry args={[ow, H, WALL]} />
      </mesh>
      <mesh position={[ow / 2 - WALL / 2, H / 2, 0]} material={[mats.outer, mats.inner, mats.rim, mats.inner, mats.inner, mats.inner]}>
        <boxGeometry args={[WALL, H, d]} />
      </mesh>
      <mesh position={[-ow / 2 + WALL / 2, H / 2, 0]} material={[mats.inner, mats.outer, mats.rim, mats.inner, mats.inner, mats.inner]}>
        <boxGeometry args={[WALL, H, d]} />
      </mesh>
      {/* folded-in rim strips, like the trays in the photos */}
      {[
        { p: [0, H - 0.07, d / 2 - 0.006] as const, s: [w, 0.14, 0.012] as const },
        { p: [0, H - 0.07, -d / 2 + 0.006] as const, s: [w, 0.14, 0.012] as const },
        { p: [w / 2 - 0.006, H - 0.07, 0] as const, s: [0.012, 0.14, d - 0.024] as const },
        { p: [-w / 2 + 0.006, H - 0.07, 0] as const, s: [0.012, 0.14, d - 0.024] as const },
      ].map((strip, i) => (
        <mesh key={i} material={mats.rim} position={[...strip.p]}>
          <boxGeometry args={[...strip.s]} />
        </mesh>
      ))}
      <Filler w={w} d={d} color={fillerColor} />

      {ribbonMat && ribbonColor && (
        <group>
          <mesh material={ribbonMat} position={[0, H * 0.5, od / 2 + 0.004]}>
            <boxGeometry args={[ow + 0.012, 0.11, 0.008]} />
          </mesh>
          <mesh material={ribbonMat} position={[0, H * 0.5, -od / 2 - 0.004]}>
            <boxGeometry args={[ow + 0.012, 0.11, 0.008]} />
          </mesh>
          <mesh material={ribbonMat} position={[ow / 2 + 0.004, H * 0.5, 0]}>
            <boxGeometry args={[0.008, 0.11, od + 0.012]} />
          </mesh>
          <mesh material={ribbonMat} position={[-ow / 2 - 0.004, H * 0.5, 0]}>
            <boxGeometry args={[0.008, 0.11, od + 0.012]} />
          </mesh>
          <group position={[0, H * 0.5 - 0.06, od / 2 + 0.03]} rotation={[Math.PI / 2 - 0.25, 0, 0]}>
            <Bow color={ribbonColor} scale={0.85} />
          </group>
        </group>
      )}
    </group>
  );
}

/** Matching lid with a ribbon cross and bow, sitting on y = 0. */
export function GiftBoxLid({ cols, rows, ribbonColor }: { cols: number; rows: number; ribbonColor: string }) {
  const { w, d } = boxSize(cols, rows);
  const mats = useKraftMaterials();
  const ribbonMat = useMemo(() => satin(ribbonColor), [ribbonColor]);
  const lw = w + WALL * 2 + 0.03;
  const ld = d + WALL * 2 + 0.03;
  const LH = 0.2;
  const T = 0.025;
  return (
    <group>
      <mesh material={[mats.outer, mats.outer, mats.outer, mats.inner, mats.outer, mats.outer]} position={[0, LH - T / 2, 0]}>
        <boxGeometry args={[lw, T, ld]} />
      </mesh>
      {[
        { p: [0, LH / 2, ld / 2 - T / 2], s: [lw, LH, T] },
        { p: [0, LH / 2, -ld / 2 + T / 2], s: [lw, LH, T] },
        { p: [lw / 2 - T / 2, LH / 2, 0], s: [T, LH, ld] },
        { p: [-lw / 2 + T / 2, LH / 2, 0], s: [T, LH, ld] },
      ].map((skirt, i) => (
        <mesh key={i} material={mats.outer} position={skirt.p as [number, number, number]}>
          <boxGeometry args={skirt.s as [number, number, number]} />
        </mesh>
      ))}
      <mesh material={ribbonMat} position={[0, LH + 0.003, 0]}>
        <boxGeometry args={[0.16, 0.006, ld + 0.01]} />
      </mesh>
      <mesh material={ribbonMat} position={[0, LH + 0.004, 0]}>
        <boxGeometry args={[lw + 0.01, 0.006, 0.16]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={`fz${s}`} material={ribbonMat} position={[0, LH / 2, s * (ld / 2 + 0.004)]}>
          <boxGeometry args={[0.16, LH, 0.006]} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <mesh key={`fx${s}`} material={ribbonMat} position={[s * (lw / 2 + 0.004), LH / 2, 0]}>
          <boxGeometry args={[0.006, LH, 0.16]} />
        </mesh>
      ))}
      <group position={[0, LH, 0]}>
        <Bow color={ribbonColor} scale={1.5} />
      </group>
    </group>
  );
}
