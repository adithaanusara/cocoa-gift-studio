import { getItem } from "@/config/items";
import type { CatalogItem, ExtraInstance, GiftBox } from "./types";

export interface PriceLine {
  item: CatalogItem;
  qty: number;
  lineTotal: number;
}

export interface PriceBreakdown {
  base: number;
  lines: PriceLine[];
  extrasTotal: number;
  total: number;
  extraCount: number;
  hasPlaceholderPrices: boolean;
}

/** Groups extra instances into item lines, keeping the order items were first added. */
export function groupExtras(extras: Pick<ExtraInstance, "itemId">[]): { item: CatalogItem; qty: number }[] {
  const counts = new Map<string, number>();
  for (const extra of extras) {
    counts.set(extra.itemId, (counts.get(extra.itemId) ?? 0) + 1);
  }
  const lines: { item: CatalogItem; qty: number }[] = [];
  for (const [itemId, qty] of counts) {
    const item = getItem(itemId);
    if (item) lines.push({ item, qty });
  }
  return lines;
}

/** Final price = base gift box price + total price of extra items. */
export function calculatePrice(box: GiftBox, extras: Pick<ExtraInstance, "itemId">[]): PriceBreakdown {
  const lines = groupExtras(extras).map(({ item, qty }) => ({
    item,
    qty,
    lineTotal: item.price * qty,
  }));
  const extrasTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return {
    base: box.price,
    lines,
    extrasTotal,
    total: box.price + extrasTotal,
    extraCount: lines.reduce((sum, line) => sum + line.qty, 0),
    hasPlaceholderPrices: lines.some((line) => line.item.priceIsPlaceholder),
  };
}
