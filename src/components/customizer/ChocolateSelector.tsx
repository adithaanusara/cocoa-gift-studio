"use client";

import gsap from "gsap";
import { Check, GripVertical, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { availableItems, itemCategories } from "@/config/items";
import { ItemThumb } from "@/components/ui/ItemThumb";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { stageBridge } from "@/lib/stageBridge";
import type { CatalogItem, ItemCategory, ScreenRect } from "@/lib/types";
import { useBuilderStore, useStageStore } from "@/store/useBuilderStore";

const DRAG_THRESHOLD = 6;

function rectOf(el: Element | null): ScreenRect | undefined {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

interface ItemCardProps {
  item: CatalogItem;
  qty: number;
  fits: boolean;
  layout: "grid" | "row";
  enableDrag: boolean;
}

function ItemCard({ item, qty, fits, layout, enableDrag }: ItemCardProps) {
  const addItem = useBuilderStore((state) => state.addItem);
  const setDrag = useStageStore((state) => state.setDrag);
  const setOverDropZone = useStageStore((state) => state.setOverDropZone);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; size: number } | null>(null);
  const dragState = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number; dragging: boolean; pointerId: number } | null>(null);
  const suppressClick = useRef(false);
  const isDecoration = item.placement === "decoration";
  const added = isDecoration && qty > 0;

  const add = () => addItem(item.id, rectOf(thumbRef.current));

  // Drag with the mouse or a pen; touch uses tap-to-add.
  const onPointerDown = (event: React.PointerEvent) => {
    if (!enableDrag || event.pointerType === "touch" || event.button !== 0 || !fits) return;
    const rect = thumbRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      dragging: false,
      pointerId: event.pointerId,
    };
  };

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const state = dragState.current;
      if (!state || event.pointerId !== state.pointerId) return;
      if (!state.dragging) {
        if (Math.hypot(event.clientX - state.startX, event.clientY - state.startY) < DRAG_THRESHOLD) return;
        state.dragging = true;
        setDrag(item.id);
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      }
      const size = Math.min(thumbRef.current?.offsetWidth ?? 96, 120);
      setGhost({ x: event.clientX - Math.min(state.offsetX, size / 2), y: event.clientY - Math.min(state.offsetY, size / 2), size });
      setOverDropZone(stageBridge.isPointInside(event.clientX, event.clientY));
    };
    const onUp = (event: PointerEvent) => {
      const state = dragState.current;
      if (!state || event.pointerId !== state.pointerId) return;
      dragState.current = null;
      if (!state.dragging) return;
      suppressClick.current = true;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const overStage = stageBridge.isPointInside(event.clientX, event.clientY);
      const ghostEl = ghostRef.current;
      setDrag(null);
      if (overStage && ghostEl) {
        addItem(item.id, rectOf(ghostEl));
        setGhost(null);
        return;
      }
      // Not dropped on the box: glide back to the card.
      const home = thumbRef.current?.getBoundingClientRect();
      if (ghostEl && home) {
        gsap.to(ghostEl, {
          left: home.left,
          top: home.top,
          opacity: 0,
          scale: 0.9,
          duration: 0.35,
          ease: "power3.out",
          onComplete: () => setGhost(null),
        });
      } else {
        setGhost(null);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [addItem, item.id, setDrag, setOverDropZone]);

  const onCardClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    add();
  };

  const status = !item.available ? "Unavailable" : added ? "Added" : fits ? null : "No room";

  return (
    <>
      <div
        data-item-card={item.id}
        onPointerDown={onPointerDown}
        className={cn(
          "group relative select-none rounded-2xl border bg-white/80 transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-luxe)]",
          fits ? "border-cocoa-900/8 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[var(--shadow-soft)]" : "border-cocoa-900/5 opacity-60",
          enableDrag && fits && "cursor-grab active:cursor-grabbing",
          layout === "grid" ? "p-2" : "flex items-center gap-3 p-2",
        )}
      >
        <button
          type="button"
          onClick={onCardClick}
          disabled={!fits}
          className="absolute inset-0 z-10 rounded-2xl"
          aria-label={fits ? `Add ${item.name} to the box, ${formatPrice(item.price)}` : `${item.name}: ${status}`}
        />
        <span
          ref={thumbRef}
          className={cn("relative block shrink-0", layout === "grid" ? "aspect-[4/3] w-full" : "h-16 w-16")}
        >
          <ItemThumb item={item} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 160px, 45vw" />
          {qty > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-cocoa-900 px-1.5 text-[11px] font-bold text-ivory shadow">
              {isDecoration ? <Check className="h-3.5 w-3.5" /> : `×${qty}`}
            </span>
          )}
          {enableDrag && fits && layout === "grid" && (
            <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/80 text-cocoa-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              <GripVertical className="h-3.5 w-3.5" />
            </span>
          )}
        </span>
        <div className={cn("min-w-0", layout === "grid" ? "px-1 pb-1 pt-2.5" : "flex-1")}>
          <p className="truncate text-[0.82rem] font-semibold text-cocoa-900">{item.name}</p>
          <p className="mt-0.5 line-clamp-1 text-[0.7rem] text-cocoa-500">{item.description}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[0.82rem] font-bold tabular-nums text-cocoa-800">
              {formatPrice(item.price)}
              {item.priceIsPlaceholder && <span className="ml-1 align-top text-[0.6rem] font-semibold text-caramel">*</span>}
            </span>
            {status ? (
              <span className="rounded-full bg-cocoa-900/5 px-2 py-0.5 text-[0.65rem] font-semibold text-cocoa-500">{status}</span>
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cocoa-900 text-ivory transition-transform duration-300 group-hover:scale-110 group-hover:bg-gold-deep">
                <Plus className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </div>
      {ghost &&
        createPortal(
          <div
            ref={ghostRef}
            className="pointer-events-none fixed z-[90] rounded-2xl bg-white p-1 shadow-[0_30px_60px_-15px_rgb(43_25_16/0.6),0_0_0_1px_rgb(201_163_91/0.6)]"
            style={{ left: ghost.x, top: ghost.y, width: ghost.size, height: ghost.size, transform: "rotate(-6deg) scale(1.06)" }}
          >
            <ItemThumb item={item} className="h-full w-full" sizes="120px" />
          </div>,
          document.body,
        )}
    </>
  );
}

