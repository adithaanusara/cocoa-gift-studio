import { HandHeart, Package, Sparkles, Wallet } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { lowestBoxPrice } from "@/config/giftBoxes";
import { formatPrice } from "@/lib/format";

const reasons = [
  {
    icon: Sparkles,
    title: "Favourites they'll recognise",
    text: "Cadbury Dairy Milk, KitKat, Snickers, Mars, golden heart chocolates and the trending Dubai kunafa bar.",
  },
  {
    icon: Package,
    title: "Packed to impress",
    text: "Neatly arranged in a kraft gift box with paper filler, so it's ready to hand over.",
  },
  {
    icon: Wallet,
    title: "A box for every budget",
    text: `Gift boxes start from ${formatPrice(lowestBoxPrice)}, and you can add extras one at a time.`,
  },
  {
    icon: HandHeart,
    title: "Ordering made simple",
    text: "No sign-up, no card payments online. Just one WhatsApp message with everything in it.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="grain relative overflow-hidden bg-cocoa-900 py-24 text-ivory sm:py-32" aria-labelledby="why-heading">
      <div className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image
              src="/images/boxes/dubai-kunafa-5000.jpg"
              alt="Dubai Kunafa chocolate gift box with an Ailisha golden heart"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/70 via-transparent to-transparent" />
            <p className="font-display absolute bottom-6 left-6 right-6 text-3xl italic leading-tight text-ivory">
              &ldquo;Made with care, one box at a time.&rdquo;
            </p>
          </div>
          <div className="absolute -bottom-8 -right-4 hidden w-44 overflow-hidden rounded-2xl border-4 border-cocoa-900 shadow-2xl sm:block lg:-right-10">
            <Image src="/images/boxes/truffle-fruit-3000.jpg" alt="Truffle and fruit gift box" width={1310} height={880} sizes="176px" />
          </div>
        </Reveal>

        <div className="flex flex-col justify-center">
          <Reveal>
            <p className="eyebrow text-champagne/80">Why choose us</p>
            <h2 id="why-heading" className="font-display mt-4 text-5xl font-medium leading-[1.02] sm:text-6xl">
              Small boxes, <span className="text-gold-gradient italic">big smiles</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {reasons.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 0.08}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-champagne/20 bg-white/5">
                  <reason.icon className="h-5 w-5 text-champagne" strokeWidth={1.5} />
                </span>
                <h3 className="font-display mt-5 text-2xl font-semibold">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/65">{reason.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
