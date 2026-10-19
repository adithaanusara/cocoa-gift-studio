"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { ItemThumb } from "@/components/ui/ItemThumb";
import { WhatsAppOrderButton } from "@/components/ui/WhatsAppOrderButton";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { CapacityInfo } from "@/lib/packing";
import type { PriceBreakdown } from "@/lib/pricing";
import type { GiftBox, ScreenRect } from "@/lib/types";
import { buildOrderMessage } from "@/lib/whatsapp";
import { useBuilderStore } from "@/store/useBuilderStore";
import { CapacityMeter } from "./CapacityMeter";

interface CustomizationSummaryProps {
  box: GiftBox;
  price: PriceBreakdown;
  capacity: CapacityInfo;
  fits: Record<string, boolean>;
  note: string;
  className?: string;
}

function rectOf(el: Element | null): ScreenRect | undefined {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

export function CustomizationSummary({ box, price, capacity, fits, note, className }: CustomizationSummaryProps) {
  const addItem = useBuilderStore((state) => state.addItem);
  const removeOne = useBuilderStore((state) => state.removeOne);
  const removeAll = useBuilderStore((state) => state.removeAll);
  const clearExtras = useBuilderStore((state) => state.clearExtras);
  const setNote = useBuilderStore((state) => state.setNote);
  const [showContents, setShowContents] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const noteId = useId();
  const message = useMemo(() => buildOrderMessage(box, price, note), [box, price, note]);

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* selected box */}
      <section className="rounded-3xl border border-cocoa-900/8 bg-white/80 p-3">
        <div className="flex items-center gap-3">
          <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-2xl">
            <Image src={box.image} alt="" fill sizes="80px" className="object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-[0.6rem] text-gold-deep">Your gift box</p>
            <p className="font-display truncate text-xl font-semibold leading-tight text-cocoa-900">{box.name}</p>
            <p className="text-sm font-semibold tabular-nums text-cocoa-600">{formatPrice(box.price)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowContents((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-xs font-semibold text-cocoa-600 hover:bg-cocoa-900/5"
          aria-expanded={showContents}
        >
          What&apos;s already inside
          <ChevronDown className={cn("h-4 w-4 transition-transform", showContents && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {showContents && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-2 text-xs text-cocoa-600"
            >
              {box.contents.map((content) => (
                <li key={content.label} className="flex justify-between gap-2 border-b border-cocoa-900/5 py-1.5 last:border-0">
                  <span>{content.label}</span>
                  {content.qty !== undefined && <span className="tabular-nums text-cocoa-400">×{content.qty}</span>}
                </li>
              ))}
              <li className="py-1.5 text-[0.65rem] italic text-cocoa-400">As pictured in our photo.</li>
            </motion.ul>
          )}
        </AnimatePresence>
        <CapacityMeter capacity={capacity} className="mt-3 px-2 pb-1" />
      </section>

      {/* extras */}
      <section aria-labelledby="extras-heading">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="extras-heading" className="eyebrow text-[0.62rem] text-cocoa-500">
            Your extras {price.extraCount > 0 && <span className="text-cocoa-900">· {price.extraCount}</span>}
          </h2>
          {price.lines.length > 0 && (
            <button type="button" onClick={clearExtras} className="text-[0.7rem] font-semibold text-cocoa-400 hover:text-berry">
              Clear all
            </button>
          )}
        </div>
        <ul className="mt-2 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {price.lines.map((line) => {
              const isDecoration = line.item.placement === "decoration";
              return (
                <motion.li
                  key={line.item.id}
                  layout
                  initial={{ opacity: 0, x: 24, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, scale: 0.96, transition: { duration: 0.25 } }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  data-summary-item={line.item.id}
                  className="flex items-center gap-3 rounded-2xl border border-cocoa-900/8 bg-white/80 p-2"
                >
                  <ItemThumb item={line.item} className="h-12 w-12 shrink-0" sizes="48px" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8rem] font-semibold text-cocoa-900">{line.item.name}</p>
                    <p className="text-[0.7rem] tabular-nums text-cocoa-500">
                      {formatPrice(line.item.price)}
                      {line.item.priceIsPlaceholder && <span className="text-caramel"> · sample</span>}
                    </p>
                  </div>
                  {isDecoration ? (
                    <span className="text-[0.7rem] font-semibold text-cocoa-400">Added</span>
                  ) : (
                    <div className="flex items-center rounded-full bg-cocoa-900/5">
                      <button
                        type="button"
                        onClick={() => removeOne(line.item.id)}
                        className="grid h-8 w-8 place-items-center rounded-full text-cocoa-700 hover:bg-cocoa-900/10"
                        aria-label={`Remove one ${line.item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">{line.qty}</span>
                      <button
                        type="button"
                        onClick={(event) => addItem(line.item.id, rectOf(event.currentTarget.closest("li")?.querySelector("span") ?? null))}
                        disabled={!fits[line.item.id]}
                        className="grid h-8 w-8 place-items-center rounded-full text-cocoa-700 hover:bg-cocoa-900/10 disabled:opacity-30"
                        aria-label={`Add one more ${line.item.name}`}
                        title={fits[line.item.id] ? undefined : "No room left in this box"}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAll(line.item.id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-cocoa-400 hover:bg-berry/10 hover:text-berry"
                    aria-label={`Remove all ${line.item.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        {price.lines.length === 0 && (
          <p className="mt-2 rounded-2xl border border-dashed border-cocoa-900/15 px-4 py-5 text-center text-xs leading-relaxed text-cocoa-500">
            Your box is lovely as it is. Want more? Drag a chocolate onto the box or tap <strong>Add</strong>.
          </p>
        )}
      </section>

      <section>
        <label htmlFor={noteId} className="eyebrow block px-1 text-[0.62rem] text-cocoa-500">
          Note for us <span className="normal-case tracking-normal text-cocoa-400">(optional)</span>
        </label>
        <textarea
          id={noteId}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Delivery date, a name for the card, anything we should know…"
          className="mt-2 w-full resize-none rounded-2xl border border-cocoa-900/10 bg-white/80 px-4 py-3 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
        />
      </section>

      {/* totals */}
      <section className="grain relative overflow-hidden rounded-3xl bg-cocoa-900 p-5 text-ivory">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
        <dl className="relative space-y-2 text-sm">
          <div className="flex justify-between text-ivory/70">
            <dt>Gift box</dt>
            <dd className="tabular-nums">{formatPrice(price.base)}</dd>
          </div>
          <div className="flex justify-between text-ivory/70">
            <dt>
              Extras{price.extraCount > 0 && ` (${price.extraCount})`}
            </dt>
            <dd>
              <AnimatedPrice value={price.extrasTotal} />
            </dd>
          </div>
          <div className="hairline !my-3 opacity-60" />
          <div className="flex items-baseline justify-between">
            <dt className="eyebrow text-[0.62rem] text-champagne">Total</dt>
            <dd>
              <AnimatedPrice value={price.total} className="font-display text-4xl font-semibold text-gold-gradient" />
            </dd>
          </div>
        </dl>
        {price.hasPlaceholderPrices && (
          <p className="relative mt-2 text-[0.68rem] leading-relaxed text-ivory/50">
            Includes sample prices for extras. We&apos;ll confirm the final total on WhatsApp.
          </p>
        )}
        <WhatsAppOrderButton box={box} price={price} note={note} className="relative mt-4" />
        <button
          type="button"
          onClick={() => setShowMessage((v) => !v)}
          className="relative mt-3 flex w-full items-center justify-center gap-1 text-[0.7rem] font-semibold text-ivory/60 hover:text-ivory"
          aria-expanded={showMessage}
        >
          Preview the message <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showMessage && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {showMessage && (
            <motion.pre
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative mt-2 overflow-hidden whitespace-pre-wrap rounded-2xl bg-black/25 p-4 font-sans text-[0.72rem] leading-relaxed text-ivory/80"
            >
              {message}
            </motion.pre>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
