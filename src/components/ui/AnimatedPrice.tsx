"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Price that counts smoothly to its new value and glints when it changes. */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const from = previous.current;
    previous.current = value;
    if (from === value) return;
    if (reduceMotion) {
      node.textContent = formatPrice(value);
      return;
    }
    const controls = animate(from, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = formatPrice(latest);
      },
    });
    node.animate(
      [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(1.06)", filter: "brightness(1.25)" },
        { transform: "scale(1)", filter: "brightness(1)" },
      ],
      { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    return () => controls.stop();
  }, [value, reduceMotion]);

  return (
    <span
      ref={ref}
      className={cn("inline-block tabular-nums will-change-transform", className)}
      aria-live="polite"
      aria-atomic="true"
    >
      {formatPrice(value)}
    </span>
  );
}
