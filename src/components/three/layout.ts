import { getItem } from "@/config/items";
import { getBaseLayout } from "@/lib/packing";
import type { CatalogItem, ExtraInstance, GiftBox, Placement } from "@/lib/types";
import { CELL, itemSize } from "./ItemModel";
import { FLOOR, boxSize } from "./GiftBoxModel";

export interface RenderPiece {
  key: string;
  item: CatalogItem;
  placement: Placement;
  position: [number, number, number];
  rotationY: number;
  tilt: [number, number];
  isExtra: boolean;
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function overlaps(a: Placement, b: Placement) {
  return a.col < b.col + b.w && b.col < a.col + a.w && a.row < b.row + b.d && b.row < a.row + a.d;
}

/** Centre of a placement on the box floor, in box-local units. */
export function placementCenter(box: GiftBox, p: Placement) {
  const { w, d } = boxSize(box.grid.cols, box.grid.rows);
  return {
    x: -w / 2 + (p.col + p.w / 2) * CELL,
    z: -d / 2 + (p.row + p.d / 2) * CELL,
  };
}

/**
 * Turns grid placements into resting positions. Stacked items sit on top of
 * whatever is beneath them, with a little natural rotation.
 */
export function computePieces(box: GiftBox, extras: ExtraInstance[]): RenderPiece[] {
  const entries: { key: string; itemId: string; placement: Placement; isExtra: boolean }[] = [
    ...getBaseLayout(box).items.map((piece) => ({ ...piece, isExtra: false })),
    ...extras
      .filter((extra): extra is ExtraInstance & { placement: Placement } => extra.placement !== null)
      .map((extra) => ({ key: extra.key, itemId: extra.itemId, placement: extra.placement, isExtra: true })),
  ];
  entries.sort((a, b) => a.placement.layer - b.placement.layer);

  const pieces: (RenderPiece & { top: number })[] = [];
  for (const entry of entries) {
    const item = getItem(entry.itemId);
    if (!item) continue;
    const { h } = itemSize(item);
    let base = FLOOR + 0.004;
    for (const below of pieces) {
      if (below.placement.layer < entry.placement.layer && overlaps(below.placement, entry.placement)) {
        base = Math.max(base, below.top + 0.004);
      }
    }
    const { x, z } = placementCenter(box, entry.placement);
    const r = hash(entry.key);
    const stacked = entry.placement.layer > 0;
    pieces.push({
      key: entry.key,
      item,
      placement: entry.placement,
      position: [x, base, z],
      rotationY: (entry.placement.rotated ? Math.PI / 2 : 0) + (r - 0.5) * 0.09,
      tilt: stacked ? [(hash(entry.key + "x") - 0.5) * 0.08, (r - 0.5) * 0.08] : [0, 0],
      isExtra: entry.isExtra,
      top: base + h,
    });
  }
  return pieces;
}
