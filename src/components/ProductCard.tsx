import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";
import { productImage } from "@/data/products";
import { formatPrice } from "@/lib/site";

export default function ProductCard({ product }: { product: Product }) {
  const badge = product.featured && !product.bestseller ? "בחירת הסטודיו" : null;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="art-bg relative aspect-square overflow-hidden border border-line transition-colors duration-300 group-hover:border-gold/70">
        {badge && (
          <span className="absolute right-3 top-3 z-10 border border-line bg-ivory/92 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-gold-deep backdrop-blur-sm">
            {badge}
          </span>
        )}
        <Image
          src={productImage(product)}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="px-1 pt-4 text-center">
        <h3 className="font-display text-lg leading-snug transition-colors group-hover:text-gold-deep">
          {product.name}
        </h3>
        <p className="mx-auto mt-1 min-h-9 max-w-[18rem] text-xs leading-5 text-stone">{product.subtitle}</p>
        <p className="mt-3 font-display text-[1.05rem] font-medium tracking-wide text-ink">
          החל מ־{formatPrice(product.priceFrom)}
        </p>
        <p className="mt-2 inline-flex items-center justify-center border-t border-line px-4 pt-2 text-[0.68rem] font-semibold tracking-[0.12em] text-stone">
          תעודה + אחריות
        </p>
      </div>
    </Link>
  );
}
