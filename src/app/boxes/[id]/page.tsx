import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GiftBoxCard } from "@/components/collection/GiftBoxCard";
import { Footer } from "@/components/layout/Footer";
import { buttonClass } from "@/components/ui/buttonStyles";
import { WhatsAppOrderButton } from "@/components/ui/WhatsAppOrderButton";
import { getGiftBox, giftBoxes } from "@/config/giftBoxes";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { calculatePrice } from "@/lib/pricing";

export function generateStaticParams() {
  return giftBoxes.map((box) => ({ id: box.id }));
}

export async function generateMetadata({ params }: PageProps<"/boxes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const box = getGiftBox(id);
  if (!box) return {};
  return {
    title: `${box.name} — ${formatPrice(box.price)}`,
    description: `${box.description} Order in ${siteConfig.location} via WhatsApp.`,
    alternates: { canonical: `/boxes/${box.id}` },
    openGraph: { images: [{ url: box.image, width: box.imageWidth, height: box.imageHeight, alt: box.imageAlt }] },
  };
}

export default function GiftBoxPage({ params }: PageProps<"/boxes/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-cream" />}>
      <GiftBoxDetails params={params} />
    </Suspense>
  );
}

async function GiftBoxDetails({ params }: { params: PageProps<"/boxes/[id]">["params"] }) {
  const { id } = await params;
  const box = getGiftBox(id);
  if (!box) notFound();
  const price = calculatePrice(box, []);
  const others = giftBoxes.filter((other) => other.id !== box.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: box.name,
    description: box.description,
    image: `${siteConfig.url.replace(/\/$/, "")}${box.image}`,
    offers: { "@type": "Offer", priceCurrency: "LKR", price: box.price },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="bg-cream pb-24 pt-28 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/#collection" className="inline-flex items-center gap-2 text-sm font-semibold text-cocoa-500 hover:text-cocoa-900">
            <ArrowLeft className="h-4 w-4" /> All gift boxes
          </Link>
          <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[3rem] bg-gold/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
                <Image
                  src={box.image}
                  alt={box.imageAlt}
                  width={box.imageWidth}
                  height={box.imageHeight}
                  preload
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="h-auto w-full"
                />
                {box.badge && (
                  <span className="glass-dark absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-champagne">
                    <Sparkles className="h-3 w-3" /> {box.badge}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="eyebrow text-gold-deep">Chocolate gift box</p>
              <h1 className="font-display mt-3 text-5xl font-medium leading-[1.02] sm:text-6xl">{box.name}</h1>
              <p className="font-display mt-4 text-4xl font-semibold tabular-nums text-cocoa-700">{formatPrice(box.price)}</p>
              <p className="mt-6 max-w-lg leading-relaxed text-cocoa-600">{box.description}</p>

              <div className="mt-8 rounded-3xl border border-cocoa-900/8 bg-ivory p-6">
                <h2 className="eyebrow text-[0.65rem] text-cocoa-500">What&apos;s inside</h2>
                <ul className="mt-4 space-y-2.5">
                  {box.contents.map((content) => (
                    <li key={content.label} className="flex items-start gap-3 text-sm text-cocoa-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                      <span className="flex-1">{content.label}</span>
                      {content.qty !== undefined && <span className="tabular-nums text-cocoa-400">×{content.qty}</span>}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs italic text-cocoa-400">Contents as shown in the photo.</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/customize?box=${box.id}`} className={buttonClass("primary", "lg", "flex-1")}>
                  Customize this box <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <WhatsAppOrderButton box={box} price={price} label="Order as it is" className="flex-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24" aria-labelledby="more-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="more-heading" className="font-display text-4xl font-medium sm:text-5xl">
            You might also <span className="italic text-cocoa-600">love</span>
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <GiftBoxCard key={other.id} box={other} className="h-full" />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/#collection" className={buttonClass("ghost", "md")}>
              See all gift boxes
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
