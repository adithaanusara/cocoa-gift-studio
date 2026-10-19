/** Shared domain types for gift boxes, extra items and the box builder. */

export type ItemCategory = "chocolate" | "premium" | "sweets" | "gift";

/** Visual recipe used to draw a lightweight 3D stand-in for a product. */
export type ItemModel =
  | {
      kind: "wrapper";
      /** Base wrapper colour. */
      color: string;
      /** Darker shade for gradients / crimped ends. */
      shade: string;
      /** Which printed label design to paint on the wrapper. */
      label: "dairy-milk" | "kitkat" | "snickers" | "mars";
      /** Metallic foil sheen (0–1). */
      foil?: number;
    }
  | {
      kind: "heart";
      /** Text on the heart-shaped label. */
      label: string;
      sublabel?: string;
      /** Number of foil-wrapped pieces visible inside. */
      pieces: number;
      ribbon?: boolean;
    }
  | { kind: "carton"; label: "dubai-kunafa" }
  | {
      kind: "sachet";
      color: string;
      accent: string;
      label: string;
    }
  | { kind: "card" }
  | { kind: "ribbon"; color: string };

export interface CatalogItem {
  id: string;
  name: string;
  /** Short line under the name in the selector. */
  description: string;
  category: ItemCategory;
  /** Price in LKR for one unit. */
  price: number;
  /** True until the business owner confirms the real selling price. */
  priceIsPlaceholder: boolean;
  /** Photo in /public, cropped from the owner's reference photos. */
  image?: string;
  /** Whether customers can add it right now. */
  available: boolean;
  /**
   * "inside" items take up space on the box floor (see `footprint`).
   * "decoration" items are added to the outside of the box (e.g. a ribbon)
   * and do not use capacity. Each decoration can be added once.
   */
  placement: "inside" | "decoration";
  /** Size on the box floor in 2 cm grid cells (width × depth). */
  footprint: { w: number; d: number };
  /** Approximate height in centimetres, used by the 3D view. */
  heightCm: number;
  model: ItemModel;
}

export interface BoxContent {
  label: string;
  /** Only set where the count is clearly visible in the reference photo. */
  qty?: number;
  /** Links the content to a catalog item so the 3D view can draw it. */
  itemId?: string;
}

export interface GiftBox {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Base price in LKR, taken from the price tag in the reference photo. */
  price: number;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  badge?: string;
  /** What the photo shows inside the box. */
  contents: BoxContent[];
  /**
   * Interior floor in 2 cm grid cells, with how many layers can be stacked.
   * Capacity = cols × rows × layers cells; the pictured contents use part of it.
   */
  grid: { cols: number; rows: number; layers: number };
  /** Colour of the shredded-paper filler seen in the photo. */
  fillerColor: string;
}

/** A position on the box floor grid. */
export interface Placement {
  col: number;
  row: number;
  layer: number;
  /** Footprint after rotation. */
  w: number;
  d: number;
  rotated: boolean;
}

/** One physical extra item inside the customer's box. */
export interface ExtraInstance {
  key: string;
  itemId: string;
  /** Null for decorations, which sit outside the grid. */
  placement: Placement | null;
}

export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
