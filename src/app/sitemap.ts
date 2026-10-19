import type { MetadataRoute } from "next";
import { giftBoxes } from "@/config/giftBoxes";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/customize`, changeFrequency: "weekly", priority: 0.9 },
    ...giftBoxes.map((box) => ({ url: `${base}/boxes/${box.id}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
