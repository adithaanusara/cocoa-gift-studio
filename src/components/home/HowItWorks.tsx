"use client";

import { Gift, MessageCircleHeart, MousePointerClick } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    icon: Gift,
    title: "Choose your box",
    text: "Start from one of our ready-made gift boxes, whatever your budget.",
  },
  {
    icon: MousePointerClick,
    title: "Make it yours",
    text: "Drag in extra chocolates and little gifts. Watch them land in the box and see the price update.",
  },
  {
    icon: MessageCircleHeart,
    title: "Order on WhatsApp",
    text: "We write the order message for you. Send it, and we'll confirm availability and delivery.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="how-it-works" className="scroll-mt-16 bg-cream py-24 sm:py-32" aria-labelledby="how-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-gold-deep">How it works</p>
          <h2 id="how-heading" className="font-display mt-4 text-5xl font-medium leading-[1.02] sm:text-6xl">
            Three steps to <span className="italic text-cocoa-600">a happy face</span>
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-20">
          <div className="absolute left-[16.66%] right-[16.66%] top-10 hidden h-px bg-cocoa-900/10 md:block">
            <motion.div className="h-full origin-left bg-gradient-to-r from-gold via-champagne to-gold" style={{ scaleX: line }} />
          </div>
          <div role="list" className="grid gap-14 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <Reveal key={step.title} role="listitem" delay={index * 0.12} className="relative flex flex-col items-center text-center">
                  <span className="relative grid h-20 w-20 place-items-center rounded-full bg-ivory shadow-[var(--shadow-soft)] ring-1 ring-gold/30">
                    <step.icon className="h-8 w-8 text-cocoa-700" strokeWidth={1.4} />
                    <span className="font-display absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-cocoa-900 text-base text-champagne">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="font-display mt-7 text-3xl font-semibold">{step.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-cocoa-600">{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
