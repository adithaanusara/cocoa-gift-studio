"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { hasWhatsAppNumber } from "@/config/site";
import { cn } from "@/lib/cn";
import type { PriceBreakdown } from "@/lib/pricing";
import type { GiftBox } from "@/lib/types";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { buttonClass } from "./buttonStyles";
import { WhatsAppIcon } from "./WhatsAppIcon";

interface WhatsAppOrderButtonProps {
  box: GiftBox;
  price: PriceBreakdown;
  note?: string;
  label?: string;
  size?: "md" | "lg";
  className?: string;
  /** Show the "message ready" hint after the button is clicked. */
  showStatus?: boolean;
}

export function WhatsAppOrderButton({
  box,
  price,
  note,
  label = "Order via WhatsApp",
  size = "lg",
  className,
  showStatus = true,
}: WhatsAppOrderButtonProps) {
  const [opened, setOpened] = useState(false);
  const href = useMemo(() => buildWhatsAppUrl(buildOrderMessage(box, price, note)), [box, price, note]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setOpened(true)}
        className={buttonClass("whatsapp", size, "w-full")}
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <WhatsAppIcon className="h-5 w-5" />
        {label}
      </a>
      {showStatus && (
        <AnimatePresence>
          {opened && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs leading-relaxed text-cocoa-500"
              role="status"
            >
              Your message is ready in WhatsApp — press send there to place your order.
            </motion.p>
          )}
        </AnimatePresence>
      )}
      {process.env.NODE_ENV === "development" && !hasWhatsAppNumber && (
        <p className="rounded-lg bg-amber-100 px-3 py-2 text-[11px] leading-snug text-amber-900">
          Dev note: no WhatsApp business number is set (NEXT_PUBLIC_WHATSAPP_NUMBER), so WhatsApp will ask who to send it to.
        </p>
      )}
    </div>
  );
}
