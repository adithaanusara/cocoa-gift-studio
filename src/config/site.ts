/**
 * Business settings. Edit these before going live.
 */
export const siteConfig = {
  /** Placeholder brand name — replace with the real business name. */
  name: "Happiness Box",
  shortName: "Happiness Box",
  tagline: "A little box of happiness.",
  description:
    "Chocolate gift boxes in Sri Lanka, made your way. Pick a box, add favourites in our 3D gift studio and order in one WhatsApp message.",
  location: "Sri Lanka",

  /**
   * Public site URL, used for SEO metadata. Set NEXT_PUBLIC_SITE_URL in
   * Vercel once the domain is known.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /**
   * WhatsApp business number in international format, digits only
   * (for Sri Lanka: 94 followed by the number without the leading 0,
   * e.g. "947XXXXXXXX"). Set NEXT_PUBLIC_WHATSAPP_NUMBER or fill it in here.
   *
   * While this is empty, the order button still opens WhatsApp with the
   * message filled in, but the customer has to choose who to send it to.
   */
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),

  currencyLabel: "Rs.",
} as const;

export const hasWhatsAppNumber = siteConfig.whatsappNumber.length > 0;
