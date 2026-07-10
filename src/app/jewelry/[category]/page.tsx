import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import {
  categories,
  getCategory,
  productsByCategory,
  type CategorySlug,
} from "@/data/products";

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
  return {
    title: cat.title,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategory(category as CategorySlug);
  if (!cat) notFound();

  const items = productsByCategory(cat.slug);
  const others = categories.filter((c) => c.slug !== cat.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <nav className="text-xs text-stone" aria-label="פירורי לחם">
        <Link href="/" className="hover:text-gold">
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
    </div>
  );
}
