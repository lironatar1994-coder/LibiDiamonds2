import type { MetadataRoute } from "next";
import { categories, products } from "@/data/products";
import { guides } from "@/data/guides";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/about", "/contact", "/service", "/journal"].map(
    (path) => ({
      url: `${site.domain}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.6,
    })
  );

  const categoryPages = categories.map((c) => ({
    url: `${site.domain}/jewelry/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const productPages = products.map((p) => ({
    url: `${site.domain}/product/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guidePages = guides.map((g) => ({
    url: `${site.domain}/journal/${g.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...guidePages];
}
