import Link from "next/link";
import type { Metal, Product, ProductGalleryImage } from "@/data/products";
import { productImages } from "@/data/products";
import { formatPrice } from "@/lib/site";
import ProductMedia from "@/components/ProductMedia";

export default function ProductCard({
  product,
  variant = "standard",
  metal,
  mediaOverride,
}: {
  product: Product;
  variant?: "standard" | "compact" | "catalog" | "editorial-landscape";
  metal?: Metal;
  mediaOverride?: {
    primary: ProductGalleryImage;
    secondary?: ProductGalleryImage;
  };
}) {
  const productGallery = productImages(product, metal);
  const images = mediaOverride
    ? [mediaOverride.primary, ...(mediaOverride.secondary ? [mediaOverride.secondary] : [])]
    : productGallery;
  const detailImage = images[1];
  const compact = variant === "compact";
  const catalog = variant === "catalog";
  const editorial = variant === "editorial-landscape";

  return (
    <Link href={`/product/${product.slug}`} className="group block" data-product-slug={product.slug}>
      <ProductMedia
        image={images[0]}
        secondaryImage={detailImage}
        sizes={editorial ? "(min-width: 1024px) 34vw, 50vw" : compact ? "(min-width: 1024px) 20vw, 50vw" : "(min-width: 1024px) 33vw, 50vw"}
        className={`product-card-frame ${catalog ? "catalog-card-media aspect-[4/5]" : editorial ? "catalog-card-media aspect-[16/9]" : "aspect-square"}`}
        imageClassName={`object-cover transition-all duration-700 ease-out ${compact ? "home-signature-product-image" : ""} ${catalog || editorial ? "scale-[1.07]" : ""} ${
          detailImage
              ? `${catalog || editorial ? "group-hover:scale-[1.11]" : compact ? "" : "group-hover:scale-[1.015]"} group-hover:opacity-0 group-focus-visible:opacity-0`
              : catalog || editorial ? "group-hover:scale-[1.11]" : compact ? "" : "group-hover:scale-[1.025]"
          }`}
        secondaryImageClassName={`pointer-events-none object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 ${compact ? "home-signature-product-image" : ""} ${
          catalog || editorial ? "scale-[1.07] group-hover:scale-[1.11]" : compact ? "" : "group-hover:scale-[1.015]"
        }`}
      />
      <div className={`px-0.5 sm:px-1 ${catalog || editorial ? "pt-3 text-right sm:pt-4" : `text-center ${compact ? "pt-3 sm:pt-4" : "pt-3 sm:pt-5"}`}`}>
        <h3 className={`font-display leading-snug transition-colors group-hover:text-gold-deep ${compact ? "text-[0.9rem] sm:text-base" : catalog ? "text-base sm:text-lg" : editorial ? "text-base lg:text-lg" : "text-[0.95rem] sm:text-lg"}`}>
          {product.name}
        </h3>
        <p className={`font-display font-medium tracking-[0.02em] text-ink ${compact ? "mt-1 text-[0.95rem] sm:mt-2 sm:text-base" : catalog ? "mt-2 text-[1.05rem] sm:text-lg" : editorial ? "mt-1.5 text-base" : "mt-1.5 text-base sm:mt-2.5 sm:text-[1.08rem]"}`}>
          {catalog || editorial ? `מ־${formatPrice(product.priceFrom)}` : `החל מ־${formatPrice(product.priceFrom)}`}
        </p>
      </div>
    </Link>
  );
}
