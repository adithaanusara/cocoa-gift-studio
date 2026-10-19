import { ArrowRight, CheckCheck } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { getGiftBox } from "@/config/giftBoxes";
import { hasWhatsAppNumber } from "@/config/site";
import { calculatePrice } from "@/lib/pricing";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const exampleBox = getGiftBox("golden-heart")!;
const exampleMessage = buildOrderMessage(
  exampleBox,
  calculatePrice(exampleBox, [{ itemId: "snickers" }, { itemId: "snickers" }, { itemId: "mars" }]),
);

export function WhatsAppSection() {
  return (
    <section id="order" className="scroll-mt-16 bg-ivory py-24 sm:py-32" aria-labelledby="order-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-cocoa-950 px-6 py-16 text-ivory sm:px-12 lg:px-16">
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-whatsapp/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <p className="eyebrow text-champagne/80">WhatsApp ordering</p>
              <h2 id="order-heading" className="font-display mt-4 text-5xl font-medium leading-[1.02] sm:text-6xl">
                Your order, <span className="text-gold-gradient italic">in one message</span>
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-ivory/70">
                When your box is ready, tap <strong className="text-ivory">Order via WhatsApp</strong>. We fill in the
                box, every extra and the total for you. Send it, and we&apos;ll reply to confirm availability, delivery
                and payment.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-ivory/75">
                {["No account or online payment", "Your exact selection and total, written for you", "Your order is placed once you send the message"].map((line) => (
                  <li key={line} className="flex items-center gap-3">
                    <CheckCheck className="h-4 w-4 text-whatsapp" /> {line}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/customize" className={buttonClass("gold", "lg")}>
                  Build your box <ArrowRight className="h-4 w-4" />
                </Link>
                {hasWhatsAppNumber && (
                  <a
                    href={buildWhatsAppUrl("Hello! I have a question about your chocolate gift boxes.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass("ghost-light", "lg")}
                  >
                    <WhatsAppIcon className="h-5 w-5" /> Ask a question
                  </a>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mx-auto w-full max-w-sm rounded-[2.5rem] border border-white/10 bg-[#0b141a] p-3 shadow-[0_50px_100px_-30px_rgb(0_0_0/0.8)]">
                <div className="flex items-center gap-3 rounded-t-[2rem] bg-[#1f2c34] px-4 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-champagne to-gold-deep text-cocoa-950">
                    <WhatsAppIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Gift orders</p>
                    <p className="text-[0.65rem] text-ivory/50">Example message</p>
                  </div>
                </div>
                <div className="min-h-80 rounded-b-[2rem] bg-[#0b141a] bg-[radial-gradient(rgb(255_255_255/0.04)_1px,transparent_1px)] p-4 [background-size:14px_14px]">
                  <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-[#005c4b] px-3.5 py-2.5 text-[0.72rem] leading-relaxed text-[#e9edef] shadow">
                    <p className="whitespace-pre-wrap">{exampleMessage}</p>
                    <p className="mt-1 flex items-center justify-end gap-1 text-[0.6rem] text-[#e9edef]/60">
                      Ready to send <CheckCheck className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
