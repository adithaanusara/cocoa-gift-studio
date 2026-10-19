"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import type { CapacityInfo } from "@/lib/packing";

export function CapacityMeter({ capacity, className, tone = "light", legend = true }: { capacity: CapacityInfo; className?: string; tone?: "light" | "glass"; legend?: boolean }) {
  const base = (capacity.baseCells / capacity.totalCells) * 100;
  const extra = (capacity.extraCells / capacity.totalCells) * 100;
  const free = Math.round(capacity.freeRatio * 100);
  const almostFull = free <= 12;
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between text-[0.7rem] font-semibold">
        <span className={tone === "glass" ? "text-cocoa-700" : "text-cocoa-600"}>Space in your box</span>
        <span className={cn("tabular-nums", almostFull ? "text-berry" : "text-cocoa-800")}>
          {free === 0 ? "Full" : `${free}% free`}
        </span>
      </div>
      <div
        className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-cocoa-900/10"
        role="meter"
        aria-label="Box capacity used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={100 - free}
      >
        <motion.span className="h-full bg-cocoa-500" animate={{ width: `${base}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
        <motion.span
          className="h-full bg-gradient-to-r from-gold to-champagne"
          animate={{ width: `${extra}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {legend && (
      <div className="mt-1.5 flex gap-3 text-[0.62rem] text-cocoa-500">
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cocoa-500" /> Box contents</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gold" /> Your extras</span>
      </div>
      )}
    </div>
  );
}
