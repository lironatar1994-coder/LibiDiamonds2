import Image from "next/image";
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
  unoptimized?: boolean;
  decorative?: boolean;
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
  unoptimized = false,
  decorative = false,
}: ProductMediaProps) {
  return (
    <div className={`product-media-surface relative overflow-hidden ${className}`}>
      <Image
        src={image.src}
        alt={decorative ? "" : image.alt}
        fill
        sizes={sizes}
        priority={priority}
        fetchPriority={fetchPriority}
        loading={loading}
        unoptimized={unoptimized}
        className={imageClassName}
        style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
      />
      {secondaryImage && (
        <Image
          src={secondaryImage.src}
          alt=""
          fill
          sizes={sizes}
          loading={loading}
          unoptimized={unoptimized}
          className={secondaryImageClassName}
          style={
            secondaryImage.objectPosition
              ? { objectPosition: secondaryImage.objectPosition }
              : undefined
          }
        />
      )}
    </div>
  );
}
