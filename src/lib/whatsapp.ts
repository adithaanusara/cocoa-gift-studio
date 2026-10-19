import { siteConfig } from "@/config/site";
import { formatPrice } from "./format";
import type { PriceBreakdown } from "./pricing";
import type { GiftBox } from "./types";

export function buildOrderMessage(box: GiftBox, price: PriceBreakdown, note?: string): string {
  const customized = price.lines.length > 0;
  const lines: string[] = [
    customized
      ? "Hello! I would like to order a customized chocolate gift box."
      : "Hello! I would like to order a chocolate gift box.",
    "",
    `Gift Box: ${box.name} (${formatPrice(box.price)})`,
  ];

  if (customized) {
    lines.push("", "Extra Items:");
    for (const line of price.lines) {
      lines.push(`- ${line.item.name} x ${line.qty} — ${formatPrice(line.lineTotal)}`);
    }
    lines.push(
      "",
      `Base Price: ${formatPrice(price.base)}`,
      `Extras Total: ${formatPrice(price.extrasTotal)}`,
    );
  }

  lines.push("", `Final Total: ${formatPrice(price.total)}`);

  const trimmedNote = note?.trim();
  if (trimmedNote) lines.push("", `Note: ${trimmedNote}`);

  lines.push(
    "",
    price.hasPlaceholderPrices
      ? "Please confirm the extra item prices, availability and delivery details."
      : "Please confirm availability and delivery details.",
  );

  return lines.join("\n");
}

/** Official WhatsApp click-to-chat link with the message pre-filled. */
export function buildWhatsAppUrl(message: string, phone: string = siteConfig.whatsappNumber): string {
  const text = encodeURIComponent(message);
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}
