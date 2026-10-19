"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { ChevronUp, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { buttonClass } from "@/components/ui/buttonStyles";
import { getGiftBox } from "@/config/giftBoxes";
import { useBuilder } from "@/hooks/useBuilder";
import { useCoarsePointer, useIsDesktop, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { useBuilderStore } from "@/store/useBuilderStore";
import { BoxPicker } from "./BoxPicker";
import { BoxStage } from "./BoxStage";
import { ChocolateSelector } from "./ChocolateSelector";
import { CustomizationSummary } from "./CustomizationSummary";
import { FlyingChocolateAnimation } from "./FlyingChocolateAnimation";

/** Restores the saved box, then applies ?box= from the URL. */
function useHydrateBuilder() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("box");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(useBuilderStore.persist.rehydrate()).finally(() => {
      if (cancelled) return;
      if (requested && getGiftBox(requested)) useBuilderStore.getState().selectBox(requested);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [requested]);

  return ready;
}

export function GiftBoxCustomizer() {
  const ready = useHydrateBuilder();
  const { box, note, price, capacity, fits, quantities } = useBuilder();
  const isDesktop = useIsDesktop();
  const coarse = useCoarsePointer();
  const reduced = usePrefersReducedMotion();
  const [sheetOpen, setSheetOpen] = useState(false);
  const dragControls = useDragControls();

  // The sheet only exists in the mobile layout.
  const sheetVisible = sheetOpen && !isDesktop;

  useEffect(() => {
    if (!sheetVisible) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetVisible]);

  const summary = <CustomizationSummary box={box} price={price} capacity={capacity} fits={fits} note={note} />;

  return (
    <div className={cn("transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}>
      <FlyingChocolateAnimation reduced={reduced} />

      {/* Only one layout is mounted so there is only ever one WebGL canvas. */}
      {isDesktop ? (
      /* Desktop studio: selector | stage | summary */
      <div className="grid h-[100svh] grid-cols-[minmax(300px,340px)_1fr_minmax(340px,380px)] pt-16">
        <aside className="scrollbar-soft flex flex-col overflow-y-auto border-r border-cocoa-900/8 bg-ivory px-5 pb-8 pt-6" aria-label="Chocolates and gifts">
          <p className="eyebrow text-[0.62rem] text-gold-deep">Step 2 · Add favourites</p>
          <h1 className="font-display mt-1 text-3xl font-semibold leading-tight">Fill your box</h1>
          <p className="mt-1 text-xs text-cocoa-500">Drag onto the box, or click to add.</p>
          <ChocolateSelector className="mt-5" quantities={quantities} fits={fits} enableDrag={!coarse} />
        </aside>

        <section className="relative flex min-h-0 flex-col" aria-label="Your gift box">
          <div className="border-b border-cocoa-900/8 bg-ivory/80 px-4 py-3">
            <p className="eyebrow mb-2 text-[0.6rem] text-gold-deep">Step 1 · Choose a box</p>
            <BoxPicker />
          </div>
          <BoxStage capacity={capacity} reduced={reduced} compact={false} className="min-h-0 flex-1" />
        </section>

        <aside className="scrollbar-soft overflow-y-auto border-l border-cocoa-900/8 bg-ivory px-5 pb-8 pt-6" aria-label="Order summary">
          <p className="eyebrow mb-4 text-[0.62rem] text-gold-deep">Step 3 · Review &amp; order</p>
          {summary}
        </aside>
      </div>

      ) : (
      /* Mobile studio: sticky stage, items below, price bar + summary sheet */
      <div>
        <div className="sticky top-16 z-20 mt-16 border-b border-cocoa-900/8 shadow-[0_10px_30px_-20px_rgb(43_25_16/0.5)]">
          <BoxStage capacity={capacity} reduced={reduced} compact className="h-[44svh] min-h-[300px]" />
        </div>
        <div className="px-4 pb-36 pt-5">
          <p className="eyebrow text-[0.6rem] text-gold-deep">Step 1 · Choose a box</p>
          <BoxPicker className="-mx-4 mt-2 px-4 pb-1" size="sm" />
          <p className="eyebrow mt-6 text-[0.6rem] text-gold-deep">Step 2 · Tap to add</p>
          <h1 className="font-display mt-1 text-3xl font-semibold">Fill your box</h1>
          <ChocolateSelector className="mt-4" quantities={quantities} fits={fits} enableDrag={false} />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 bg-ivory/97 backdrop-blur-md border-t border-cocoa-900/10 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSheetOpen(true)} className="flex min-w-0 flex-1 flex-col text-left" aria-label="Show order summary">
              <span className="flex items-center gap-1 text-[0.68rem] font-semibold text-cocoa-500">
                {box.name}
                {price.extraCount > 0 && ` + ${price.extraCount} extra${price.extraCount === 1 ? "" : "s"}`}
                <ChevronUp className="h-3.5 w-3.5" />
              </span>
              <AnimatedPrice value={price.total} className="font-display text-[1.7rem] font-semibold leading-none text-cocoa-900" />
            </button>
            <button type="button" onClick={() => setSheetOpen(true)} className={buttonClass("primary", "md", "shrink-0")}>
              Review &amp; order
            </button>
          </div>
        </div>

        <AnimatePresence>
          {sheetVisible && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-cocoa-950/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Order summary"
                className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88svh] flex-col rounded-t-[2rem] bg-ivory shadow-[0_-20px_60px_-20px_rgb(0_0_0/0.5)]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 120 || info.velocity.y > 600) setSheetOpen(false);
                }}
              >
                <div className="flex cursor-grab touch-none justify-center px-5 pb-2 pt-3" onPointerDown={(event) => dragControls.start(event)}>
                  <span className="h-1.5 w-12 rounded-full bg-cocoa-900/15" />
                </div>
                <div className="flex items-center justify-between px-5 pb-3">
                  <p className="font-display text-2xl font-semibold">Your gift box</p>
                  <button type="button" onClick={() => setSheetOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-cocoa-900/5" aria-label="Close summary">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-y-auto overscroll-contain px-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]">{summary}</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      )}
    </div>
  );
}
