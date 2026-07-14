import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductView from "@/components/ProductView";
import {
  getCategory,
  getProduct,
  metalNames,
  productImages,
  products,
  relatedProducts,
} from "@/data/products";
import { absoluteUrl, site } from "@/lib/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const image = productImages(product)[0];

  return pageMetadata({
    title: `${product.name} עם יהלום מעבדה`,
    description: `${product.name} מבית LIBI DIAMONDS. ${product.subtitle}. בחירת קראט וגוון זהב, תעודה גמולוגית וליווי אישי. החל מ־${new Intl.NumberFormat("he-IL").format(product.carats[0].price)} ₪.`,
    path: `/product/${product.slug}`,
    image: image.src,
    imageAlt: image.alt,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category)!;
  const related = relatedProducts(product);
  const images = productImages(product);
  const productUrl = absoluteUrl(`/product/${product.slug}`);
  const breadcrumb = breadcrumbJsonLd([
    { name: "ראשי", path: "/" },
    { name: category.name, path: `/jewelry/${category.slug}` },
    { name: product.name, path: `/product/${product.slug}` },
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.description,
    url: productUrl,
    sku: product.slug,
    image: images.map((image) => absoluteUrl(image.src)),
    category: category.title,
    material: product.metals.map((metal) => metalNames[metal]).join(", "),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "AggregateOffer",
      url: productUrl,
      priceCurrency: site.currency,
      lowPrice: product.carats[0].price,
      highPrice: product.carats[product.carats.length - 1].price,
      offerCount: product.carats.length,
      availability: "https://schema.org/InStock",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "צבע היהלום", value: product.specs.color },
      { "@type": "PropertyValue", name: "ניקיון היהלום", value: product.specs.clarity },
      { "@type": "PropertyValue", name: "ליטוש", value: product.specs.cut },
      { "@type": "PropertyValue", name: "תעודה", value: product.specs.cert },
    ],
  };

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-[88rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-9">
          <nav className="mb-6 hidden text-xs tracking-[0.04em] text-stone md:block lg:mb-9" aria-label="פירורי לחם">
            <Link href="/" className="hover:text-gold-deep">
              ראשי
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/jewelry/${category.slug}`} className="hover:text-gold-deep">
              {category.name}
            </Link>
            <span className="mx-2">/</span>
            <span>{product.name}</span>
          </nav>

          <ProductView product={product} />
        </div>
      </div>

      <section className="mt-4 bg-platinum-soft py-9 sm:mt-6 lg:mt-12 lg:py-14">
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-[1.85rem] font-medium leading-tight sm:text-3xl lg:text-4xl">עוד {category.name} מהקולקציה</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-9 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          <Link
            href={`/jewelry/${category.slug}`}
            className="mt-8 inline-block border-b border-gold/55 pb-1 text-sm font-semibold text-ink-soft transition-colors hover:border-gold hover:text-ink lg:mt-10"
          >
            לכל ה{category.name}
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
