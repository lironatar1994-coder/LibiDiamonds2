import Link from "next/link";
import type { Metal, Product, ProductGalleryImage } from "@/data/products";
import { productImages } from "@/data/products";
import { formatPrice } from "@/lib/site";
import ProductMedia from "@/components/ProductMedia";
import { ringCatalogOpticalScale } from "@/data/catalog-presentation";

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
  const ringCatalog = catalog && product.category === "rings";
  const catalogScale = ringCatalog ? ringCatalogOpticalScale(product.slug) : undefined;
  const primaryImage = ringCatalog
    ? { ...images[0], fit: "contain" as const, presentation: "cutout" as const, opticalScale: catalogScale }
    : images[0];
  const secondaryImage = ringCatalog && detailImage
    ? { ...detailImage, fit: "contain" as const, presentation: "cutout" as const, opticalScale: catalogScale }
    : detailImage;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      data-product-slug={product.slug}
      data-display-metal={metal}
    >
      <ProductMedia
        image={primaryImage}
        secondaryImage={secondaryImage}
        sizes={editorial ? "(min-width: 1024px) 34vw, 50vw" : compact ? "(min-width: 1024px) 20vw, 50vw" : "(min-width: 1024px) 33vw, 50vw"}
        loading={compact ? "eager" : undefined}
        fetchPriority={compact ? "low" : undefined}
        unoptimized={compact}
        variant={ringCatalog ? "catalog" : "default"}
        className={`product-card-frame ${ringCatalog ? "catalog-card-media catalog-ring-media aspect-square sm:aspect-[4/5]" : catalog ? "catalog-card-media aspect-[4/5]" : editorial ? "catalog-card-media aspect-[16/9]" : "aspect-square"}`}
        imageClassName={`${ringCatalog ? "object-contain" : "object-cover"} transition-all duration-700 ease-out ${compact ? "home-signature-product-image" : ""} ${catalog && !ringCatalog || editorial ? "scale-[1.07]" : ""} ${
          detailImage
              ? `${catalog && !ringCatalog || editorial ? "group-hover:scale-[1.11]" : compact || ringCatalog ? "" : "group-hover:scale-[1.015]"} group-hover:opacity-0 group-focus-visible:opacity-0`
              : catalog && !ringCatalog || editorial ? "group-hover:scale-[1.11]" : compact || ringCatalog ? "" : "group-hover:scale-[1.025]"
          }`}
        secondaryImageClassName={`pointer-events-none ${ringCatalog ? "object-contain catalog-product-image catalog-product-image-cutout" : "object-cover"} opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 ${compact ? "home-signature-product-image" : ""} ${
          catalog && !ringCatalog || editorial ? "scale-[1.07] group-hover:scale-[1.11]" : compact || ringCatalog ? "" : "group-hover:scale-[1.015]"
        }`}
      />
      <div className={`px-0.5 sm:px-1 ${catalog || editorial ? `${ringCatalog ? "catalog-ring-copy pt-2.5" : "pt-3"} text-right sm:pt-4` : `text-center ${compact ? "pt-3 sm:pt-4" : "pt-3 sm:pt-5"}`}`}>
        <h3 className={`font-display leading-snug transition-colors group-hover:text-gold-deep ${ringCatalog ? "catalog-ring-name text-base sm:text-lg" : compact ? "text-[0.9rem] sm:text-base" : catalog ? "text-base sm:text-lg" : editorial ? "text-base lg:text-lg" : "text-[0.95rem] sm:text-lg"}`}>
          {product.name}
        </h3>
        <p className={`${ringCatalog ? "catalog-ring-price mt-1 text-[0.94rem] tabular-nums sm:mt-2 sm:text-base" : "font-display tracking-[0.02em]"} font-medium text-ink ${compact ? "mt-1 text-[0.95rem] sm:mt-2 sm:text-base" : ringCatalog ? "" : catalog ? "mt-2 text-[1.05rem] sm:text-lg" : editorial ? "mt-1.5 text-base" : "mt-1.5 text-base sm:mt-2.5 sm:text-[1.08rem]"}`}>
          {catalog || editorial ? `מ־${formatPrice(product.priceFrom)}` : `החל מ־${formatPrice(product.priceFrom)}`}
        </p>
      </div>
    </Link>
  );
}
