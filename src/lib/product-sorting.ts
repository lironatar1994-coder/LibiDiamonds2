import type { Product } from "@/data/products";
import { salesPotentialForSlug } from "@/data/sales-potential";

export function compareProductsByPopularity(a: Product, b: Product): number {
  return salesPotentialForSlug(b.slug) - salesPotentialForSlug(a.slug);
}

export function sortProductsByPopularity(products: readonly Product[]): Product[] {
  return [...products].sort(compareProductsByPopularity);
}
