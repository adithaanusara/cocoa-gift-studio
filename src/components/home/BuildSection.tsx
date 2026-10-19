"use client";

import { ArrowRight, Box, Hand, Layers, Receipt } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { buttonClass } from "@/components/ui/buttonStyles";
import { ItemThumb } from "@/components/ui/ItemThumb";
import { Reveal } from "@/components/ui/Reveal";
import { getGiftBox } from "@/config/giftBoxes";
import { getItem } from "@/config/items";

const demoBox = getGiftBox("classic-treat")!;
const demoSequence = ["snickers", "kitkat-4-finger", "dairy-milk", "mars"].map((id) => getItem(id)!).filter(Boolean);

const features = [
  { icon: Hand, title: "Drag, drop, done", text: "Drag on desktop, tap on mobile. Every chocolate flies into place." },
  { icon: Box, title: "A real 3D box", text: "Turn it, zoom in and look inside before you order." },
  { icon: Layers, title: "Only what fits", text: "The box knows its space, so what you see is what can be packed." },
  { icon: Receipt, title: "Live pricing", text: "The total updates the moment you add or remove something." },
];

/** A looping, self-playing preview of the gift studio. */
function StudioPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const timer = window.setInterval(() => setStep((s) => (s + 1) % (demoSequence.length + 2)), 1500);
    return () => window.clearInterval(timer);
  }, [inView, reduced]);

  const added = demoSequence.slice(0, Math.min(step, demoSequence.length));
  const total = demoBox.price + added.reduce((sum, item) => sum + item.price, 0);
  const flying = step < demoSequence.length ? demoSequence[step] : null;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-8 rounded-[3rem] bg-gold/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-[#fffaf2] to-[#efe2cd] p-5 shadow-[var(--shadow-lift)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-cocoa-500">{demoBox.name}</span>
          <span className="rounded-full bg-cocoa-900 px-3 py-1 text-xs text-ivory">
            <AnimatedPrice value={total} />
          </span>
        </div>
        <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl">
          <Image src={demoBox.image} alt="" fill sizes="(min-width: 1024px) 36rem, 90vw" className="object-cover" />
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
            <AnimatePresence>
              {added.map((item) => (
                <motion.span
                  key={item.id}
                  initial={{ opacity: 0, y: -60, scale: 0.4, rotate: -20 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="glass inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[0.68rem] font-semibold text-cocoa-800 shadow"
                >
                  <span className="relative h-6 w-6 overflow-hidden rounded-full">
                    {item.image && <Image src={item.image} alt="" fill sizes="24px" className="object-cover" />}
                  </span>
                  + {item.name}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {demoSequence.map((item) => {
            const isFlying = flying?.id === item.id;
            return (
              <motion.div
                key={item.id}
                animate={isFlying ? { y: [-0, -10, 0], scale: [1, 1.06, 1] } : { y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className={`relative aspect-square overflow-hidden rounded-xl ring-2 transition-colors ${isFlying ? "ring-gold" : "ring-transparent"}`}
              >
                <ItemThumb item={item} sizes="96px" className="h-full w-full" rounded="rounded-xl" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function BuildSection() {
  return (
    <section className="relative overflow-hidden bg-ivory py-24 sm:py-32" aria-labelledby="build-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Reveal>
            <p className="eyebrow text-gold-deep">The gift studio</p>
            <h2 id="build-heading" className="font-display mt-4 text-5xl font-medium leading-[1.02] sm:text-6xl">
              Build your <span className="italic text-cocoa-600">perfect gift</span>
            </h2>
            <p className="mt-5 max-w-lg text-cocoa-600">
              Our interactive studio lets you see your gift before it&apos;s packed. Add their favourites, move the box
              around, and know exactly what it costs.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={0.08 * index}>
                <feature.icon className="h-6 w-6 text-gold-deep" strokeWidth={1.5} />
                <h3 className="mt-3 font-semibold text-cocoa-900">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-cocoa-600">{feature.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} className="mt-10">
            <Link href="/customize" className={buttonClass("primary", "lg")}>
              Start building <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <StudioPreview />
        </Reveal>
      </div>
    </section>
  );
}
