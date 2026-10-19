import type { GiftBox } from "@/lib/types";

/**
 * The gift box collection. Prices come from the price tags in the owner's
 * reference photos. Contents list what each photo shows; a `qty` is only
 * given where the count is clearly visible.
 *
 * `grid` is the box floor in 2 cm cells plus how many layers can be stacked.
 * Make it bigger or smaller to change how many extras fit.
 */
export const giftBoxes: GiftBox[] = [
  {
    id: "classic-treat",
    name: "Classic Treat Box",
    tagline: "The favourites, neatly packed",
    description:
      "Rows of Cadbury Dairy Milk, KitKat and Snickers tucked into a kraft gift box with red ribbon filler. A simple, cheerful gift.",
    price: 1699,
    image: "/images/boxes/classic-1699.jpg",
    imageWidth: 1240,
    imageHeight: 1130,
    imageAlt:
      "Kraft gift box with three Cadbury Dairy Milk bars, four KitKat bars and three Snickers bars",
    contents: [
      { label: "Cadbury Dairy Milk", qty: 3, itemId: "dairy-milk" },
      { label: "KitKat 2 Finger", qty: 4, itemId: "kitkat-2-finger" },
      { label: "Snickers", qty: 3, itemId: "snickers" },
    ],
    grid: { cols: 14, rows: 12, layers: 2 },
    fillerColor: "#b0202c",
  },
  {
    id: "golden-heart",
    name: "Golden Heart Box",
    tagline: "A golden heart with all the classics",
    description:
      "An Ailisha luxury golden chocolate heart surrounded by Dairy Milk, KitKat and Snickers, finished with blue shredded paper.",
    price: 3000,
    image: "/images/boxes/golden-heart-3000.jpg",
    imageWidth: 1390,
    imageHeight: 1010,
    imageAlt:
      "Kraft gift box with an Ailisha golden chocolate heart, Dairy Milk, KitKat and Snickers bars",
    contents: [
      { label: "Ailisha Luxury Golden Chocolate heart", qty: 1, itemId: "ailisha-heart" },
      { label: "Cadbury Dairy Milk", qty: 3, itemId: "dairy-milk" },
      { label: "KitKat 2 Finger", qty: 3, itemId: "kitkat-2-finger" },
      { label: "KitKat 4 Finger", qty: 1, itemId: "kitkat-4-finger" },
      { label: "Snickers", qty: 2, itemId: "snickers" },
    ],
    grid: { cols: 16, rows: 11, layers: 2 },
    fillerColor: "#2f5d8c",
  },
  {
    id: "truffle-fruit",
    name: "Truffle & Fruit Box",
    tagline: "Golden truffles with a fruity twist",
    description:
      "A Choco Crisp truffles heart with Dairy Milk, KitKat, fruit candies and a chia seed fruit gummy for something a little different.",
    price: 3000,
    image: "/images/boxes/truffle-fruit-3000.jpg",
    imageWidth: 1310,
    imageHeight: 880,
    imageAlt:
      "Kraft gift box with a golden truffles heart, Dairy Milk, KitKat bars, fruit candies and a chia seed gummy",
    contents: [
      { label: "Choco Crisp Truffles heart", qty: 1, itemId: "truffle-heart" },
      { label: "Cadbury Dairy Milk", qty: 3, itemId: "dairy-milk" },
      { label: "KitKat 4 Finger", qty: 1, itemId: "kitkat-4-finger" },
      { label: "KitKat 2 Finger bars", itemId: "kitkat-2-finger" },
      { label: "Fruit candies (pineapple & strawberry)", itemId: "fruit-candy" },
      { label: "Chia seed fruit gummy", itemId: "chia-gummy" },
    ],
    grid: { cols: 16, rows: 11, layers: 2 },
    fillerColor: "#b0202c",
  },
  {
    id: "dubai-kunafa",
    name: "Dubai Kunafa Box",
    tagline: "The trending pistachio kunafa bar, and more",
    description:
      "Pistachio Dubai Kunafa chocolate with an Ailisha golden heart, Mars, Snickers, KitKat, Dairy Milk and assorted wrapped chocolates.",
    price: 5000,
    image: "/images/boxes/dubai-kunafa-5000.jpg",
    imageWidth: 1540,
    imageHeight: 1035,
    imageAlt:
      "Kraft gift box with a Pistachio Dubai Kunafa chocolate, an Ailisha golden heart, Mars, Snickers, KitKat and Dairy Milk",
    badge: "Premium",
    contents: [
      { label: "Pistachio Dubai Kunafa chocolate (100 g)", qty: 1, itemId: "dubai-kunafa" },
      { label: "Ailisha Luxury Golden Chocolate heart", qty: 1, itemId: "ailisha-heart" },
      { label: "Mars", qty: 1, itemId: "mars" },
      { label: "Snickers", qty: 1, itemId: "snickers" },
      { label: "KitKat 2 Finger", qty: 3, itemId: "kitkat-2-finger" },
      { label: "Cadbury Dairy Milk", qty: 2, itemId: "dairy-milk" },
      { label: "Pineapple candy", itemId: "fruit-candy" },
      { label: "Assorted wrapped chocolates" },
    ],
    grid: { cols: 18, rows: 12, layers: 2 },
    fillerColor: "#b0202c",
  },
  {
    id: "signature",
    name: "Signature Indulgence Box",
    tagline: "Our most generous selection",
    description:
      "Pistachio Dubai Kunafa, an Ailisha golden heart, Mars, Snickers, KitKat 4 Finger and 2 Finger bars and Dairy Milk, all in one box.",
    price: 6000,
    image: "/images/boxes/signature-6000.jpg",
    imageWidth: 1120,
    imageHeight: 710,
    imageAlt:
      "Kraft gift box with an Ailisha golden heart, Mars, Snickers, Pistachio Dubai Kunafa chocolate, Dairy Milk and KitKat bars",
    badge: "Signature",
    contents: [
      { label: "Pistachio Dubai Kunafa chocolate", qty: 1, itemId: "dubai-kunafa" },
      { label: "Ailisha Luxury Golden Chocolate heart", qty: 1, itemId: "ailisha-heart" },
      { label: "Mars", qty: 1, itemId: "mars" },
      { label: "Snickers", qty: 1, itemId: "snickers" },
      { label: "KitKat 4 Finger", qty: 2, itemId: "kitkat-4-finger" },
      { label: "KitKat 2 Finger", qty: 2, itemId: "kitkat-2-finger" },
      { label: "Cadbury Dairy Milk", qty: 2, itemId: "dairy-milk" },
    ],
    grid: { cols: 18, rows: 13, layers: 2 },
    fillerColor: "#c9a35b",
  },
];

export const defaultBoxId = giftBoxes[1].id;

const boxesById = new Map(giftBoxes.map((box) => [box.id, box]));

export function getGiftBox(id: string | null | undefined): GiftBox | undefined {
  return id ? boxesById.get(id) : undefined;
}

export const lowestBoxPrice = Math.min(...giftBoxes.map((box) => box.price));
