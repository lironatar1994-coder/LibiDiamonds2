import Link from "next/link";
import type { Metal, Product } from "@/data/products";
import { productImages } from "@/data/products";
import { formatPrice } from "@/lib/site";
import ProductMedia from "@/components/ProductMedia";

export default function ProductCard({
  product,
  variant = "standard",
  metal,
}: {
  product: Product;
  variant?: "standard" | "compact" | "catalog";
  metal?: Metal;
}) {
  const images = productImages(product, metal);
  const detailImage = images[1];
  const compact = variant === "compact";
  const catalog = variant === "catalog";

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <ProductMedia
        image={images[0]}
        secondaryImage={detailImage}
        sizes={compact ? "(min-width: 1024px) 20vw, 50vw" : "(min-width: 1024px) 33vw, 50vw"}
        className={`product-card-frame ${catalog ? "catalog-card-media aspect-[4/5]" : "aspect-square"}`}
        imageClassName={`object-cover transition-all duration-700 ease-out ${catalog ? "scale-[1.07]" : ""} ${
            detailImage
              ? `${catalog ? "group-hover:scale-[1.11]" : "group-hover:scale-[1.015]"} group-hover:opacity-0 group-focus-visible:opacity-0`
              : catalog ? "group-hover:scale-[1.11]" : "group-hover:scale-[1.025]"
          }`}
        secondaryImageClassName={`pointer-events-none object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 ${
          catalog ? "scale-[1.07] group-hover:scale-[1.11]" : "group-hover:scale-[1.015]"
        }`}
      />
      <div className={`px-0.5 sm:px-1 ${catalog ? "pt-3 text-right sm:pt-4" : `text-center ${compact ? "pt-3 sm:pt-4" : "pt-3 sm:pt-5"}`}`}>
        <h3 className={`font-display leading-snug transition-colors group-hover:text-gold-deep ${compact ? "text-[0.9rem] sm:text-base" : catalog ? "text-base sm:text-lg" : "text-[0.95rem] sm:text-lg"}`}>
          {product.name}
        </h3>
        <p className={`font-display font-medium tracking-[0.02em] text-ink ${compact ? "mt-1 text-[0.95rem] sm:mt-2 sm:text-base" : catalog ? "mt-2 text-[1.05rem] sm:text-lg" : "mt-1.5 text-base sm:mt-2.5 sm:text-[1.08rem]"}`}>
          {catalog ? `מ־${formatPrice(product.priceFrom)}` : `החל מ־${formatPrice(product.priceFrom)}`}
        </p>
      </div>
    </Link>
  );
}
