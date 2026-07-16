import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ProductMedia from "@/components/ProductMedia";
import DiamondShapeSelector from "@/components/DiamondShapeSelector";
import HeroRefraction from "@/components/HeroRefraction";
import { WhatsAppIcon } from "@/components/icons";
import {
  categories,
  products,
  productImages,
  type CategorySlug,
  type Product,
} from "@/data/products";
import { guides } from "@/data/guides";
import { site, waLink, assetPath, formatPrice } from "@/lib/site";
import { servicePromises } from "@/lib/service";
import { onlineStoreJsonLd, pageMetadata } from "@/lib/seo";

const featuredJournalGuide = guides.find((guide) => guide.slug === "why-choose-a-lab-diamond")!;
const secondaryJournalGuides = ["what-is-a-lab-diamond", "the-four-cs"].map(
  (slug) => guides.find((guide) => guide.slug === slug)!,
);

export const metadata: Metadata = pageMetadata({
  title: `${site.name} — תכשיטי יהלומי מעבדה וטבעות אירוסין`,
  description:
    "טבעות אירוסין ותכשיטי יהלומי מעבדה בזהב 14K ו־18K, עם תעודה גמולוגית, משלוח מבוטח וליווי אישי בבחירת האבן והמידה.",
  path: "/",
  image: site.socialImage,
  imageAlt: "טבעת סוליטר עם יהלום מעבדה בזהב צהוב מבית LIBI DIAMONDS",
});

const faqs = [
  {
    q: "האם יהלום מעבדה הוא יהלום אמיתי?",
    a: "כן, לחלוטין. יהלום מעבדה זהה כימית, פיזית ואופטית ליהלום שנכרה מהאדמה — אותו פחמן גבישי, אותה קשיחות ואותו ברק. ההבדל היחיד הוא מקום ההיווצרות, וזה גם מה שמאפשר מחיר נגיש משמעותית.",
  },
  {
    q: "מה כוללת התעודה הגמולוגית?",
    a: "כל יהלום מרכזי מגיע עם תעודה של מעבדה גמולוגית בינלאומית (IGI או GIA), המתעדת את משקל האבן, צבעה, רמת הניקיון ואיכות הליטוש — וכן את היותה יהלום מעבדה. התעודה שלכם, לתמיד.",
  },
  {
    q: "מהם זמני האספקה?",
    a: `פריטים מהקולקציה נשלחים תוך ${servicePromises.collectionLeadTime} בשליחות מבוטחת עד הבית. הזמנות בהתאמה אישית — בדרך כלל ${servicePromises.bespokeLeadTime}.`,
  },
  {
    q: "אפשר להתאים תכשיט באופן אישי?",
    a: "בהחלט. אפשר לבחור כל שילוב של גודל אבן, גוון זהב ומידה — ואפשר גם לעצב יחד איתנו פריט חדש מאפס. שלחו לנו הודעה בוואטסאפ ונתחיל.",
  },
  {
    q: "מה קורה אם הטבעת לא מתאימה?",
    a: "התאמת מידה ראשונה — עלינו. ועל כל פריט חלה אחריות יצרן מלאה על השיבוץ והמתכת. הפרטים המלאים בעמוד המשלוחים והאחריות.",
  },
];

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

