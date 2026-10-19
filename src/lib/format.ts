import { siteConfig } from "@/config/site";

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Formats an LKR amount as "Rs. 2,500". */
export function formatPrice(amount: number): string {
  return `${siteConfig.currencyLabel} ${numberFormat.format(Math.round(amount))}`;
}

export function formatNumber(amount: number): string {
  return numberFormat.format(Math.round(amount));
}
