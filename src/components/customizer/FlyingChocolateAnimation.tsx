"use client";

import gsap from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getItem } from "@/config/items";
import { ItemThumb } from "@/components/ui/ItemThumb";
import { FLIGHT_MS, LIFT_OUT_MS, stageBridge } from "@/lib/stageBridge";
import type { Placement, ScreenRect } from "@/lib/types";
import { useBuilderStore } from "@/store/useBuilderStore";

type Flight =
  | { id: number; direction: "in"; itemId: string; from: ScreenRect; placement: Placement | null }
  | { id: number; direction: "out"; itemId: string; placement: Placement | null };

function visibleRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
  return visible ? rect : null;
}

function quadratic(p0: number, p1: number, p2: number, t: number) {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

function FlightSprite({ flight, onDone }: { flight: Flight; onDone: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const item = getItem(flight.itemId);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !item) {
      onDone(flight.id);
      return;
    }

    if (flight.direction === "in") {
      const { from } = flight;
      const size = Math.min(from.width, from.height, 132);
      const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
      const end = stageBridge.project(flight.placement) ?? start;
      const control = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - Math.max(120, Math.abs(end.x - start.x) * 0.25) };
      const spin = end.x > start.x ? 22 : -22;
      gsap.set(el, { width: size, height: size, x: start.x - size / 2, y: start.y - size / 2, opacity: 1 });

      const proxy = { t: 0 };
      const tl = gsap.timeline({ onComplete: () => onDone(flight.id) });
      tl.to(el, { scale: 1.12, rotation: -7, y: `-=18`, duration: 0.16, ease: "power2.out" });
      tl.to(proxy, {
        t: 1,
        duration: (FLIGHT_MS - 160) / 1000,
        ease: "power2.inOut",
        onUpdate: () => {
          const t = proxy.t;
          const x = quadratic(start.x, control.x, end.x, t);
          const y = quadratic(start.y - 18, control.y, end.y, t);
          gsap.set(el, {
            x: x - size / 2,
            y: y - size / 2,
            scale: 1.12 - t * 0.78,
            rotation: -7 + t * spin,
            opacity: t > 0.82 ? 1 - (t - 0.82) / 0.18 : 1,
          });
        },
      });
      return () => {
        tl.kill();
      };
    }

    // Reverse: rise out of the box and fly back to the card or summary row.
    const start = stageBridge.project(flight.placement);
    const target =
      visibleRect(`[data-item-card="${flight.itemId}"]`) ?? visibleRect(`[data-summary-item="${flight.itemId}"]`);
    if (!start || !target) {
      onDone(flight.id);
      return;
    }
    const size = Math.min(target.width, target.height, 110);
    const end = { x: target.left + target.width / 2, y: target.top + target.height / 2 };
    const control = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 140 };
    gsap.set(el, { width: size, height: size, x: start.x - size / 2, y: start.y - size / 2 - 40, scale: 0.3, opacity: 0 });
    const proxy = { t: 0 };
    const tl = gsap.timeline({ delay: (LIFT_OUT_MS * 0.6) / 1000, onComplete: () => onDone(flight.id) });
    tl.to(el, { opacity: 1, duration: 0.12 });
    tl.to(
      proxy,
      {
        t: 1,
        duration: 0.62,
        ease: "power2.inOut",
        onUpdate: () => {
          const t = proxy.t;
          gsap.set(el, {
            x: quadratic(start.x, control.x, end.x, t) - size / 2,
            y: quadratic(start.y - 40, control.y, end.y, t) - size / 2,
            scale: 0.3 + t * 0.7,
            rotation: (1 - t) * 30,
            opacity: t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1,
          });
        },
      },
      "<",
    );
    return () => {
      tl.kill();
    };
  }, [flight, item, onDone]);

  if (!item) return null;
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[80] opacity-0 will-change-transform"
      aria-hidden="true"
    >
      <div className="h-full w-full rounded-2xl bg-white p-1 shadow-[0_24px_50px_-12px_rgb(43_25_16/0.55),0_0_0_1px_rgb(201_163_91/0.5),0_0_36px_rgb(236_217_174/0.55)]">
        <ItemThumb item={item} className="h-full w-full" rounded="rounded-xl" sizes="132px" />
      </div>
    </div>
  );
}

/** Renders flying product sprites for add / remove events from the builder. */
export function FlyingChocolateAnimation({ reduced }: { reduced: boolean }) {
  const [flights, setFlights] = useState<Flight[]>([]);
  useEffect(
    () =>
      useBuilderStore.subscribe((state, prev) => {
        const event = state.lastEvent;
        if (!event || event === prev.lastEvent) return;
        if (event.type === "rejected") {
          const card = document.querySelector(`[data-item-card="${event.itemId}"]`);
          card?.animate(
            [
              { transform: "translateX(0)" },
              { transform: "translateX(-6px)" },
              { transform: "translateX(5px)" },
              { transform: "translateX(-3px)" },
              { transform: "translateX(0)" },
            ],
            { duration: 380, easing: "ease-out" },
          );
          return;
        }
        if (reduced) return;
        if (event.type === "add" && event.origin) {
          setFlights((current) => [...current, { id: event.id, direction: "in", itemId: event.itemId, from: event.origin!, placement: event.placement }]);
        }
        if (event.type === "remove") {
          setFlights((current) => [...current, { id: event.id, direction: "out", itemId: event.itemId, placement: event.placement }]);
        }
      }),
    [reduced],
  );

  const onDone = useCallback((id: number) => setFlights((current) => current.filter((flight) => flight.id !== id)), []);

  // Flights only ever exist in the browser, so the portal never renders on the server.
  if (!flights.length) return null;
  return createPortal(
    <>
      {flights.map((flight) => (
        <FlightSprite key={flight.id} flight={flight} onDone={onDone} />
      ))}
    </>,
    document.body,
  );
}
