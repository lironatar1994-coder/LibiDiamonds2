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
  const relatedTitle = {
    rings: "טבעות נוספות",
    earrings: "עגילים נוספים",
    necklaces: "שרשראות נוספות",
    bracelets: "צמידים נוספים",
  }[product.category];
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
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: site.currency },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: site.country },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 5, maxValue: 10, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 4, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: site.country,
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
      },
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
        <div className="mx-auto max-w-[88rem] px-4 py-2 sm:px-6 sm:py-5 lg:px-8 lg:py-9">
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

      <section id="related-products" className="mt-6 scroll-mt-24 bg-ivory py-7 sm:mt-8 sm:py-9 lg:mt-10 lg:py-11">
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-5">
            <h2 className="font-display text-[1.6rem] font-medium leading-tight sm:text-3xl lg:text-[2rem]">{relatedTitle}</h2>
            <Link
              href={`/jewelry/${category.slug}`}
              className="shrink-0 border-b border-gold/45 pb-0.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold hover:text-ink sm:text-sm"
            >
              לכל ה{category.name}
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-7 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            {related.map((p, index) => (
              <div key={p.slug} className={index > 1 ? "hidden sm:block" : "block"}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
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
