import { getItem } from "@/config/items";
import type { CatalogItem, ExtraInstance, GiftBox, Placement } from "./types";

/**
 * Grid-based packing for the inside of a gift box.
 *
 * The box floor is a grid of 2 cm cells with a fixed number of stackable
 * layers. Every inside item claims a rectangle of cells; two items can never
 * claim the same cell, so "box full" means an item genuinely has nowhere to go.
 */
export class Occupancy {
  readonly cols: number;
  readonly rows: number;
  readonly layers: number;
  private cells: Uint8Array;

  constructor(cols: number, rows: number, layers: number, cells?: Uint8Array) {
    this.cols = cols;
    this.rows = rows;
    this.layers = layers;
    this.cells = cells ? cells.slice() : new Uint8Array(cols * rows * layers);
  }

  static forBox(box: GiftBox) {
    return new Occupancy(box.grid.cols, box.grid.rows, box.grid.layers);
  }

  clone() {
    return new Occupancy(this.cols, this.rows, this.layers, this.cells);
  }

  get totalCells() {
    return this.cells.length;
  }

  get usedCells() {
    let used = 0;
    for (let i = 0; i < this.cells.length; i++) used += this.cells[i];
    return used;
  }

  private index(col: number, row: number, layer: number) {
    return (layer * this.rows + row) * this.cols + col;
  }

  fits(col: number, row: number, layer: number, w: number, d: number) {
    if (col + w > this.cols || row + d > this.rows || layer >= this.layers) return false;
    for (let r = row; r < row + d; r++) {
      for (let c = col; c < col + w; c++) {
        if (this.cells[this.index(c, r, layer)]) return false;
      }
    }
    return true;
  }

  mark(p: Placement, value: 0 | 1 = 1) {
    for (let r = p.row; r < p.row + p.d; r++) {
      for (let c = p.col; c < p.col + p.w; c++) {
        this.cells[this.index(c, r, p.layer)] = value;
      }
    }
  }

  /** First free spot, filling the bottom layer before stacking on top. */
  findSpot(item: CatalogItem): Placement | null {
    const { w, d } = item.footprint;
    const orientations: [number, number, boolean][] =
      w === d ? [[w, d, false]] : [[w, d, false], [d, w, true]];
    for (let layer = 0; layer < this.layers; layer++) {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          for (const [ow, od, rotated] of orientations) {
            if (this.fits(col, row, layer, ow, od)) {
              return { col, row, layer, w: ow, d: od, rotated };
            }
          }
        }
      }
    }
    return null;
  }
}

export interface PackedItem {
  key: string;
  itemId: string;
  placement: Placement;
}

export interface BaseLayout {
  occupancy: Occupancy;
  items: PackedItem[];
}

const baseLayoutCache = new Map<string, BaseLayout>();

/**
 * Lays out the contents pictured in a box. Largest items go in first so the
 * arrangement is compact. Contents without a visible count are drawn once.
 */
export function getBaseLayout(box: GiftBox): BaseLayout {
  const cached = baseLayoutCache.get(box.id);
  if (cached) return cached;

  const pieces: { key: string; item: CatalogItem }[] = [];
  for (const content of box.contents) {
    const item = content.itemId ? getItem(content.itemId) : undefined;
    if (!item || item.placement !== "inside") continue;
    const count = content.qty ?? 1;
    for (let i = 0; i < count; i++) pieces.push({ key: `base-${item.id}-${i}`, item });
  }
  pieces.sort(
    (a, b) => b.item.footprint.w * b.item.footprint.d - a.item.footprint.w * a.item.footprint.d,
  );

  const occupancy = Occupancy.forBox(box);
  const items: PackedItem[] = [];
  for (const piece of pieces) {
    const placement = occupancy.findSpot(piece.item);
    if (!placement) continue;
    occupancy.mark(placement);
    items.push({ key: piece.key, itemId: piece.item.id, placement });
  }

  const layout = { occupancy, items };
  baseLayoutCache.set(box.id, layout);
  return layout;
}

/** Occupancy of a box with its pictured contents plus the customer's extras. */
export function occupancyWith(box: GiftBox, extras: ExtraInstance[]): Occupancy {
  const occupancy = getBaseLayout(box).occupancy.clone();
  for (const extra of extras) {
    if (extra.placement) occupancy.mark(extra.placement);
  }
  return occupancy;
}

export interface CapacityInfo {
  totalCells: number;
  baseCells: number;
  extraCells: number;
  freeCells: number;
  /** 0–1 share of the box that is still free. */
  freeRatio: number;
}

export function getCapacity(box: GiftBox, extras: ExtraInstance[]): CapacityInfo {
  const base = getBaseLayout(box).occupancy;
  const total = base.totalCells;
  const baseCells = base.usedCells;
  const extraCells = extras.reduce(
    (sum, extra) => sum + (extra.placement ? extra.placement.w * extra.placement.d : 0),
    0,
  );
  const freeCells = Math.max(0, total - baseCells - extraCells);
  return { totalCells: total, baseCells, extraCells, freeCells, freeRatio: freeCells / total };
}

/**
 * Re-places extras into a (possibly different) box, in the order they were
 * added. Returns the extras that still fit and the ones that had to be left out.
 */
export function replaceExtras(
  box: GiftBox,
  extras: Pick<ExtraInstance, "key" | "itemId">[],
): { kept: ExtraInstance[]; dropped: Pick<ExtraInstance, "key" | "itemId">[] } {
  const occupancy = getBaseLayout(box).occupancy.clone();
  const kept: ExtraInstance[] = [];
  const dropped: Pick<ExtraInstance, "key" | "itemId">[] = [];
  const decorations = new Set<string>();

  for (const extra of extras) {
    const item = getItem(extra.itemId);
    if (!item || !item.available) {
      dropped.push(extra);
      continue;
    }
    if (item.placement === "decoration") {
      if (decorations.has(item.id)) {
        dropped.push(extra);
      } else {
        decorations.add(item.id);
        kept.push({ key: extra.key, itemId: extra.itemId, placement: null });
      }
      continue;
    }
    const placement = occupancy.findSpot(item);
    if (!placement) {
      dropped.push(extra);
      continue;
    }
    occupancy.mark(placement);
    kept.push({ key: extra.key, itemId: extra.itemId, placement });
  }
  return { kept, dropped };
}
