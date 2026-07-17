import type { MetadataRoute } from "next";
import { categories, productImages, products, productsByCategory } from "@/data/products";
import { guides } from "@/data/guides";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUpdated = new Date("2026-07-12T00:00:00+03:00");
  const staticPages = ["", "/about", "/contact", "/service", "/journal", "/ring-size-guide"].map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified: siteUpdated,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.6,
    })
  );

  const categoryPages = categories.map((category) => {
    const firstProduct = productsByCategory(category.slug)[0];
    return {
      url: absoluteUrl(`/jewelry/${category.slug}`),
      lastModified: siteUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      images: firstProduct ? [absoluteUrl(productImages(firstProduct)[0].src)] : undefined,
    };
  });

  const productPages = products.map((p) => ({
    url: absoluteUrl(`/product/${p.slug}`),
    lastModified: siteUpdated,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: productImages(p).map((image) => absoluteUrl(image.src)),
  }));

  const guidePages = guides.map((g) => ({
    url: absoluteUrl(`/journal/${g.slug}`),
    lastModified: new Date(`${g.updated ?? g.date}T00:00:00+03:00`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    images: [absoluteUrl(g.cover.src)],
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...guidePages];
}
