"use client";

import Image from "next/image";
import { giftBoxes } from "@/config/giftBoxes";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useBuilderStore } from "@/store/useBuilderStore";

export function BoxPicker({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const boxId = useBuilderStore((state) => state.boxId);
  const selectBox = useBuilderStore((state) => state.selectBox);
  return (
    <div className={cn("scrollbar-none flex gap-2 overflow-x-auto [mask-image:linear-gradient(90deg,black_90%,transparent)]", className)} role="radiogroup" aria-label="Choose your gift box">
      {giftBoxes.map((box) => {
        const selected = box.id === boxId;
        return (
          <button
            key={box.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => selectBox(box.id)}
            className={cn(
              "group flex shrink-0 last:mr-8 items-center gap-2.5 rounded-full border py-1 pl-1 pr-4 text-left transition-all duration-300",
              selected
                ? "border-gold bg-white shadow-[var(--shadow-glow)]"
                : "border-cocoa-900/10 bg-white/60 hover:border-cocoa-900/25 hover:bg-white",
            )}
          >
            <span className={cn("relative overflow-hidden rounded-full", size === "sm" ? "h-8 w-8" : "h-10 w-10")}>
              <Image src={box.image} alt="" fill sizes="40px" className="object-cover" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className={cn("font-semibold text-cocoa-900", size === "sm" ? "text-[0.72rem]" : "text-xs")}>{box.name}</span>
              <span className="text-[0.68rem] tabular-nums text-cocoa-500">{formatPrice(box.price)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
