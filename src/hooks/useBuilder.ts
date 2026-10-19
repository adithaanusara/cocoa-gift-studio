"use client";

import { useMemo } from "react";
import { defaultBoxId, getGiftBox } from "@/config/giftBoxes";
import { catalogItems } from "@/config/items";
import { getCapacity, occupancyWith } from "@/lib/packing";
import { calculatePrice } from "@/lib/pricing";
import { useBuilderStore } from "@/store/useBuilderStore";

/** Derived builder data: the selected box, price, capacity and what still fits. */
export function useBuilder() {
  const boxId = useBuilderStore((state) => state.boxId);
  const extras = useBuilderStore((state) => state.extras);
  const note = useBuilderStore((state) => state.note);
  const box = getGiftBox(boxId) ?? getGiftBox(defaultBoxId)!;

  const price = useMemo(() => calculatePrice(box, extras), [box, extras]);
  const capacity = useMemo(() => getCapacity(box, extras), [box, extras]);
  const fits = useMemo(() => {
    const occupancy = occupancyWith(box, extras);
    const map: Record<string, boolean> = {};
    for (const item of catalogItems) {
      map[item.id] =
        item.available &&
        (item.placement === "decoration"
          ? !extras.some((extra) => extra.itemId === item.id)
          : occupancy.findSpot(item) !== null);
    }
    return map;
  }, [box, extras]);
  const quantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const extra of extras) map[extra.itemId] = (map[extra.itemId] ?? 0) + 1;
    return map;
  }, [extras]);

  return { box, extras, note, price, capacity, fits, quantities };
}
