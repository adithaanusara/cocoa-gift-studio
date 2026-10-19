"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { giftBoxes } from "@/config/giftBoxes";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { GiftBoxCard } from "./GiftBoxCard";

const budgets = [
  { id: "all", label: "All boxes", test: () => true },
  { id: "under-2500", label: `Under ${formatPrice(2500)}`, test: (p: number) => p < 2500 },
  { id: "2500-4999", label: `${formatPrice(2500)} – ${formatPrice(4999)}`, test: (p: number) => p >= 2500 && p < 5000 },
  { id: "5000-up", label: `${formatPrice(5000)} & up`, test: (p: number) => p >= 5000 },
] as const;

export function GiftBoxCollection() {
  const [budget, setBudget] = useState<(typeof budgets)[number]["id"]>("all");
  const sorted = useMemo(() => [...giftBoxes].sort((a, b) => a.price - b.price), []);
  const active = budgets.find((b) => b.id === budget)!;
  const boxes = sorted.filter((box) => active.test(box.price));
  const showcase = budget === "all" && boxes.length === 5;

  return (
    <section id="collection" className="relative scroll-mt-16 bg-ivory py-24 sm:py-32" aria-labelledby="collection-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-gold-deep">The collection</p>
            <h2 id="collection-heading" className="font-display mt-4 text-5xl font-medium leading-[1.02] sm:text-6xl">
              Explore our <span className="italic text-cocoa-600">gift boxes</span>
            </h2>
            <p className="mt-5 max-w-lg text-cocoa-600">
              Every box arrives packed and ready to gift. Pick one as it is, or make it yours with extra chocolates in the
              gift studio.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="radiogroup" aria-label="Filter by budget">
              {budgets.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={budget === b.id}
                  onClick={() => setBudget(b.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300",
                    budget === b.id
                      ? "border-cocoa-900 bg-cocoa-900 text-ivory"
                      : "border-cocoa-900/12 text-cocoa-600 hover:border-cocoa-900/30",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <motion.div layout className={cn("mt-14 grid gap-6", showcase ? "md:grid-cols-2 lg:grid-cols-6" : "md:grid-cols-2 lg:grid-cols-3")}>
          <AnimatePresence mode="popLayout">
            {boxes.map((box, index) => (
              <motion.div
                key={box.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(showcase && (index < 3 ? "lg:col-span-2" : "lg:col-span-3"), showcase && index === 2 && "md:col-span-2 lg:col-span-2")}
              >
                <GiftBoxCard box={box} large={showcase && index >= 3} className="h-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {!boxes.length && <p className="mt-14 text-center text-cocoa-500">No boxes in this range yet.</p>}
      </div>
    </section>
  );
}
