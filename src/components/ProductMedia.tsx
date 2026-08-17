import Image from "next/image";
import type { CSSProperties } from "react";
import type { ProductGalleryImage } from "@/data/products";

interface ProductMediaProps {
  image: ProductGalleryImage;
  secondaryImage?: ProductGalleryImage;
  sizes: string;
  className?: string;
  imageClassName?: string;
  secondaryImageClassName?: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "eager" | "lazy";
  quality?: number;
  unoptimized?: boolean;
  decorative?: boolean;
  variant?: "default" | "pdp" | "catalog";
  transparent?: boolean;
}

export default function ProductMedia({
  image,
  secondaryImage,
  sizes,
  className = "",
  imageClassName = "object-cover",
  secondaryImageClassName = "",
  priority = false,
  fetchPriority,
  loading,
  quality,
  unoptimized = false,
  decorative = false,
  variant = "default",
  transparent = false,
}: ProductMediaProps) {
  const inferredPresentation = image.src.includes("/catalog/") ? "cutout" : "editorial";
  const presentation = image.presentation ?? inferredPresentation;
  const fit = image.fit ?? (presentation === "cutout" ? "contain" : "cover");
  const opticalScale = image.opticalScale ?? (presentation === "cutout" ? 1.08 : 1);
  const pdpImageClass = variant === "pdp"
    ? `${fit === "contain" ? "object-contain" : "object-cover"} pdp-product-image pdp-product-image-${presentation}`
    : "";
  const catalogImageClass = variant === "catalog"
    ? `${fit === "contain" ? "object-contain" : "object-cover"} catalog-product-image catalog-product-image-${presentation}`
    : "";
  const imageStyle = {
    ...(image.objectPosition ? { objectPosition: image.objectPosition } : {}),
    ...(variant === "pdp" ? { "--pdp-optical-scale": opticalScale } : {}),
    ...(variant === "catalog" ? { "--catalog-optical-scale": opticalScale } : {}),
  } as CSSProperties;
  const secondaryStyle = {
    ...(secondaryImage?.objectPosition ? { objectPosition: secondaryImage.objectPosition } : {}),
    ...(variant === "catalog" ? { "--catalog-optical-scale": secondaryImage?.opticalScale ?? opticalScale } : {}),
  } as CSSProperties;

  return (
    <div
      className={`product-media-surface relative overflow-hidden ${transparent ? "product-media-transparent" : ""} ${variant === "pdp" ? `pdp-media-surface pdp-media-${presentation}` : ""} ${variant === "catalog" ? `catalog-media-surface catalog-media-${presentation}` : ""} ${className}`}
      data-media-presentation={variant !== "default" ? presentation : undefined}
    >
      <Image
        src={image.src}
        alt={decorative ? "" : image.alt}
        fill
        sizes={sizes}
        priority={priority}
        fetchPriority={fetchPriority}
        loading={loading}
        quality={quality}
        unoptimized={unoptimized}
        className={`${imageClassName} ${pdpImageClass} ${catalogImageClass}`.trim()}
        style={imageStyle}
      />
      {secondaryImage && (
        <Image
          src={secondaryImage.src}
          alt=""
          fill
          sizes={sizes}
          loading={loading}
          quality={quality}
          unoptimized={unoptimized}
          className={secondaryImageClassName}
          style={secondaryStyle}
        />
      )}
    </div>
  );
}
