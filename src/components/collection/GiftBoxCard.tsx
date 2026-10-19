"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { GiftBox } from "@/lib/types";

export function GiftBoxCard({ box, large = false, className }: { box: GiftBox; large?: boolean; className?: string }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 180, damping: 18 });
  const sheenX = useTransform(px, [0, 1], ["0%", "100%"]);
  const sheenY = useTransform(py, [0, 1], ["0%", "100%"]);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${sheenX} ${sheenY}, rgb(255 244 220 / 0.35), transparent 45%)`;

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const shown = box.contents.slice(0, large ? 5 : 3);
  const more = box.contents.length - shown.length;

  return (
    <motion.article
      className={cn("group relative [perspective:1200px]", className)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-cocoa-900/8 bg-white shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]"
      >
        <Link href={`/boxes/${box.id}`} className="relative block overflow-hidden" aria-label={`View details of the ${box.name}`}>
          <div className={cn("relative w-full", large ? "aspect-[16/10]" : "aspect-[4/3]")}>
            <Image
              src={box.image}
              alt={box.imageAlt}
              fill
              sizes={large ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 32vw, (min-width: 768px) 50vw, 100vw"}
              className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/55 via-transparent to-transparent" />
            <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: sheen }} />
          </div>
          {box.badge && (
            <span className="glass-dark absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-champagne">
              <Sparkles className="h-3 w-3" /> {box.badge}
            </span>
          )}
          <span className="absolute bottom-4 left-4 rounded-full bg-ivory/95 px-4 py-2 text-sm font-bold tabular-nums text-cocoa-900 shadow-lg">
            {formatPrice(box.price)}
          </span>
          <span className="absolute bottom-4 right-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-ivory/95 text-cocoa-900 opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>

        <div className="flex flex-1 flex-col p-6">
          <h3 className={cn("font-display font-semibold leading-tight text-cocoa-900", large ? "text-3xl" : "text-[1.7rem]")}>{box.name}</h3>
          <p className="mt-1 text-sm text-cocoa-500">{box.tagline}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Contents">
            {shown.map((content) => (
              <li key={content.label} className="rounded-full bg-cream px-2.5 py-1 text-[0.7rem] font-medium text-cocoa-600">
                {content.qty ? `${content.qty}× ` : ""}
                {content.label}
              </li>
            ))}
            {more > 0 && <li className="rounded-full px-2 py-1 text-[0.7rem] font-semibold text-cocoa-400">+{more} more</li>}
          </ul>
          <div className="mt-auto flex gap-2 pt-6">
            <Link href={`/boxes/${box.id}`} className={buttonClass("ghost", "md", "flex-1")}>
              View details
            </Link>
            <Link href={`/customize?box=${box.id}`} className={buttonClass("primary", "md", "flex-1")}>
              Customize box
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}
