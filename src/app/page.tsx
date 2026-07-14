import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import ProductMedia from "@/components/ProductMedia";
import CustomerVoices from "@/components/CustomerVoices";
import DiamondShapeSelector from "@/components/DiamondShapeSelector";
import { WhatsAppIcon } from "@/components/icons";
import {
  categories,
  products,
  productImages,
  type CategorySlug,
  type Product,
} from "@/data/products";
import { guides } from "@/data/guides";
import { reviews } from "@/data/reviews";
import { site, waLink, defaultWaMessage, assetPath, formatPrice } from "@/lib/site";
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
    a: "פריטים מהקולקציה נשלחים תוך 7–14 ימי עסקים בשליחות מבוטחת עד הבית, ללא עלות. הזמנות בהתאמה אישית — בדרך כלל 3–4 שבועות. ממהרים? דברו איתנו ונמצא פתרון.",
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
    <div className={`flex items-center gap-5 sm:gap-7 ${className}`}>
      <h2 className="shrink-0 font-display text-[2rem] font-medium leading-none sm:text-4xl">{title}</h2>
      <span className="h-px flex-1 bg-line" aria-hidden />
    </div>
  );
}

function EditorialBestsellers({ items }: { items: Product[] }) {
  const [featured, ...secondary] = items;
  const featuredImages = productImages(featured);
  const featuredImage = featuredImages[1] ?? featuredImages[0];

  return (
    <div className="mt-7 sm:mt-9 lg:mt-10">
      <Link
        href={`/product/${featured.slug}`}
        className="group grid lg:grid-cols-[1.45fr_0.55fr] lg:items-center"
      >
        <ProductMedia
          image={featuredImage}
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="aspect-[4/3] lg:aspect-[16/7]"
          imageClassName="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.018]"
        />
        <div className="flex items-center justify-center px-1 pt-4 text-center sm:pt-5 lg:px-8 lg:py-8">
          <div>
            <h3 className="font-display text-[1.35rem] font-medium sm:text-3xl">{featured.name}</h3>
            <p className="mt-1.5 font-display text-base text-ink-soft sm:text-lg">
              החל מ־{formatPrice(featured.priceFrom)}
            </p>
          </div>
        </div>
      </Link>

      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:mt-10 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-0">
        {secondary.map((product, index) => (
          <div key={product.slug} className={index > 3 ? "hidden lg:block" : "block"}>
            <ProductCard product={product} variant="compact" />
          </div>
        ))}
      </div>
    </div>
  );
}

const categoryImages: Record<CategorySlug, string> = {
  rings: assetPath("/images/products/catalog/aura-solitaire-ring-primary.webp"),
  earrings: assetPath("/images/products/catalog/stella-diamond-studs-primary.webp"),
  necklaces: assetPath("/images/products/catalog/riviera-tennis-necklace-primary.webp"),
  bracelets: assetPath("/images/products/catalog/icon-tennis-bracelet-primary.webp"),
};

const diamondShapes = [
  {
    name: "עגול",
    note: "קלאסי ומלא אור",
    type: "round",
    image: assetPath("/images/diamond-shapes/round.webp"),
  },
  {
    name: "אובל",
    note: "רך ומוארך",
    type: "oval",
    image: assetPath("/images/diamond-shapes/oval.webp"),
  },
  {
    name: "אמרלד",
    note: "קווים נקיים",
    type: "emerald",
    image: assetPath("/images/diamond-shapes/emerald.webp"),
  },
  {
    name: "קושן",
    note: "רך ורומנטי",
    type: "cushion",
    image: assetPath("/images/diamond-shapes/cushion.webp"),
  },
  {
    name: "טיפה",
    note: "עדין ובעל תנועה",
    type: "pear",
    image: assetPath("/images/diamond-shapes/pear.webp"),
  },
  {
    name: "פרינסס",
    note: "חד ומדויק",
    type: "princess",
    image: assetPath("/images/diamond-shapes/princess.webp"),
  },
] as const;

