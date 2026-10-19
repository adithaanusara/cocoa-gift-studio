"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { CatalogItem } from "@/lib/types";
import {
  cardTexture,
  heartLabelTexture,
  kunafaTexture,
  sachetTexture,
  wrapperTexture,
} from "./textures";

/** World units per 2 cm grid cell (1 unit = 10 cm). */
export const CELL = 0.2;
/** Items are drawn slightly smaller than their cells so neighbours don't touch. */
const INSET = 0.93;

export function itemSize(item: CatalogItem) {
  return {
    w: item.footprint.w * CELL * INSET,
    d: item.footprint.d * CELL * INSET,
    h: Math.max(0.02, item.heightCm / 10),
  };
}

/** Classic heart outline, point facing +y before rotation, sized w × d. */
function heartShape(w: number, d: number) {
  const s = new THREE.Shape();
  const p = (x: number, y: number) => [x * w, y * d] as const;
  s.moveTo(...p(0, -0.47));
  s.bezierCurveTo(...p(-0.12, -0.36), ...p(-0.5, -0.12), ...p(-0.5, 0.16));
  s.bezierCurveTo(...p(-0.5, 0.42), ...p(-0.31, 0.52), ...p(-0.2, 0.5));
  s.bezierCurveTo(...p(-0.09, 0.48), ...p(-0.02, 0.4), ...p(0, 0.31));
  s.bezierCurveTo(...p(0.02, 0.4), ...p(0.09, 0.48), ...p(0.2, 0.5));
  s.bezierCurveTo(...p(0.31, 0.52), ...p(0.5, 0.42), ...p(0.5, 0.16));
  s.bezierCurveTo(...p(0.5, -0.12), ...p(0.12, -0.36), ...p(0, -0.47));
  return s;
}

function normalizeUVs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - box.min.x) / (box.max.x - box.min.x);
    uv[i * 2 + 1] = (pos.getY(i) - box.min.y) / (box.max.y - box.min.y);
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geometry;
}

interface BuiltModel {
  meshes: { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[]; position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number] }[];
}

const modelCache = new Map<string, BuiltModel>();

const goldFoil = () =>
  new THREE.MeshStandardMaterial({ color: "#d8a93f", metalness: 0.95, roughness: 0.32, flatShading: true });

