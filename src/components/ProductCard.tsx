import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";
import { productImages } from "@/data/products";
import { formatPrice } from "@/lib/site";

export default function ProductCard({
  product,
  variant = "standard",
}: {
  product: Product;
  variant?: "standard" | "compact";
}) {
  const badge = product.featured && !product.bestseller ? "בחירת הסטודיו" : null;
  const images = productImages(product);
  const detailImage = images[1];
  const compact = variant === "compact";

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="art-bg product-card-frame relative aspect-square overflow-hidden bg-ivory">
        {badge && (
          <span className="absolute right-3 top-3 z-10 border border-gold/30 bg-white/88 px-3 py-1 text-[0.66rem] font-semibold tracking-[0.1em] text-ink-soft backdrop-blur-sm">
            {badge}
          </span>
        )}
        <Image
          src={images[0].src}
          alt={images[0].alt}
          fill
          sizes={compact ? "(min-width: 1024px) 20vw, 50vw" : "(min-width: 1024px) 33vw, 50vw"}
          className={`object-cover transition-all duration-700 ease-out ${
            detailImage
              ? "group-hover:scale-[1.015] group-hover:opacity-0 group-focus-visible:opacity-0"
              : "group-hover:scale-[1.025]"
          }`}
        />
        {detailImage && (
          <Image
            src={detailImage.src}
            alt=""
            fill
            sizes={compact ? "(min-width: 1024px) 20vw, 50vw" : "(min-width: 1024px) 33vw, 50vw"}
            className="pointer-events-none object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.015] group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        )}
      </div>
      <div className={`px-0.5 text-center sm:px-1 ${compact ? "pt-3 sm:pt-4" : "pt-3 sm:pt-5"}`}>
        <h3 className={`font-display leading-snug transition-colors group-hover:text-gold-deep ${compact ? "text-[0.9rem] sm:text-base" : "text-[0.95rem] sm:text-lg"}`}>
          {product.name}
        </h3>
        <p className={`font-display font-medium tracking-[0.02em] text-ink ${compact ? "mt-1 text-[0.95rem] sm:mt-2 sm:text-base" : "mt-1.5 text-base sm:mt-2.5 sm:text-[1.08rem]"}`}>
          החל מ־{formatPrice(product.priceFrom)}
        </p>
        <p className={`product-card-trust mt-1.5 justify-center font-semibold tracking-[0.1em] text-stone/75 sm:mt-2 sm:tracking-[0.13em] ${compact ? "text-[0.55rem] sm:text-[0.6rem]" : "text-[0.58rem] sm:text-[0.64rem]"}`}>
          תעודה + אחריות
        </p>
      </div>
    </Link>
  );
}
