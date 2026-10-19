"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { defaultBoxId, getGiftBox } from "@/config/giftBoxes";
import { getItem } from "@/config/items";
import { ItemThumb } from "@/components/ui/ItemThumb";
import { getBaseLayout } from "@/lib/packing";
import { stageBridge } from "@/lib/stageBridge";
import type { Placement } from "@/lib/types";
import { useBuilderStore } from "@/store/useBuilderStore";

/**
 * Top-down view of the box. Used when WebGL isn't available and as the
 * optional "flat" view. It draws the same grid placements as the 3D scene.
 */
export function GiftBoxFlatView({ reduced }: { reduced: boolean }) {
  const boxId = useBuilderStore((state) => state.boxId);
  const extras = useBuilderStore((state) => state.extras);
  const box = getGiftBox(boxId) ?? getGiftBox(defaultBoxId)!;
  const frame = useRef<HTMLDivElement>(null);
  const { cols, rows } = box.grid;

  const pieces = useMemo(() => {
    const all = [
      ...getBaseLayout(box).items.map((piece) => ({ ...piece, isExtra: false })),
      ...extras.flatMap((extra) =>
        extra.placement ? [{ key: extra.key, itemId: extra.itemId, placement: extra.placement, isExtra: true }] : [],
      ),
    ];
    return all.sort((a, b) => a.placement.layer - b.placement.layer);
  }, [box, extras]);
  const hasRibbon = extras.some((extra) => getItem(extra.itemId)?.model.kind === "ribbon");

  useEffect(() => {
    const project = (placement: Placement | null) => {
      const el = frame.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (!placement) return { x: rect.left + rect.width / 2, y: rect.bottom - 10 };
      return {
        x: rect.left + ((placement.col + placement.w / 2) / cols) * rect.width,
        y: rect.top + ((placement.row + placement.d / 2) / rows) * rect.height,
      };
    };
    return stageBridge.setProjector(project);
  }, [cols, rows]);

  return (
    <div className="flex h-full w-full items-center justify-center p-6 sm:p-10">
      <div
        className="kraft-surface relative w-full rounded-[10px] p-[2.2%] shadow-[0_40px_80px_-30px_rgb(43_25_16/0.55),inset_0_0_0_2px_rgb(255_255_255/0.15)]"
        style={{ aspectRatio: `${cols} / ${rows}`, maxHeight: "100%", maxWidth: `min(100%, calc((100svh - 18rem) * ${cols / rows}))` }}
      >
        <div
          ref={frame}
          className="relative h-full w-full rounded-[4px] shadow-[inset_0_6px_18px_rgb(60_35_15/0.45)]"
          style={{ background: `radial-gradient(circle at 50% 40%, ${box.fillerColor}55, ${box.fillerColor}22 70%), #a9825a` }}
        >
          <AnimatePresence>
            {pieces.map((piece) => {
              const item = getItem(piece.itemId);
              if (!item) return null;
              const p = piece.placement;
              return (
                <motion.div
                  key={piece.key}
                  className="absolute p-[0.6%]"
                  style={{
                    left: `${(p.col / cols) * 100}%`,
                    top: `${(p.row / rows) * 100}%`,
                    width: `${(p.w / cols) * 100}%`,
                    height: `${(p.d / rows) * 100}%`,
                    zIndex: p.layer + 1,
                  }}
                  initial={reduced ? false : { opacity: 0, scale: 0.6, y: -40 }}
                  animate={{ opacity: 1, scale: 1, y: p.layer ? -3 : 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: -50 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: piece.isExtra && !reduced ? 0.5 : 0 }}
                >
                  <div className="relative h-full w-full">
                    <div
                      className="absolute left-1/2 top-1/2"
                      style={{
                        width: p.rotated ? `${(p.d / p.w) * 100}%` : "100%",
                        height: p.rotated ? `${(p.w / p.d) * 100}%` : "100%",
                        transform: `translate(-50%, -50%) rotate(${p.rotated ? 90 : 0}deg)`,
                      }}
                    >
                      <ItemThumb
                        item={item}
                        rounded="rounded-[3px]"
                        fit="cover"
                        className="h-full w-full shadow-[0_6px_12px_-4px_rgb(30_15_5/0.6)]"
                        sizes="120px"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {hasRibbon && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[7%] -translate-y-1/2 bg-gradient-to-b from-[#b02a3e] via-[#8c1d2c] to-[#6d1420] opacity-90 shadow-lg" />
        )}
      </div>
    </div>
  );
}
