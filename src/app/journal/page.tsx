import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { guides } from "@/data/guides";
import { absoluteUrl, assetPath, site } from "@/lib/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "מדריכים ליהלומי מעבדה וטבעות אירוסין",
  description:
    "כל מה שכדאי לדעת לפני שבוחרים תכשיט יהלום: יהלומי מעבדה, 4C, טבעות אירוסין ועוד — בעברית פשוטה וברורה.",
  path: "/journal",
  image: guides[0].cover.src,
  imageAlt: guides[0].cover.alt,
});

export default function JournalPage() {
  const [featuredGuide, ...moreGuides] = guides;
  const breadcrumb = breadcrumbJsonLd([
    { name: "ראשי", path: "/" },
    { name: "LIBI Journal", path: "/journal" },
  ]);
  const journalJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "LIBI Journal",
    description: metadata.description,
    url: absoluteUrl("/journal"),
    inLanguage: site.language,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: guides.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: absoluteUrl(`/journal/${guide.slug}`),
      })),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18">
      <header>
        <h1 className="max-w-2xl font-display text-4xl font-medium leading-tight sm:text-5xl">לדעת מה בוחרים.</h1>
      </header>

      <Link href={`/journal/${featuredGuide.slug}`} className="group mt-7 block sm:mt-9">
        <article className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)] lg:gap-12">
          <div className="relative aspect-[3/2] overflow-hidden bg-warm-stone">
            <Image
              src={assetPath(featuredGuide.cover.src)}
              alt={featuredGuide.cover.alt}
              fill
              priority
              sizes="(min-width: 1024px) 64vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-stone">{featuredGuide.readingMinutes} דקות קריאה</p>
            <h2 className="mt-3 font-display text-3xl font-medium leading-snug transition-colors group-hover:text-gold-deep sm:text-4xl">
              {featuredGuide.title}
            </h2>
          </div>
        </article>
      </Link>

      <div className="mt-12 grid gap-x-6 gap-y-10 md:grid-cols-3 lg:mt-16">
        {moreGuides.map((guide) => (
          <Link key={guide.slug} href={`/journal/${guide.slug}`} className="group block">
            <article>
              <div className="relative aspect-[3/2] overflow-hidden bg-warm-stone">
                <Image
                  src={assetPath(guide.cover.src)}
                  alt={guide.cover.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <p className="mt-4 text-xs font-semibold tracking-[0.07em] text-stone">{guide.readingMinutes} דקות קריאה</p>
              <h2 className="mt-2 font-display text-2xl font-medium leading-snug transition-colors group-hover:text-gold-deep">
                {guide.title}
              </h2>
            </article>
          </Link>
        ))}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(journalJsonLd) }} />
    </div>
  );
}
