import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/** Ribbon-bow mark with the brand wordmark. */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" aria-hidden="true" className="h-8 w-8 shrink-0">
        <defs>
          <linearGradient id="logo-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3e2b6" />
            <stop offset="0.5" stopColor="#c9a35b" />
            <stop offset="1" stopColor="#a9823c" />
          </linearGradient>
        </defs>
        <rect x="6" y="17" width="28" height="18" rx="2.5" fill="none" stroke="url(#logo-gold)" strokeWidth="2" />
        <path d="M20 17v18" stroke="url(#logo-gold)" strokeWidth="2" />
        <path
          d="M20 16c-3-5-9-7-10.5-4S14 17 20 16Zm0 0c3-5 9-7 10.5-4S26 17 20 16Z"
          fill="url(#logo-gold)"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.45rem] font-semibold tracking-tight",
            tone === "light" ? "text-ivory" : "text-cocoa-900",
          )}
        >
          {siteConfig.name}
        </span>
        <span className={cn("mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.32em]", tone === "light" ? "text-champagne/80" : "text-cocoa-500")}>
          Chocolate gift studio
        </span>
      </span>
    </span>
  );
}
