import Link from "next/link";
import { giftBoxes } from "@/config/giftBoxes";
import { hasWhatsAppNumber, siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-cocoa-950 text-ivory/70">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-6 text-sm leading-relaxed">
              Chocolate gift boxes made your way, packed in {siteConfig.location} and ordered in one simple
              WhatsApp message.
            </p>
            <p className="font-display mt-8 text-3xl italic text-champagne">{siteConfig.tagline}</p>
          </div>
          <div>
            <h2 className="eyebrow text-champagne/70">Gift boxes</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {giftBoxes.map((box) => (
                <li key={box.id}>
                  <Link href={`/boxes/${box.id}`} className="transition-colors hover:text-ivory">
                    {box.name} <span className="text-ivory/40">· {formatPrice(box.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow text-champagne/70">Order</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/customize" className="transition-colors hover:text-ivory">
                  Open the gift studio
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="transition-colors hover:text-ivory">
                  How ordering works
                </Link>
              </li>
              {hasWhatsAppNumber && (
                <li>
                  <a
                    href={buildWhatsAppUrl("Hello! I have a question about your chocolate gift boxes.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-ivory"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="hairline mt-16 opacity-40" />
        <div className="mt-6 flex flex-col justify-between gap-3 text-xs text-ivory/40 sm:flex-row">
          <p>© {siteConfig.name}. All prices in Sri Lankan Rupees.</p>
          <p>Brand names belong to their respective owners.</p>
        </div>
      </div>
    </footer>
  );
}
