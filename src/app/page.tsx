import type { Metadata } from "next";
import Link from "next/link";
import Image, { getImageProps } from "next/image";
// import DiamondShapeSelector from "@/components/DiamondShapeSelector";
import ProductCard from "@/components/ProductCard";
import HomeTryOnFeature from "@/components/HomeTryOnFeature";
import { WhatsAppIcon } from "@/components/icons";
import {
  categories,
  products,
  type CategorySlug,
  type Metal,
} from "@/data/products";
import { guides } from "@/data/guides";
import { site, waLink, assetPath } from "@/lib/site";
import { onlineStoreJsonLd, pageMetadata } from "@/lib/seo";

const heroAlt = "טבעת סוליטר מזהב צהוב עם יהלום אובלי על שכבות אבן שיש בגוני לבן ושמנת עם עורק זהב עדין";
const { props: heroDesktopImage } = getImageProps({
  src: assetPath("/images/hero/ivory-gold-v1/hero-desktop.webp"),
  alt: heroAlt,
  fill: true,
  priority: true,
  sizes: "100vw",
});
const {
  props: { srcSet: heroMobileSrcSet },
} = getImageProps({
  src: assetPath("/images/hero/ivory-gold-v1/hero-mobile.webp"),
  alt: heroAlt,
  fill: true,
  sizes: "100vw",
});

const featuredJournalGuide = guides.find((guide) => guide.slug === "why-choose-a-lab-diamond")!;
const featuredJournalCover = {
  src: assetPath("/images/journal/v2-platinum-ice/why-choose-a-lab-diamond.webp"),
  alt: "יהלום עגול מלוטש בין משטח אבן בגוון פלטינה למשטח קריסטל חלבי",
};
const secondaryJournalGuides = ["what-is-a-lab-diamond", "the-four-cs"].map(
  (slug) => guides.find((guide) => guide.slug === slug)!,
);

const mostLovedRings: Array<{ slug: string; metal: Metal }> = [
  { slug: "aura-solitaire-ring", metal: "yellow" },
  { slug: "elara-oval-hidden-halo-ring", metal: "yellow" },
  { slug: "atelier-emerald-cathedral-ring", metal: "white" },
  { slug: "seren-pear-solitaire-ring", metal: "white" },
];

export const metadata: Metadata = pageMetadata({
  title: `${site.name} — תכשיטי יהלומי מעבדה וטבעות אירוסין`,
  description:
    "טבעות אירוסין ותכשיטי יהלומי מעבדה בזהב 14K ו־18K, עם תעודה גמולוגית, משלוח מבוטח וליווי אישי בבחירת האבן והמידה.",
  path: "/",
  image: site.socialImage,
  imageAlt: "טבעת סוליטר עם יהלום מעבדה בזהב צהוב מבית LIBI DIAMONDS",
});