export default function HomePage() {
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 6);
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
        <div className="absolute inset-0 lg:hidden">
          <Image
            src={assetPath("/images/hero/mineral/hero-mobile.webp")}
            alt="טבעת יהלום מעבדה בזהב צהוב על משטח טרוורטין פיסולי"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hero-settle object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,246,242,0.9)_0%,rgba(247,246,242,0.68)_32%,rgba(247,246,242,0.04)_61%,rgba(247,246,242,0.2)_100%)]" />
        </div>

        <div className="absolute inset-0 hidden lg:block">
          <Image
            src={assetPath("/images/hero/mineral/hero-desktop.webp")}
            alt="טבעת יהלום מעבדה בזהב צהוב על קצה אבן מינרלית"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hero-settle object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,246,242,0.95)_0%,rgba(247,246,242,0.84)_32%,rgba(247,246,242,0.18)_58%,rgba(247,246,242,0)_72%)]" />
        </div>

        <div dir="ltr" className="relative z-10 mx-auto grid min-h-[calc(74svh-60px)] max-w-7xl items-start px-4 py-4 sm:px-6 lg:min-h-[min(82vh,760px)] lg:grid-cols-2 lg:items-center lg:px-8 lg:py-14">
          <div dir="rtl" className="pt-3 text-center sm:pt-10 lg:col-start-1 lg:max-w-lg lg:pt-0 lg:text-right">
            <h1
              className="cascade mx-auto max-w-[8ch] font-display text-[2.75rem] font-light leading-[1.04] text-ink sm:text-6xl lg:mx-0 xl:text-7xl"
              style={{ animationDelay: "90ms" }}
            >
              היהלום במרכז.
            </h1>
            <p
              className="cascade mx-auto mt-5 hidden max-w-[26rem] text-sm leading-7 tracking-[0.08em] text-stone sm:text-base lg:mx-0 lg:block"
              style={{ animationDelay: "150ms" }}
            >
              יהלומי מעבדה מוסמכים. עיצוב מדויק בזהב 14K/18K.
            </p>
            <div
              className="cascade mt-5 flex flex-col items-center gap-3 sm:mt-7 lg:mt-10 lg:flex-row lg:justify-start"
              style={{ animationDelay: "220ms" }}
            >
              <Link href="/jewelry/rings" className="btn-primary px-14">
                גלו טבעות יהלום
              </Link>
              <a
                href={waLink(defaultWaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp hero-desktop-inline"
              >
                <WhatsAppIcon className="h-4 w-4" />
                ייעוץ אישי בוואטסאפ
              </a>
            </div>
          </div>

        </div>

      </section>

      {/* ── Bestsellers ───────────────────────────────────── */}
      <section className="section-gallery py-10 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="הבחירות של LIBI" />
          <EditorialBestsellers items={bestsellers} />
        </div>
      </section>

      {/* ── Shop by diamond shape ────────────────────────── */}
      <section className="section-diamond-light py-8 sm:py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="בחרו את החיתוך" variant="centered" />
          <DiamondShapeSelector shapes={diamondShapes} />
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="section-ivory">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
          <SectionHeading title="הקולקציה" />
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 lg:mt-9 lg:grid-cols-5 lg:gap-6">
            {categories.map((cat) => {
              return (
              <Link
                key={cat.slug}
                href={`/jewelry/${cat.slug}`}
                className={`group block ${cat.slug === "rings" ? "lg:col-span-2" : "lg:col-span-1"}`}
              >
                <ProductMedia
                  image={{ src: categoryImages[cat.slug], alt: cat.name }}
                  sizes={cat.slug === "rings" ? "(min-width: 1024px) 40vw, 50vw" : "(min-width: 1024px) 20vw, 50vw"}
                  className={cat.slug === "rings" ? "aspect-[4/5] lg:aspect-[8/5]" : "aspect-[4/5]"}
                  imageClassName={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] ${cat.slug === "rings" ? "lg:object-[center_57%]" : ""}`}
                />
                <div className="flex items-center justify-center pt-3 lg:pt-4">
                  <h3 className="font-display text-lg lg:text-xl">{cat.name}</h3>
                </div>
              </Link>
            );
            })}
          </div>
        </div>
      </section>

      <section className="section-bespoke" aria-labelledby="bespoke-inspiration-title">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[16/10] lg:aspect-[4/5]">
            <Image
              src={assetPath("/images/editorial/v2/bespoke-inspiration.webp")}
              alt="טבעת יהלום מזהב צהוב לצד סקיצה בעיפרון"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover object-[center_62%] lg:object-center"
            />
          </div>

          <div className="px-5 py-8 text-center sm:px-10 sm:py-11 lg:px-14 lg:py-16 lg:text-right xl:px-20">
            <h2
              id="bespoke-inspiration-title"
              className="font-display text-[1.9rem] font-medium leading-tight sm:text-4xl lg:text-[2.7rem]"
            >
              יש לכם השראה לתכשיט?
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-stone sm:mt-4 sm:text-base lg:mx-0">
              שלחו תמונה, סקיצה או רעיון. נבחר יחד אבן, זהב ופרופורציות.
            </p>
            <a
              href={waLink("היי, יש לי השראה לתכשיט ואשמח לבדוק אפשרות לעיצוב אישי")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6 px-6 sm:mt-7 sm:px-8"
            >
              <WhatsAppIcon className="h-4 w-4" />
              שליחת ההשראה בוואטסאפ
            </a>
          </div>
        </div>
      </section>

      <CustomerVoices reviews={reviews} />

      {/* ── Trust strip ──────────────────────────────────── */}
      <section className="section-proof border-y border-line" aria-label="פרטי שירות ואחריות">
        <div className="mx-auto grid max-w-3xl grid-cols-2 px-4 py-3 text-center sm:flex sm:items-center sm:justify-center sm:gap-x-4 sm:px-8 sm:py-5">
          {["יהלומים מוסמכים", "זהב 14K/18K", "משלוח מבוטח", "אחריות מלאה"].map((item, index) => (
            <span
              key={item}
              className={`flex min-h-9 items-center justify-center gap-4 px-2 text-[0.69rem] font-semibold text-ink-soft sm:min-h-0 sm:px-0 sm:text-sm ${
                index % 2 === 0 ? "border-l border-line sm:border-l-0" : ""
              } ${index < 2 ? "border-b border-line sm:border-b-0" : ""}`}
            >
              {index > 0 && <span className="hidden h-1 w-1 rotate-45 bg-gold/60 sm:block" aria-hidden />}
              <span>{item}</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── LIBI Journal ───────────────────────────────── */}
      <section className="section-gallery py-11 sm:py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 border-b border-line pb-5 sm:pb-6">
            <h2 className="font-display text-[2rem] font-medium leading-none sm:text-4xl">לדעת מה בוחרים.</h2>
            <Link
              href="/journal"
              className="shrink-0 border-b border-gold/55 pb-1 text-xs font-semibold tracking-[0.05em] text-ink-soft hover:border-gold hover:text-ink sm:text-sm"
            >
              לכל המדריכים
            </Link>
          </div>

          <div className="mt-7 grid gap-8 lg:mt-9 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:gap-10">
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
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
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
      <section className="section-faq py-8 lg:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-center font-display text-xl font-medium sm:text-3xl">
            פרטים שכדאי לדעת
          </h2>
          <div className="mt-5 sm:mt-7">
            {faqs.map((f, index) => (
              <details key={f.q} className={`faq-item border-b border-line ${index > 2 ? "hidden lg:block" : "block"}`}>
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
