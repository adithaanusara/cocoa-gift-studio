import type { CatalogItem, ItemCategory } from "@/lib/types";

/**
 * Extra chocolates and gift touches customers can add to a box.
 *
 * ⚠️ PRICES ARE PLACEHOLDERS. Every `price` below is a sample value so the
 * builder can be tested. Replace each one with the real selling price and set
 * `priceIsPlaceholder: false`. While any item is a placeholder the site shows
 * a "sample price" label next to it.
 *
 * The chocolates are the products visible in the reference photos. The two
 * "gift" items are suggestions — confirm you offer them, or set
 * `available: false` to hide them.
 *
 * `footprint` is in 2 cm grid cells and controls how much room an item takes
 * inside a box.
 */
export const catalogItems: CatalogItem[] = [
  {
    id: "dairy-milk",
    name: "Cadbury Dairy Milk",
    description: "Classic milk chocolate bar",
    category: "chocolate",
    price: 150,
    priceIsPlaceholder: true,
    image: "/images/items/dairy-milk.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 3, d: 4 },
    heightCm: 0.8,
    model: { kind: "wrapper", color: "#4a1f8c", shade: "#2a0f5c", label: "dairy-milk", foil: 0.35 },
  },
  {
    id: "kitkat-2-finger",
    name: "KitKat 2 Finger",
    description: "Crisp wafer in milk chocolate",
    category: "chocolate",
    price: 150,
    priceIsPlaceholder: true,
    image: "/images/items/kitkat-2-finger.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 5, d: 3 },
    heightCm: 1,
    model: { kind: "wrapper", color: "#d7121f", shade: "#8f0a13", label: "kitkat", foil: 0.45 },
  },
  {
    id: "kitkat-4-finger",
    name: "KitKat 4 Finger",
    description: "The bigger break",
    category: "chocolate",
    price: 350,
    priceIsPlaceholder: true,
    image: "/images/items/kitkat-4-finger.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 6, d: 4 },
    heightCm: 1.1,
    model: { kind: "wrapper", color: "#d7121f", shade: "#8f0a13", label: "kitkat", foil: 0.45 },
  },
  {
    id: "snickers",
    name: "Snickers",
    description: "Peanuts, caramel & nougat",
    category: "chocolate",
    price: 200,
    priceIsPlaceholder: true,
    image: "/images/items/snickers.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 6, d: 2 },
    heightCm: 1.2,
    model: { kind: "wrapper", color: "#3a2116", shade: "#1e100a", label: "snickers", foil: 0.3 },
  },
  {
    id: "mars",
    name: "Mars Bar",
    description: "Nougat & caramel in milk chocolate",
    category: "chocolate",
    price: 450,
    priceIsPlaceholder: true,
    image: "/images/items/mars.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 8, d: 2 },
    heightCm: 1.5,
    model: { kind: "wrapper", color: "#121012", shade: "#050405", label: "mars", foil: 0.4 },
  },
  {
    id: "ailisha-heart",
    name: "Ailisha Golden Heart",
    description: "Luxury golden chocolates in a heart box",
    category: "premium",
    price: 900,
    priceIsPlaceholder: true,
    image: "/images/items/ailisha-heart.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 6, d: 6 },
    heightCm: 3,
    model: { kind: "heart", label: "Ailisha", sublabel: "Luxury Golden Chocolate", pieces: 3 },
  },
  {
    id: "truffle-heart",
    name: "Choco Crisp Truffles Heart",
    description: "Golden truffles in a heart box",
    category: "premium",
    price: 900,
    priceIsPlaceholder: true,
    image: "/images/items/truffle-heart.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 7, d: 6 },
    heightCm: 3,
    model: { kind: "heart", label: "Truffles", sublabel: "Choco Crisp's", pieces: 5, ribbon: true },
  },
  {
    id: "dubai-kunafa",
    name: "Pistachio Dubai Kunafa",
    description: "100 g pistachio kunafa chocolate",
    category: "premium",
    price: 1500,
    priceIsPlaceholder: true,
    image: "/images/items/dubai-kunafa.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 6, d: 8 },
    heightCm: 2,
    model: { kind: "carton", label: "dubai-kunafa" },
  },
  {
    id: "fruit-candy",
    name: "Fruit Candy",
    description: "Pineapple or strawberry, individually wrapped",
    category: "sweets",
    price: 50,
    priceIsPlaceholder: true,
    image: "/images/items/fruit-candy.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 2, d: 3 },
    heightCm: 0.8,
    model: { kind: "sachet", color: "#5fb4e8", accent: "#f4a9c0", label: "Fruity" },
  },
  {
    id: "chia-gummy",
    name: "Chia Seed Fruit Gummy",
    description: "Chewy fruit gummy",
    category: "sweets",
    price: 80,
    priceIsPlaceholder: true,
    image: "/images/items/chia-gummy.jpg",
    available: true,
    placement: "inside",
    footprint: { w: 3, d: 3 },
    heightCm: 0.8,
    model: { kind: "sachet", color: "#f6f1e4", accent: "#e9b949", label: "Chia Seed" },
  },
  {
    id: "greeting-card",
    name: "Greeting Card",
    description: "A little card to tuck inside",
    category: "gift",
    price: 250,
    priceIsPlaceholder: true,
    available: true,
    placement: "inside",
    footprint: { w: 5, d: 4 },
    heightCm: 0.3,
    model: { kind: "card" },
  },
  {
    id: "satin-ribbon",
    name: "Satin Ribbon & Bow",
    description: "Tied around the outside of the box",
    category: "gift",
    price: 300,
    priceIsPlaceholder: true,
    available: true,
    placement: "decoration",
    footprint: { w: 0, d: 0 },
    heightCm: 0,
    model: { kind: "ribbon", color: "#8c1d2c" },
  },
];

export const itemCategories: { id: ItemCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chocolate", label: "Chocolates" },
  { id: "premium", label: "Premium" },
  { id: "sweets", label: "Sweets" },
  { id: "gift", label: "Gift touches" },
];

const itemsById = new Map(catalogItems.map((item) => [item.id, item]));

export function getItem(id: string): CatalogItem | undefined {
  return itemsById.get(id);
}

export const availableItems = catalogItems.filter((item) => item.available);