function EditorialBestsellers({ items }: { items: Product[] }) {
  const [featured, ...secondary] = items;

  return (
    <div className="mt-6 sm:mt-9 lg:mt-11">
      <div className="lg:hidden">
        <EditorialProductLink product={featured} featured />

        <div className="mt-9 grid grid-cols-2 gap-x-3 sm:gap-x-5">
          {secondary.slice(0, 2).map((product) => (
            <EditorialProductLink key={product.slug} product={product} />
          ))}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="grid grid-cols-12 items-start gap-7">
          <div className="col-span-8">
            <EditorialProductLink product={featured} featured />
          </div>

          <div className="col-span-4 space-y-8">
            {secondary.slice(0, 2).map((product) => (
              <EditorialProductLink key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorialProductLink({ product, featured = false }: { product: Product; featured?: boolean }) {
  const images = productImages(product);
  const image = featured ? images[1] ?? images[0] : images[0];

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <ProductMedia
        image={image}
        sizes={featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 34vw, 50vw"}
        className={`catalog-card-media ${featured ? "aspect-[4/3]" : "aspect-[4/5] lg:aspect-[16/9]"}`}
        imageClassName="object-cover scale-[1.035] transition-transform duration-1000 ease-out group-hover:scale-[1.065]"
      />
      <div className={`pt-4 ${featured ? "text-center lg:pt-5 lg:text-right" : "text-right"}`}>
        <h3 className={`font-display font-medium leading-snug ${featured ? "text-[1.35rem] sm:text-3xl" : "text-base lg:text-lg"}`}>
          {product.name}
        </h3>
        <p className={`font-display text-ink-soft ${featured ? "mt-1.5 text-base sm:text-lg" : "mt-1 text-[0.95rem] lg:text-base"}`}>
          מ־{formatPrice(product.priceFrom)}
        </p>
      </div>
    </Link>
  );
}

const collectionOrder: CategorySlug[] = ["rings", "earrings", "bracelets", "necklaces"];

const collectionEditorialImages: Record<CategorySlug, { mobile: string; desktop: string; alt: string }> = {
  rings: {
    mobile: assetPath("/images/editorial/categories/rings-desktop.webp"),
    desktop: assetPath("/images/editorial/categories/rings-mobile.webp"),
    alt: "טבעת סוליטר מזהב צהוב עם יהלום עגול",
  },
  earrings: {
    mobile: assetPath("/images/editorial/categories/earrings-mobile.webp"),
    desktop: assetPath("/images/editorial/categories/earrings-desktop.webp"),
    alt: "זוג עגילי יהלום צמודים מזהב לבן",
  },
  bracelets: {
    mobile: assetPath("/images/editorial/categories/bracelets-mobile.webp"),
    desktop: assetPath("/images/editorial/categories/bracelets-desktop.webp"),
    alt: "צמיד טניס מזהב לבן ויהלומים",
  },
  necklaces: {
    mobile: assetPath("/images/editorial/categories/necklaces-desktop.webp"),
    desktop: assetPath("/images/editorial/categories/necklaces-desktop.webp"),
    alt: "שרשרת טניס מדורגת מזהב לבן ויהלומים",
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
  bracelets: "left-4 top-4 sm:left-5 sm:top-5",
  necklaces: "bottom-5 right-5 sm:bottom-6 sm:right-6",
};

const collectionVeilPlacement: Record<CategorySlug, string> = {
  rings: "inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(to_top,rgba(247,246,242,0.78)_0%,rgba(247,246,242,0.3)_48%,rgba(247,246,242,0)_100%)]",
  earrings: "inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(to_top,rgba(247,246,242,0.78)_0%,rgba(247,246,242,0.3)_48%,rgba(247,246,242,0)_100%)]",
  bracelets: "inset-x-0 top-0 h-[34%] bg-[linear-gradient(to_bottom,rgba(247,246,242,0.78)_0%,rgba(247,246,242,0.3)_48%,rgba(247,246,242,0)_100%)]",
  necklaces: "inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(to_top,rgba(247,246,242,0.78)_0%,rgba(247,246,242,0.3)_48%,rgba(247,246,242,0)_100%)]",
};

function CollectionTile({ category }: { category: CategorySlug }) {
  const item = categories.find((candidate) => candidate.slug === category)!;
  const images = collectionEditorialImages[category];
  const tall = category === "rings";
  const wide = category === "necklaces";
  const imageScale = tall
    ? "scale-[1.035] group-hover:scale-[1.06]"
    : "group-hover:scale-[1.025]";
  const labelSize = tall || wide ? "text-[1.0625rem]" : "text-base";

  return (
    <Link
      href={`/jewelry/${category}`}
      className={`group min-h-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink ${collectionPlacement[category]}`}
    >
      <div
        className={`relative overflow-hidden ${
          tall
            ? "aspect-[4/3] lg:h-full lg:aspect-auto"
            : wide
              ? "aspect-[15/8] lg:h-full lg:aspect-auto"
              : "aspect-[4/3] lg:h-full lg:aspect-auto"
        }`}
      >
        <Image
          src={images.mobile}
          alt={images.alt}
          fill
          sizes={tall || wide ? "100vw" : "50vw"}
          className={`object-cover transition-transform duration-1000 ease-out lg:hidden ${imageScale}`}
        />
        <Image
          src={images.desktop}
          alt=""
          fill
          sizes={tall ? "50vw" : wide ? "50vw" : "25vw"}
          className={`hidden object-cover transition-transform duration-1000 ease-out lg:block ${imageScale}`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute ${collectionVeilPlacement[category]}`}
        />
        <h3
          className={`absolute z-10 font-display font-normal leading-none text-ink-soft lg:text-xl ${labelSize} ${collectionLabelPlacement[category]}`}
        >
          {item.name}
        </h3>
      </div>
    </Link>
  );
}

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

export default function HomePage() {
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 3);
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
      <section className="hero-editorial relative isolate overflow-hidden">
        <div className="relative h-[clamp(600px,150vw,650px)] overflow-hidden bg-[#f7f6f2] lg:hidden">
          <div className="hero-settle absolute inset-0 overflow-hidden">
            <Image
              src={assetPath("/images/hero/mineral/hero-mobile-v2.webp")}
              alt="טבעת יהלום מעבדה בזהב צהוב על משטח טרוורטין פיסולי"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-top sm:object-[50%_18%]"
            />
            <HeroRefraction variant="mobile" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(to_bottom,rgba(247,246,242,0)_0%,rgba(247,246,242,0.38)_38%,rgba(247,246,242,0.94)_72%,#f7f6f2_100%)]" />
        </div>

        <div className="absolute inset-0 hidden lg:block">
          <div className="hero-settle absolute inset-0">
            <Image
              src={assetPath("/images/hero/mineral/hero-desktop.webp")}
              alt="טבעת יהלום מעבדה בזהב צהוב על קצה אבן מינרלית"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
            <HeroRefraction variant="desktop" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,246,242,0.95)_0%,rgba(247,246,242,0.84)_32%,rgba(247,246,242,0.18)_58%,rgba(247,246,242,0)_72%)]" />
        </div>

        <div dir="ltr" className="absolute inset-x-0 bottom-9 z-10 mx-auto max-w-7xl px-4 sm:bottom-12 sm:px-6 lg:relative lg:inset-auto lg:grid lg:min-h-[min(82vh,760px)] lg:grid-cols-2 lg:items-center lg:px-8 lg:py-14">
          <div dir="rtl" className="text-center lg:col-start-1 lg:max-w-lg lg:text-right">
            <h1
              className="cascade mx-auto whitespace-nowrap font-display text-[2.05rem] font-light leading-none text-ink sm:text-[2.4rem] lg:mx-0 lg:whitespace-normal lg:text-6xl lg:leading-[1.04] xl:text-7xl"
              style={{ animationDelay: "90ms" }}
            >
              היהלום במרכז.
            </h1>
            <div
              className="cascade mt-5 flex justify-center lg:mt-10 lg:justify-start"
              style={{ animationDelay: "220ms" }}
            >
              <Link href="/jewelry/rings" className="btn-primary min-w-52 px-8">
                גלו טבעות יהלום
              </Link>
            </div>
          </div>

        </div>

      </section>

      {/* ── Bestsellers ───────────────────────────────────── */}
      <section className="bg-[#fcfbf8] pb-14 pt-8 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="הבחירות של LIBI" />
          <EditorialBestsellers items={bestsellers} />
        </div>
      </section>

      {/* ── Shop by diamond shape ────────────────────────── */}
      <section className="section-diamond-light pb-12 pt-11 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="חיתוכי יהלום" variant="centered" />
          <DiamondShapeSelector shapes={diamondShapes} />
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="section-gallery">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <SectionHeading title="הקולקציה" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-11 lg:grid-cols-12 lg:grid-rows-[17rem_17rem] xl:grid-rows-[20rem_20rem]">
            {collectionOrder.map((category) => (
              <CollectionTile key={category} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-bespoke" aria-labelledby="bespoke-inspiration-title">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
          <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[16/10] lg:aspect-[6/5]">
            <Image
              src={assetPath("/images/editorial/v2/bespoke-inspiration.webp")}
              alt="טבעת יהלום מזהב צהוב לצד סקיצה בעיפרון"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover object-[center_62%] lg:object-center"
            />
          </div>

          <div className="flex flex-col justify-center px-5 py-9 text-center sm:px-10 sm:py-12 lg:px-14 lg:py-14 lg:text-right xl:px-20">
            <h2
              id="bespoke-inspiration-title"
              className="font-display text-[2rem] font-medium leading-tight text-ivory sm:text-4xl lg:text-[2.7rem]"
            >
              יש לכם השראה לתכשיט?
            </h2>
            <a
              href={waLink("היי, יש לי השראה לתכשיט ואשמח לבדוק אפשרות לעיצוב אישי")}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto mt-6 inline-flex min-h-12 items-center justify-center gap-2 border border-champagne px-6 text-sm font-semibold text-ivory transition-colors hover:bg-ivory hover:text-ink lg:mx-0 lg:self-start"
            >
              <WhatsAppIcon className="h-4 w-4" />
              שליחת ההשראה בוואטסאפ
            </a>
          </div>
        </div>
      </section>

      {/* ── LIBI Journal ───────────────────────────────── */}
      <section className="section-gallery py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-[2rem] font-medium leading-none sm:text-4xl">לדעת מה בוחרים.</h2>
            <Link
              href="/journal"
              className="shrink-0 border-b border-gold/55 pb-1 text-xs font-semibold tracking-[0.05em] text-ink-soft hover:border-gold hover:text-ink sm:text-sm"
            >
              לכל המדריכים
            </Link>
          </div>

          <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:gap-10">
            <Link href={`/journal/${featuredJournalGuide.slug}`} className="group block">
              <article>
                <div className="relative aspect-[3/2] overflow-hidden bg-warm-stone">
                  <Image
                    src={assetPath(featuredJournalGuide.cover.src)}
                    alt={featuredJournalGuide.cover.alt}
                    fill
                    sizes="(min-width: 1024px) 67vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
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
                    <div className="relative aspect-[4/3] overflow-hidden bg-warm-stone lg:aspect-[3/2]">
                      <Image
                        src={assetPath(guide.cover.src)}
                        alt={guide.cover.alt}
                        fill
                        sizes="(min-width: 1024px) 26vw, 144px"
                        className="scale-[1.035] object-cover contrast-[1.025] transition-transform duration-700 ease-out group-hover:scale-[1.055] lg:scale-100 lg:group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="min-w-0 lg:mt-3">
                      <p className="text-[0.65rem] font-semibold tracking-[0.07em] text-stone">{guide.readingMinutes} דקות קריאה</p>
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

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="section-faq py-10 lg:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-medium sm:text-[2rem]">
            פרטים שכדאי לדעת
          </h2>
          <div className="mt-5 sm:mt-7">
            {faqs.slice(0, 3).map((f) => (
              <details key={f.q} className="faq-item border-b border-line">
                <summary className="flex items-center justify-between gap-4 py-3.5 sm:py-4">
                  <span className="text-sm font-semibold leading-6 text-ink-soft">{f.q}</span>
                  <span className="faq-icon shrink-0 text-base text-gold" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-7 text-stone">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/service" className="border-b border-gold/55 pb-1 text-xs font-semibold text-ink-soft transition-colors hover:border-gold hover:text-ink sm:text-sm">
              לכל פרטי השירות
            </Link>
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
