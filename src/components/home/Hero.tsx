"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/buttonStyles";
import { lowestBoxPrice } from "@/config/giftBoxes";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { formatPrice } from "@/lib/format";

const Hero3D = dynamic(() => import("@/components/three/Hero3D"), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;

function HeroFallbackVisual() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-[8svh] lg:items-center lg:justify-end lg:pb-0 lg:pr-[8vw]">
      <div className="relative w-[78vw] max-w-[520px] rotate-[-4deg] animate-[float_7s_ease-in-out_infinite] lg:w-[38vw]">
        <div className="absolute -inset-10 rounded-full bg-gold/25 blur-3xl" />
        <Image
          src="/images/boxes/golden-heart-3000.jpg"
          alt="Golden Heart chocolate gift box"
          width={1390}
          height={1010}
          preload
          sizes="(min-width: 1024px) 38vw, 78vw"
          className="relative rounded-[1.5rem] shadow-[0_50px_90px_-30px_rgb(0_0_0/0.8)]"
        />
      </div>
    </div>
  );
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(true);
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLSupport();

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "100px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
      });
      tl.to(cue.current, { opacity: 0, y: 20, duration: 0.1 }, 0)
        .to(intro.current, { opacity: 0, y: -80, filter: "blur(10px)", duration: 0.32 }, 0.05)
        .fromTo(story.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.25 }, 0.42)
        .to(story.current, { opacity: 1, duration: 0.33 }, 0.67);
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="hero" ref={section} className={reduced ? "relative h-[100svh]" : "relative h-[230svh]"} aria-label="Introduction">
      <div className="grain sticky top-0 h-[100svh] overflow-hidden bg-cocoa-950 text-ivory">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_68%_45%,#5b341d_0%,#2b1910_45%,#130a06_100%)]" />
        <div className="pointer-events-none absolute left-[60%] top-[38%] h-[46vmax] w-[46vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[120px]" />

        <div className="absolute inset-0">
          {webgl === false ? <HeroFallbackVisual /> : webgl ? <Hero3D progress={progress} reduced={reduced} active={active} /> : null}
        </div>

        {/* intro copy */}
        <div ref={intro} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 pt-28 sm:px-6 lg:justify-center lg:px-8 lg:pt-0">
          <div className="max-w-xl">
            <motion.p
              className="eyebrow text-champagne/80"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.2 }}
            >
              Chocolate gift boxes · Sri Lanka
            </motion.p>
            <h1 className="font-display mt-5 text-[3.1rem] font-medium leading-[0.95] sm:text-7xl lg:text-[5.6rem]">
              {["A Little Box", "of "].map((line, i) => (
                <motion.span
                  key={line}
                  className={i === 0 ? "block" : "inline-block"}
                  initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.1, ease, delay: 0.35 + i * 0.12 }}
                >
                  {line}
                  {i === 1 && " "}
                </motion.span>
              ))}
              <motion.span
                className="text-gold-gradient inline-block pr-2 italic"
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.1, ease, delay: 0.6 }}
              >
                Happiness.
              </motion.span>
            </h1>
            <motion.p
              className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-ivory/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.85 }}
            >
              Choose a box, fill it with the chocolates they love and watch it come together in 3D. Then send your order in
              one WhatsApp message.
            </motion.p>
            <motion.div
              className="mt-9 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 1 }}
            >
              <Link href="/customize" className={buttonClass("gold", "lg")}>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Create Your Gift Box
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/#collection" className={buttonClass("ghost-light", "lg")}>
                Explore the boxes
              </Link>
            </motion.div>
            <motion.p
              className="mt-7 text-xs tracking-wide text-ivory/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.3 }}
            >
              Boxes from {formatPrice(lowestBoxPrice)} · No account needed · Order on WhatsApp
            </motion.p>
          </div>
        </div>

        {/* mid-scroll story */}
        {!reduced && (
          <div ref={story} className="pointer-events-none absolute inset-0 z-10 flex items-start px-4 pt-28 opacity-0 sm:px-6 lg:items-center lg:pt-0">
            <div className="mx-auto w-full max-w-7xl lg:px-8">
              <div className="max-w-md">
                <p className="eyebrow text-champagne/80">Lift the lid</p>
                <p className="font-display mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                  Every box,
                  <br />
                  <span className="text-gold-gradient italic">made yours.</span>
                </p>
                <ul className="mt-8 space-y-3 text-sm text-ivory/70">
                  {["Start with a box from our collection", "Add extra chocolates and little gifts", "See the price update as you go"].map((line, i) => (
                    <li key={line} className="flex items-center gap-3">
                      <span className="font-display grid h-7 w-7 place-items-center rounded-full border border-champagne/30 text-sm text-champagne">{i + 1}</span>
                      {line}
                    </li>
                  ))}
                </ul>
                <Link href="/customize" className={buttonClass("gold", "md", "pointer-events-auto mt-9")}>
                  Open the gift studio <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {!reduced && (
          <div ref={cue} className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-ivory/50">
            Scroll to open
            <span className="relative h-10 w-px overflow-hidden bg-ivory/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[float_2s_ease-in-out_infinite] bg-champagne" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