interface ChocolateSelectorProps {
  quantities: Record<string, number>;
  fits: Record<string, boolean>;
  enableDrag: boolean;
  className?: string;
  layout?: "grid" | "row";
}

export function ChocolateSelector({ quantities, fits, enableDrag, className, layout = "grid" }: ChocolateSelectorProps) {
  const [category, setCategory] = useState<ItemCategory | "all">("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availableItems.filter(
      (item) =>
        (category === "all" || item.category === category) &&
        (!q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)),
    );
  }, [category, query]);
  const anyPlaceholder = availableItems.some((item) => item.priceIsPlaceholder);

  return (
    <div className={cn("flex flex-col", className)}>
      <label className="relative block">
        <span className="sr-only">Search chocolates and gifts</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chocolates…"
          className="h-11 w-full rounded-full border border-cocoa-900/10 bg-white/80 pl-10 pr-4 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
        />
      </label>
      <div className="scrollbar-none -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Categories">
        {itemCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={category === cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              category === cat.id ? "bg-cocoa-900 text-ivory" : "bg-cocoa-900/5 text-cocoa-600 hover:bg-cocoa-900/10",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className={cn("mt-4 grid gap-2.5", layout === "grid" ? "grid-cols-2" : "grid-cols-1")}>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            qty={quantities[item.id] ?? 0}
            fits={fits[item.id] ?? false}
            layout={layout}
            enableDrag={enableDrag}
          />
        ))}
        {!items.length && (
          <p className="col-span-full rounded-2xl bg-cocoa-900/5 p-6 text-center text-sm text-cocoa-500">
            Nothing matches “{query}”.
          </p>
        )}
      </div>
      {anyPlaceholder && (
        <p className="mt-4 text-[0.7rem] leading-relaxed text-cocoa-500">
          <span className="font-semibold text-caramel">*</span> Sample price — the final price is confirmed with you on WhatsApp.
        </p>
      )}
    </div>
  );
}
