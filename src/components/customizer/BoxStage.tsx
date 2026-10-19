"use client";

import { AnimatePresence, motion } from "motion/react";
import { Box, Hand, LayoutGrid, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { StageControls } from "@/components/three/InteractiveGiftBox3D";
import { getItem } from "@/config/items";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { CapacityInfo } from "@/lib/packing";
import { stageBridge } from "@/lib/stageBridge";
import { useBuilderStore, useStageStore } from "@/store/useBuilderStore";
import { CapacityMeter } from "./CapacityMeter";
import { GiftBoxFlatView } from "./GiftBoxFlatView";

function StageLoading() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-24 w-32">
          <div className="kraft-surface absolute inset-x-0 bottom-0 h-16 animate-pulse rounded-md opacity-70" />
          <div className="absolute inset-x-[-6px] top-2 h-5 animate-[float_2.4s_ease-in-out_infinite] rounded-md bg-gradient-to-r from-champagne via-gold to-champagne" />
        </div>
        <p className="text-xs font-semibold tracking-wide text-cocoa-500">Preparing your gift box…</p>
      </div>
    </div>
  );
}

const InteractiveGiftBox3D = dynamic(() => import("@/components/three/InteractiveGiftBox3D"), {
  ssr: false,
  loading: StageLoading,
});

class StageErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("3D stage failed, showing the flat view instead.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function StageToasts() {
  const notice = useBuilderStore((state) => state.notice);
  const lastEvent = useBuilderStore((state) => state.lastEvent);
  const dismissNotice = useBuilderStore((state) => state.dismissNotice);
  const [added, setAdded] = useState<{ id: number; text: string } | null>(null);

  useEffect(
    () =>
      useBuilderStore.subscribe((state, prev) => {
        const event = state.lastEvent;
        if (!event || event === prev.lastEvent || event.type !== "add") return;
        const item = getItem(event.itemId);
        if (item) setAdded({ id: event.id, text: `${item.name} added · +${formatPrice(item.price)}` });
      }),
    [],
  );

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(dismissNotice, 4200);
    return () => window.clearTimeout(timer);
  }, [notice, dismissNotice]);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(null), 2200);
    return () => window.clearTimeout(timer);
  }, [added]);

  const showAdded = added && lastEvent?.type === "add";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center px-4 lg:top-20" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {notice ? (
          <motion.div
            key={`n${notice.id}`}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              "pointer-events-auto max-w-sm rounded-2xl px-4 py-2.5 text-center text-xs font-semibold shadow-[var(--shadow-lift)]",
              notice.tone === "warning" ? "bg-cocoa-900 text-champagne" : "bg-white text-cocoa-800",
            )}
            role="status"
          >
            {notice.text}
          </motion.div>
        ) : showAdded ? (
          <motion.div
            key={`a${added.id}`}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.55 } }}
            exit={{ opacity: 0, y: -8 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-cocoa-800 shadow-[var(--shadow-soft)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold-deep" /> {added.text}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface BoxStageProps {
  capacity: CapacityInfo;
  reduced: boolean;
  compact: boolean;
  className?: string;
}

/** The centre stage: 3D box (or flat fallback), view controls and feedback. */
export function BoxStage({ capacity, reduced, compact, className }: BoxStageProps) {
  const webgl = useWebGLSupport();
  const [view, setView] = useState<"3d" | "flat">("3d");
  const controls = useRef<StageControls | null>(null);
  const overDropZone = useStageStore((state) => state.overDropZone);
  const dragging = useStageStore((state) => state.dragItemId !== null);
  const setStageElement = useCallback((el: HTMLDivElement | null) => stageBridge.setElement(el), []);

  const use3D = webgl === true && view === "3d";
  const flat = <GiftBoxFlatView reduced={reduced} />;

  return (
    <div
      ref={setStageElement}
      className={cn(
        "relative isolate overflow-hidden bg-[radial-gradient(120%_90%_at_50%_10%,#fffaf2_0%,#f4ecdf_45%,#e6d6bd_100%)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_60%,rgb(201_163_91/0.18),transparent_70%)]" />

      {webgl === null ? <StageLoading /> : use3D ? (
        <StageErrorBoundary fallback={flat}>
          <InteractiveGiftBox3D reduced={reduced} compact={compact} controlsRef={controls} />
        </StageErrorBoundary>
      ) : (
        flat
      )}

      {/* drop zone outline while dragging */}
      <div
        className={cn(
          "pointer-events-none absolute inset-3 rounded-[2rem] border-2 border-dashed transition-all duration-300",
          dragging ? "opacity-100" : "opacity-0",
          overDropZone ? "border-gold bg-gold/5" : "border-cocoa-900/15",
        )}
      />

      <StageToasts />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3 lg:p-4">
        <p className="glass hidden items-center gap-2 rounded-full px-3.5 py-2 text-[0.7rem] font-semibold text-cocoa-600 shadow-sm sm:inline-flex">
          <Hand className="h-3.5 w-3.5" />
          {use3D ? (compact ? "Drag to rotate · pinch to zoom" : "Drag chocolates onto the box · drag the box to rotate") : "Tap a chocolate to add it"}
        </p>
        {webgl && (
          <div className="glass ml-auto flex rounded-full p-1 shadow-sm" role="radiogroup" aria-label="View">
            {(["3d", "flat"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={view === mode}
                onClick={() => setView(mode)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-semibold transition-colors",
                  view === mode ? "bg-cocoa-900 text-ivory" : "text-cocoa-600 hover:text-cocoa-900",
                )}
              >
                {mode === "3d" ? <Box className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                {mode === "3d" ? "3D" : "Top view"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* bottom bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 lg:p-4">
        <div className={cn("glass w-full rounded-2xl shadow-sm", compact ? "max-w-[11rem] px-3 py-2" : "max-w-[15rem] px-3.5 py-2.5")}>
          <CapacityMeter capacity={capacity} tone="glass" legend={!compact} />
        </div>
        {use3D && !compact && (
          <div className="glass flex shrink-0 flex-col overflow-hidden rounded-2xl shadow-sm">
            <button type="button" onClick={() => controls.current?.zoomIn()} className="grid h-9 w-9 place-items-center text-cocoa-700 hover:bg-white/70" aria-label="Zoom in">
              <Plus className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => controls.current?.zoomOut()} className="grid h-9 w-9 place-items-center text-cocoa-700 hover:bg-white/70" aria-label="Zoom out">
              <Minus className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => controls.current?.reset()} className="grid h-9 w-9 place-items-center border-t border-cocoa-900/10 text-cocoa-700 hover:bg-white/70" aria-label="Reset view">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
