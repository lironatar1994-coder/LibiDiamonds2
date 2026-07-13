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
        className={imageClassName}
        style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
      />
      {secondaryImage && (
        <Image
          src={secondaryImage.src}
          alt=""
          fill
          sizes={sizes}
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
