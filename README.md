# Happiness Box — Chocolate Gift Studio

A chocolate gift box shop with a 3D box customizer. Customers pick a box, add extra chocolates (drag-and-drop on desktop, tap on mobile), see the live total and order through WhatsApp. No database, accounts or online payments.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React Three Fiber / Drei / Three.js, GSAP, Motion and Zustand.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 (use `npx next dev -p 3100` if 3000 is busy)
npm run build      # production build
npm run lint
```

## Before going live — edit these

| What | Where |
| --- | --- |
| WhatsApp business number | `NEXT_PUBLIC_WHATSAPP_NUMBER` env var (digits, e.g. `947XXXXXXXX`), or `src/config/site.ts` |
| Site URL (SEO, sitemap) | `NEXT_PUBLIC_SITE_URL` env var |
| Brand name, tagline | `src/config/site.ts` (currently a placeholder name) |
| Gift boxes, prices, contents | `src/config/giftBoxes.ts` |
| Extra items and their prices | `src/config/items.ts` — **all extra prices are placeholders**; set the real price and `priceIsPlaceholder: false` |
| Gift extras (card, ribbon) | `src/config/items.ts` — set `available: false` if you don't offer them |

Box prices come from the reference photos. Box contents list only what the photos show; quantities are given only where they're clearly visible.

## How capacity works

Each box floor is a grid of 2 cm cells with two stackable layers (`grid` in `giftBoxes.ts`). Each item takes a footprint of cells (`footprint` in `items.ts`). The pictured contents are packed first; extras go into the first free spot, and an item that won't fit is refused with a message. Change `grid` to allow more or fewer extras.

## Project layout

```
src/config/        business data (boxes, items, settings)
src/lib/           pricing, packing, WhatsApp message, formatting
src/store/         builder state (Zustand, saved in localStorage)
src/components/
  three/           3D box, product models, hero scene (procedural, no model downloads)
  customizer/      studio: selector, stage, summary, flight animation, flat fallback
  home/ collection/ layout/ ui/
scripts/           crop-reference-photos.py — regenerates images in public/images
```

If WebGL is unavailable or the 3D view fails, the studio switches to a top-down photo view automatically. Animations respect "reduce motion".
