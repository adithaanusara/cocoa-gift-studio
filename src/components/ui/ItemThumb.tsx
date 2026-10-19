import { Gift, Mail } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { CatalogItem } from "@/lib/types";

/** Product photo, or a drawn tile for items without one. */
export function ItemThumb({
  item,
  className,
  sizes = "160px",
  rounded = "rounded-xl",
  fit = "contain",
}: {
  item: CatalogItem;
  className?: string;
  sizes?: string;
  rounded?: string;
  /** "contain" shows the whole product on a soft backdrop; "cover" fills the tile. */
  fit?: "contain" | "cover";
}) {
  if (item.image) {
    return (
      <span
        className={cn(
          "relative block overflow-hidden",
          fit === "contain" ? "bg-[radial-gradient(circle_at_50%_40%,#fffaf2,#efe3cf)]" : "bg-cream",
          rounded,
          className,
        )}
      >
        <Image
          src={item.image}
          alt=""
          fill
          sizes={sizes}
          draggable={false}
          className={
            fit === "contain"
              ? "object-contain p-[9%] drop-shadow-[0_8px_10px_rgb(43_25_16/0.28)]"
              : "object-cover"
          }
        />
      </span>
    );
  }
  const isRibbon = item.model.kind === "ribbon";
  return (
    <span
      className={cn(
        "relative grid place-items-center overflow-hidden",
        rounded,
        isRibbon ? "bg-gradient-to-br from-[#a8283b] to-[#5e1019] text-champagne" : "bg-gradient-to-br from-[#fbf6ec] to-[#efe2c8] text-gold-deep",
        className,
      )}
    >
      {isRibbon ? <Gift className="h-1/2 w-1/2" strokeWidth={1.2} /> : <Mail className="h-1/2 w-1/2" strokeWidth={1.2} />}
      <span className="absolute inset-1.5 rounded-[inherit] border border-current opacity-30" />
    </span>
  );
}
