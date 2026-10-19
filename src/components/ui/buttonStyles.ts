import { cn } from "@/lib/cn";

type Variant = "primary" | "gold" | "ghost" | "ghost-light" | "whatsapp";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-wide transition-[transform,box-shadow,background-color,color] duration-300 ease-[var(--ease-luxe)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-cocoa-900 text-ivory shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-cocoa-800 hover:shadow-[var(--shadow-lift)]",
  gold: "bg-gradient-to-br from-champagne via-gold to-gold-deep text-cocoa-950 shadow-[var(--shadow-glow)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgb(201_163_91/0.6),0_18px_50px_-10px_rgb(201_163_91/0.65)]",
  ghost: "border border-cocoa-900/15 bg-white/40 text-cocoa-900 hover:-translate-y-0.5 hover:border-cocoa-900/30 hover:bg-white/70",
  "ghost-light": "border border-champagne/30 bg-white/5 text-ivory hover:-translate-y-0.5 hover:border-champagne/60 hover:bg-white/10",
  whatsapp: "bg-whatsapp text-white shadow-[0_10px_30px_-10px_rgb(31_168_85/0.7)] hover:-translate-y-0.5 hover:bg-[#1b9a4d]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-[0.95rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
