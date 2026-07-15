import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryCatalog from "@/components/CategoryCatalog";
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
    <div className="section-gallery">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-11 lg:px-8">
        <nav className="hidden text-xs text-stone sm:block" aria-label="פירורי לחם">
        <Link href="/" className="hover:text-gold-deep">
          ראשי
        </Link>
        <span className="mx-2">/</span>
        <span>{cat.name}</span>
        </nav>

        <header className="text-center sm:mt-6 sm:max-w-2xl sm:text-right">
          <h1 className="font-display text-[2.15rem] font-medium leading-tight sm:text-4xl">{cat.name}</h1>
        </header>

        <CategoryCatalog items={items} category={cat.slug} />

        <aside className="mt-16 border-t border-line pt-8 sm:mt-20 sm:pt-10" aria-label="קטגוריות נוספות">
          <div className="flex flex-nowrap justify-center divide-x divide-gold/35" dir="rtl">
            {others.map((c) => (
              <Link
                key={c.slug}
                href={`/jewelry/${c.slug}`}
                className="px-5 py-1 text-sm text-ink-soft transition-colors hover:text-gold-deep focus-visible:text-gold-deep sm:px-7"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </aside>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      </div>
    </div>
  );
}
