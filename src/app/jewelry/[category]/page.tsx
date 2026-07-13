import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import {
  categories,
  getCategory,
  productImages,
  productsByCategory,
  type CategorySlug,
} from "@/data/products";
import { absoluteUrl, site } from "@/lib/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category as CategorySlug);
  if (!cat) return {};
  const firstProduct = productsByCategory(cat.slug)[0];
  const image = firstProduct ? productImages(firstProduct)[0] : undefined;

  return pageMetadata({
    title: `${cat.title} עם יהלומי מעבדה`,
    description: `${cat.title} עם יהלומי מעבדה בזהב 14K ו־18K. בחרו סגנון, קראט וגוון זהב עם תעודה גמולוגית, משלוח מבוטח וליווי אישי של LIBI DIAMONDS.`,
    path: `/jewelry/${cat.slug}`,
    image: image?.src,
    imageAlt: image?.alt,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategory(category as CategorySlug);
  if (!cat) notFound();

  const items = productsByCategory(cat.slug);
  const others = categories.filter((c) => c.slug !== cat.slug);
  const breadcrumb = breadcrumbJsonLd([
    { name: "ראשי", path: "/" },
    { name: cat.name, path: `/jewelry/${cat.slug}` },
  ]);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.title,
    description: cat.description,
    url: absoluteUrl(`/jewelry/${cat.slug}`),
    inLanguage: site.language,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: absoluteUrl(`/product/${product.slug}`),
      })),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <nav className="text-xs text-stone" aria-label="פירורי לחם">
        <Link href="/" className="hover:text-gold-deep">
          ראשי
        </Link>
        <span className="mx-2">/</span>
        <span>{cat.name}</span>
      </nav>

      <header className="mt-8 max-w-2xl">
        <h1 className="font-display text-4xl font-medium">{cat.title}</h1>
        <p className="mt-4 leading-relaxed text-stone">{cat.description}</p>
      </header>

      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      <aside className="mt-20 border-t border-line pt-10">
        <p className="text-sm text-stone">להמשיך לעיין:</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/jewelry/${c.slug}`}
              className="border border-line px-5 py-2.5 text-sm transition-colors hover:border-gold hover:text-gold-deep"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </aside>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
    </div>
  );
}
