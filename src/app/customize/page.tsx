import type { Metadata } from "next";
import { Suspense } from "react";
import { GiftBoxCustomizer } from "@/components/customizer/GiftBoxCustomizer";

export const metadata: Metadata = {
  title: "Gift Studio — Customize Your Chocolate Box",
  description:
    "Build your own chocolate gift box in 3D. Choose a box, add extra chocolates and gifts, see the live total and order on WhatsApp.",
  alternates: { canonical: "/customize" },
};

function StudioFallback() {
  return (
    <div className="grid min-h-[100svh] place-items-center bg-cream pt-16">
      <p className="text-sm font-semibold text-cocoa-500">Opening the gift studio…</p>
    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={<StudioFallback />}>
      <GiftBoxCustomizer />
    </Suspense>
  );
}
