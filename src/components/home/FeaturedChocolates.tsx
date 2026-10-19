import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { ItemThumb } from "@/components/ui/ItemThumb";
import { availableItems } from "@/config/items";

const featured = availableItems.filter((item) => item.image);

export function FeaturedChocolates() {
  // Doubled so the marquee loops seamlessly.
  const loop = [...featured, ...featured];
  return (
    <section className="overflow-hidden bg-cream py-24 sm:py-32" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-gold-deep">Featured chocolates</p>
            <h2 id="featured-heading" className="font-display mt-4 text-5xl font-medium leading-[1.02] sm:text-6xl">
              Add a little <span className="italic text-cocoa-600">extra</span>
            </h2>
          </div>
          <p className="max-w-sm text-cocoa-600">
            Every one of these can be added to any box in the gift studio, as long as there&apos;s room.
          </p>
        </Reveal>
      </div>

      <div className="group relative mt-14 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee gap-5 pr-5 group-hover:[animation-play-state:paused]">
          {loop.map((item, index) => (
            <li key={`${item.id}-${index}`} aria-hidden={index >= featured.length} className="w-56 shrink-0 sm:w-64">
              <Link href="/customize" tabIndex={index >= featured.length ? -1 : 0} className="group/item block">
                <div className="overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-[var(--shadow-soft)] transition-shadow duration-500 group-hover/item:shadow-[var(--shadow-lift)]">
                  <ItemThumb
                    item={item}
                    sizes="256px"
                    rounded="rounded-[1.35rem]"
                    className="aspect-square w-full transition-transform duration-700 group-hover/item:scale-[1.03]"
                  />
                  <div className="px-3 pb-3 pt-4">
                    <p className="font-display text-xl font-semibold leading-tight text-cocoa-900">{item.name}</p>
                    <p className="mt-1 text-xs text-cocoa-500">{item.description}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