function SectionHeading({
  title,
  variant = "editorial",
  className = "",
}: {
  title: string;
  variant?: "editorial" | "centered";
  className?: string;
}) {
  if (variant === "centered") {
    return (
      <div className={`text-center ${className}`}>
        <h2 className="font-display text-[1.7rem] font-medium sm:text-4xl">{title}</h2>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="font-display text-[2rem] font-medium leading-none sm:text-4xl">{title}</h2>
    </div>
  );
}
const collectionOrder: CategorySlug[] = ["rings", "earrings", "bracelets", "necklaces"];

const collectionEditorialImages: Record<CategorySlug, { src: string; alt: string }> = {
  rings: {
    src: assetPath("/images/editorial/categories/v5-ivory-atelier/rings-yellow-gold.webp"),
    alt: "טבעת סוליטר מזהב צהוב ויהלום עגול על שכבות אבן שיש בגוני לבן ושמנת",
  },
  earrings: {
    src: assetPath("/images/editorial/categories/v5-ivory-atelier/earrings-yellow-gold.webp"),
    alt: "זוג עגילי יהלום צמודים מזהב צהוב על אבן שיש לבנה עם עורק זהב עדין",
  },
  bracelets: {
    src: assetPath("/images/editorial/categories/v5-ivory-atelier/bracelets-yellow-gold.webp"),
    alt: "צמיד טניס מזהב צהוב ויהלומים על שכבות אבן שיש לבנה",
  },
  necklaces: {
    src: assetPath("/images/editorial/categories/v5-ivory-atelier/necklaces-yellow-gold.webp"),
    alt: "שרשרת טניס מדורגת מזהב צהוב ויהלומים על שכבות אבן שיש בגוון אייבורי",
  },
};

const collectionPlacement: Record<CategorySlug, string> = {
  rings: "col-span-2 lg:col-span-6 lg:row-span-2",
  earrings: "col-span-1 lg:col-span-3",
  bracelets: "col-span-1 lg:col-span-3",
  necklaces: "col-span-2 lg:col-span-6",
};

const collectionLabelPlacement: Record<CategorySlug, string> = {
  rings: "bottom-5 right-5 sm:bottom-6 sm:right-6",
  earrings: "bottom-4 right-4 sm:bottom-5 sm:right-5",
  bracelets: "bottom-4 right-4 sm:bottom-5 sm:right-5",
  necklaces: "bottom-5 right-5 sm:bottom-6 sm:right-6",
};

function CollectionTile({ category }: { category: CategorySlug }) {
  const item = categories.find((candidate) => candidate.slug === category)!;
  const images = collectionEditorialImages[category];
  const tall = category === "rings";
  const wide = category === "necklaces";
  const labelSize = tall || wide ? "text-[1.0625rem]" : "text-base";

  return (
    <Link
      href={`/jewelry/${category}`}
      className={`home-collection-link group min-h-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink ${collectionPlacement[category]}`}
    >
      <div
        className={`home-collection-tile home-photo-surface relative overflow-hidden ${
          tall
            ? "aspect-[4/3] lg:h-full lg:aspect-auto"
            : wide
              ? "aspect-[15/8] lg:h-full lg:aspect-auto"
              : "aspect-[4/3] lg:h-full lg:aspect-auto"
        }`}
      >
        <Image
          src={images.src}
          alt={images.alt}
          fill
          sizes={tall || wide ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
          className="home-photo-grade object-cover transition-transform duration-1000 ease-out motion-safe:lg:group-hover:scale-[1.025]"
        />
        <div
          aria-hidden="true"
          className="home-collection-scrim pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[34%]"
        />
        <h3
          className={`home-collection-label absolute z-10 font-display font-medium leading-none text-ink drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)] lg:text-xl ${labelSize} ${collectionLabelPlacement[category]}`}
        >
          {item.name}
        </h3>
      </div>
    </Link>
  );
}
/* Temporarily hidden from the homepage; keep the data ready for restoration.
const diamondShapes = [
  {
    name: "עגול",
    type: "round",
    image: assetPath("/images/diamond-shapes/v2/round.webp"),
  },
  {
    name: "אובל",
    type: "oval",
    image: assetPath("/images/diamond-shapes/v2/oval.webp"),
  },
  {
    name: "אמרלד",
    type: "emerald",
    image: assetPath("/images/diamond-shapes/v2/emerald.webp"),
  },
  {
    name: "קושן",
    type: "cushion",
    image: assetPath("/images/diamond-shapes/v2/cushion.webp"),
  },
  {
    name: "טיפה",
    type: "pear",
    image: assetPath("/images/diamond-shapes/v2/pear.webp"),
  },
  {
    name: "פרינסס",
    type: "princess",
    image: assetPath("/images/diamond-shapes/v2/princess.webp"),
  },
] as const;
*/

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.domain}/#website`,
    url: site.domain,
    name: site.name,
    alternateName: site.nameHe,
    inLanguage: site.language,
    publisher: { "@id": `${site.domain}/#organization` },
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-editorial relative isolate overflow-hidden" aria-labelledby="home-hero-title">
        <div className="relative h-[calc(100svh-4rem)] min-h-[570px] max-h-[700px] overflow-hidden bg-[#f2eee6] sm:min-h-[640px] sm:max-h-[760px] lg:h-[min(82svh,760px)] lg:min-h-[620px]">
          <picture className="absolute inset-0 block">
            <source media="(max-width: 1023px)" srcSet={heroMobileSrcSet} sizes="100vw" />
            {/* eslint-disable-next-line @next/next/no-img-element -- getImageProps art direction */}
            <img
              {...heroDesktopImage}
              alt={heroAlt}
              className="ivory-hero-image object-cover object-top lg:object-[center_54%]"
            />
          </picture>
          <div aria-hidden="true" className="hero-cover-shade absolute inset-0" />
          <span className="midnight-hero-facet" aria-hidden="true" />
          <div dir="ltr" className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-7xl px-5 pb-8 sm:px-10 sm:pb-12 lg:inset-y-0 lg:grid lg:grid-cols-2 lg:items-center lg:px-12 lg:pb-0">
            <div dir="rtl" className="text-center lg:col-start-1 lg:max-w-[32rem] lg:text-right">
              <h1 id="home-hero-title" className="cascade font-display text-[clamp(2.8rem,13vw,4.35rem)] font-light leading-[1.05] tracking-[-0.01em] text-[#071827] lg:text-[clamp(4.75rem,5.8vw,6rem)]" style={{ animationDelay: "100ms" }}>
                היהלום במרכז.
              </h1>
              <div className="cascade mt-4 flex justify-center lg:mt-8 lg:justify-start" style={{ animationDelay: "220ms" }}>
                <Link href="/jewelry/rings" className="hero-cover-cta inline-flex min-h-[52px] min-w-60 items-center justify-center gap-3 px-8 text-sm font-semibold tracking-[0.035em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gilt">
                  <i aria-hidden="true" />
                  <span>גלו טבעות יהלום</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop by diamond shape ────────────────────────── */}
      {/* Temporarily hidden by request.
      <section className="section-diamond-light pb-10 pt-9 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="חיתוכי יהלום" variant="centered" />
          <DiamondShapeSelector shapes={diamondShapes} />
        </div>
      </section>
      */}

      {/* ── Categories ───────────────────────────────────── */}
      <section className="section-gallery section-gallery-collection section-collection-atmosphere" aria-labelledby="collection-title">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-11 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="home-collection-heading text-center">
            <p className="home-section-kicker">FIND YOUR PIECE</p>
            <h2 id="collection-title" className="mt-3 font-display text-[2.15rem] font-medium leading-none text-ink sm:text-[2.8rem]">
              מצאו את התכשיט שלכם
            </h2>
            <div className="home-collection-ornament mx-auto mt-5" aria-hidden="true">
              <span />
              <i />
              <span />
            </div>
          </div>
          <div className="home-collection-grid mt-9 grid grid-cols-2 gap-3 sm:mt-11 sm:gap-5 lg:grid-cols-12 lg:grid-rows-[17rem_17rem] xl:grid-rows-[20rem_20rem]">
            {collectionOrder.map((category) => (
              <CollectionTile key={category} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Four intentional bestsellers, not an endless storefront carousel. */}
      <section className="section-most-loved py-14 sm:py-20 lg:py-24" aria-labelledby="most-loved-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div>
            <div>
              <p className="home-section-kicker">LIBI SIGNATURES</p>
              <h2 id="most-loved-title" className="mt-2 font-display text-[2rem] font-medium leading-none sm:text-4xl">
                הטבעות הנבחרות
              </h2>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:mt-11 lg:grid-cols-4 lg:gap-6">
            {mostLovedRings.map(({ slug, metal }) => {
              const product = products.find((candidate) => candidate.slug === slug)!;
              return <ProductCard key={slug} product={product} variant="compact" metal={metal} />;
            })}
          </div>
          <div className="mt-10 text-center sm:mt-12">
            <Link
              href="/jewelry/rings"
              className="home-most-loved-link inline-flex min-h-11 items-center justify-center gap-3 border-b border-gilt/55 px-1 text-sm font-semibold tracking-[0.035em] text-ink-soft transition-colors hover:border-gilt hover:text-ink"
            >
              לכל קולקציית הטבעות <span aria-hidden="true">←</span>
            </Link>
          </div>
        </div>
      </section>

      <HomeTryOnFeature />

      <section className="section-bespoke" aria-labelledby="bespoke-inspiration-title">
        <div className="home-bespoke-stage mx-auto max-w-7xl overflow-hidden">
          <div className="home-bespoke-images">
            <div className="home-bespoke-media home-bespoke-media-ring relative overflow-hidden">
              <Image
                src={assetPath("/images/editorial/v6-bespoke/ring-luminous.webp")}
                alt="טבעת סוליטר מזהב צהוב עם יהלום עגול בוהק על משטח שיש בגוון אייבורי"
                fill
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="home-bespoke-image object-cover object-[center_58%]"
              />
            </div>
          </div>

          <div className="home-bespoke-copy">
            <div className="home-bespoke-heading">
              <p className="home-bespoke-kicker">LIBI BESPOKE</p>
              <h2
                id="bespoke-inspiration-title"
                className="mt-2 font-display text-[2.2rem] font-medium leading-tight text-ivory sm:text-5xl"
              >
                יש לכם טבעת בראש?
              </h2>
            </div>
            <a
              href={waLink("היי, יש לי רעיון לטבעת ואשמח לייעוץ אישי")}
              target="_blank"
              rel="noopener noreferrer"
              className="home-bespoke-cta inline-flex min-h-[52px] items-center justify-center gap-2 px-7 text-sm font-semibold"
            >
              <WhatsAppIcon className="h-4 w-4" />
              ייעוץ אישי בוואטסאפ
            </a>
          </div>
        </div>
      </section>

      {/* ── LIBI Journal ───────────────────────────────── */}
      <section className="section-gallery section-gallery-journal py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-[2rem] font-medium leading-none sm:text-4xl">לדעת מה בוחרים.</h2>
            <Link
              href="/journal"
              className="shrink-0 border-b border-gilt/55 pb-1 text-xs font-semibold tracking-[0.05em] text-ink-soft hover:border-gilt hover:text-ink sm:text-sm"
            >
              לכל המדריכים
            </Link>
          </div>

          <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:gap-10">
            <Link href={`/journal/${featuredJournalGuide.slug}`} className="group block">
              <article>
                <div className="home-photo-surface relative aspect-[3/2] overflow-hidden bg-warm-stone">
                  <Image
                    src={featuredJournalCover.src}
                    alt={featuredJournalCover.alt}
                    fill
                    sizes="(min-width: 1024px) 67vw, 100vw"
                    className="home-journal-image object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                  />
                </div>
                <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.08em] text-stone">
                  {featuredJournalGuide.readingMinutes} דקות קריאה
                </p>
                <h3 className="mt-2 max-w-3xl font-display text-2xl font-medium leading-snug transition-colors group-hover:text-gold-deep sm:text-3xl">
                  {featuredJournalGuide.title}
                </h3>
              </article>
            </Link>

            <div className="border-t border-line lg:border-t-0">
              {secondaryJournalGuides.map((guide) => (
                <Link key={guide.slug} href={`/journal/${guide.slug}`} className="group block border-b border-line py-5 first:pt-5 lg:first:pt-0">
                  <article className="grid grid-cols-[7.25rem_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-1 lg:items-start lg:gap-0">
                    <div className="home-photo-surface relative aspect-[4/3] overflow-hidden bg-warm-stone lg:aspect-[3/2]">
                      <Image
                        src={assetPath(guide.cover.src)}
                        alt={guide.cover.alt}
                        fill
                        sizes="(min-width: 1024px) 26vw, 144px"
                        className="home-journal-image scale-[1.035] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055] lg:scale-100 lg:group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="min-w-0 lg:mt-3">
                      <p className="text-[0.6875rem] font-semibold tracking-[0.07em] text-stone">{guide.readingMinutes} דקות קריאה</p>
                      <h3 className="mt-1.5 font-display text-lg font-medium leading-snug transition-colors group-hover:text-gold-deep sm:text-xl">
                        {guide.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(onlineStoreJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </>
  );
}