function buildModel(item: CatalogItem): BuiltModel {
  const { w, d, h } = itemSize(item);
  const model = item.model;
  const { w: cols, d: rows } = item.footprint;

  if (model.kind === "wrapper" || model.kind === "sachet" || model.kind === "carton" || model.kind === "card") {
    let top: THREE.Texture;
    let side: string;
    let metal = 0;
    let rough = 0.55;
    if (model.kind === "wrapper") {
      top = wrapperTexture(model.label, model.color, model.shade, cols, rows);
      side = model.shade;
      metal = (model.foil ?? 0.3) * 0.55;
      rough = 0.3;
    } else if (model.kind === "sachet") {
      top = sachetTexture(model.color, model.accent, model.label, cols, rows);
      side = model.color;
      metal = 0.2;
      rough = 0.35;
    } else if (model.kind === "carton") {
      top = kunafaTexture(cols, rows);
      side = "#8cc63f";
      rough = 0.6;
    } else {
      top = cardTexture(cols, rows);
      side = "#f4ecdc";
      rough = 0.8;
    }
    const sideMat = new THREE.MeshStandardMaterial({ color: side, metalness: metal, roughness: rough + 0.1 });
    const topMat = new THREE.MeshPhysicalMaterial({
      map: top,
      metalness: metal,
      roughness: rough,
      clearcoat: model.kind === "wrapper" ? 0.35 : 0.1,
      clearcoatRoughness: 0.25,
    });
    // Flow-wrapped bars bulge slightly in the middle: use a softly bevelled body.
    const geometry = new THREE.BoxGeometry(w, h, d, 1, 1, 1);
    const body = {
      geometry,
      material: [sideMat, sideMat, topMat, sideMat, sideMat, sideMat],
      position: [0, h / 2, 0] as [number, number, number],
    };
    if (model.kind !== "wrapper" && model.kind !== "sachet") return { meshes: [body] };
    // Crimped fins at both ends.
    const long = w >= d ? "x" : "z";
    const finLen = (long === "x" ? w : d) * 0.05;
    const finGeo = new THREE.BoxGeometry(long === "x" ? finLen : w * 1.02, h * 0.2, long === "x" ? d * 1.02 : finLen);
    const finMat = new THREE.MeshStandardMaterial({ color: side, metalness: metal, roughness: rough });
    const offset = (long === "x" ? w : d) / 2 + finLen * 0.35;
    const finA: [number, number, number] = long === "x" ? [offset, h * 0.5, 0] : [0, h * 0.5, offset];
    const finB: [number, number, number] = long === "x" ? [-offset, h * 0.5, 0] : [0, h * 0.5, -offset];
    // Shorten the body so fins + body equal the footprint.
    const bodyGeo = new THREE.BoxGeometry(long === "x" ? w - finLen * 1.4 : w, h, long === "x" ? d : d - finLen * 1.4);
    return {
      meshes: [
        { ...body, geometry: bodyGeo },
        { geometry: finGeo, material: finMat, position: finA },
        { geometry: finGeo, material: finMat, position: finB },
      ],
    };
  }

  if (model.kind === "heart") {
    const meshes: BuiltModel["meshes"] = [];
    const flat: [number, number, number] = [-Math.PI / 2, 0, 0];
    const tray = new THREE.ExtrudeGeometry(heartShape(w * 0.97, d * 0.97), {
      depth: h * 0.32,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
      curveSegments: 24,
    });
    meshes.push({
      geometry: tray,
      material: new THREE.MeshStandardMaterial({ color: "#c9952f", metalness: 0.9, roughness: 0.28 }),
      rotation: flat,
    });
    const r = Math.min(w, d) * (model.pieces > 3 ? 0.15 : 0.19);
    const spots =
      model.pieces > 3
        ? [[-0.22, 0.14], [0.22, 0.14], [0, 0.02], [-0.12, -0.17], [0.12, -0.17]]
        : [[-0.2, 0.12], [0.2, 0.12], [0, -0.16]];
    const foil = goldFoil();
    const ball = new THREE.IcosahedronGeometry(r, 1);
    spots.slice(0, model.pieces).forEach(([sx, sy], i) => {
      meshes.push({
        geometry: ball,
        material: foil,
        position: [sx * w, h * 0.3 + r * 0.85, -sy * d],
        rotation: [i * 0.7, i * 1.3, i * 0.4],
        scale: [1, 0.86, 1],
      });
    });
    const lid = new THREE.ExtrudeGeometry(heartShape(w, d), {
      depth: h * 0.92,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 24,
    });
    meshes.push({
      geometry: lid,
      material: new THREE.MeshPhysicalMaterial({
        color: "#fff6e6",
        transparent: true,
        opacity: 0.22,
        roughness: 0.05,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        depthWrite: false,
      }),
      rotation: flat,
    });
    const label = normalizeUVs(new THREE.ShapeGeometry(heartShape(w * 0.44, d * 0.44), 24));
    meshes.push({
      geometry: label,
      material: new THREE.MeshStandardMaterial({ map: heartLabelTexture(model.label, model.sublabel), roughness: 0.6 }),
      rotation: flat,
      position: [0, h * 0.92 + 0.022, -d * 0.06],
    });
    if (model.ribbon) {
      const bow = new THREE.TorusGeometry(w * 0.05, w * 0.012, 8, 24);
      const red = new THREE.MeshStandardMaterial({ color: "#c0182c", roughness: 0.4 });
      meshes.push({ geometry: bow, material: red, position: [-w * 0.05, h * 0.92 + 0.03, -d * 0.2], rotation: [-Math.PI / 2, 0, 0.6], scale: [1, 0.6, 1] });
      meshes.push({ geometry: bow, material: red, position: [w * 0.05, h * 0.92 + 0.03, -d * 0.2], rotation: [-Math.PI / 2, 0, -0.6], scale: [1, 0.6, 1] });
    }
    return { meshes };
  }

  // Ribbons are drawn by the box itself.
  return { meshes: [] };
}

export function getBuiltModel(item: CatalogItem) {
  let model = modelCache.get(item.id);
  if (!model) {
    model = buildModel(item);
    modelCache.set(item.id, model);
  }
  return model;
}

/** A lightweight 3D stand-in for a product, resting on y = 0. */
export function ItemModel({ item }: { item: CatalogItem }) {
  const model = useMemo(() => getBuiltModel(item), [item]);
  return (
    <>
      {model.meshes.map((mesh, i) => (
        <mesh
          key={i}
          geometry={mesh.geometry}
          material={mesh.material}
          position={mesh.position}
          rotation={mesh.rotation}
          scale={mesh.scale}
        />
      ))}
    </>
  );
}
