import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { WhatsAppIcon } from "@/components/icons";
import {
  categories,
  products,
  type CategorySlug,
  type Product,
} from "@/data/products";
import { site, waLink, defaultWaMessage } from "@/lib/site";

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
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="font-display text-3xl font-medium sm:text-4xl">{title}</h2>
    </div>
  );
}

/* Mobile: edge-to-edge snap-scroll rail with large cards; desktop: grid */
function ProductRail({
  items,
  desktopCols,
}: {
  items: Product[];
  desktopCols: 3 | 4;
}) {
  return (
        <div
          className={`no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-12 lg:grid lg:gap-x-6 lg:gap-y-10 lg:overflow-visible lg:px-0 lg:pb-0 ${
        desktopCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
      }`}
    >
      {items.map((p) => (
        <div
          key={p.slug}
          className="w-[76vw] max-w-[330px] shrink-0 snap-center sm:w-[38vw] lg:w-auto lg:max-w-none"
        >
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

const categoryImages: Record<CategorySlug, string> = {
  rings: "/images/products/aura-solitaire-ring.webp",
  earrings: "/images/products/stella-diamond-studs.webp",
  necklaces: "/images/products/riviera-tennis-necklace.webp",
  bracelets: "/images/products/icon-tennis-bracelet.webp",
};

const diamondShapes = [
  {
    name: "עגול",
    note: "קלאסי ומלא אור",
    type: "round",
    image: "/images/diamond-shapes/round.webp",
  },
  {
    name: "אובל",
    note: "רך ומוארך",
    type: "oval",
    image: "/images/diamond-shapes/oval.webp",
  },
  {
    name: "אמרלד",
    note: "קווים נקיים",
    type: "emerald",
    image: "/images/diamond-shapes/emerald.webp",
  },
  {
    name: "קושן",
    note: "רך ורומנטי",
    type: "cushion",
    image: "/images/diamond-shapes/cushion.webp",
  },
  {
    name: "טיפה",
    note: "עדין ובעל תנועה",
    type: "pear",
    image: "/images/diamond-shapes/pear.webp",
  },
  {
    name: "פרינסס",
    note: "חד ומדויק",
    type: "princess",
    image: "/images/diamond-shapes/princess.webp",
  },
] as const;

export default function HomePage() {
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 8);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-editorial relative isolate overflow-hidden border-b border-line">
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="/images/hero/home-hero-ring-mobile-portrait.webp"
            alt="טבעת יהלום מעבדה בזהב צהוב על שיש בהיר"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hero-settle object-cover object-[center_58%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,248,243,0.9)_0%,rgba(250,248,243,0.7)_34%,rgba(250,248,243,0.08)_62%,rgba(250,248,243,0.78)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(80svh-70px)] max-w-7xl items-start px-4 py-6 sm:px-6 lg:min-h-[min(82vh,760px)] lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-10 lg:px-8 lg:py-14">
          <div className="pt-5 text-center sm:pt-10 lg:order-first lg:max-w-lg lg:pt-0 lg:text-right">
            <h1
              className="cascade mx-auto max-w-[8ch] font-display text-5xl font-light leading-[1.04] text-ink sm:text-6xl lg:mx-0 xl:text-7xl"
              style={{ animationDelay: "90ms" }}
            >
              נוכחות אמיתית.
            </h1>
            <p
              className="cascade mx-auto mt-5 hidden max-w-[26rem] text-sm leading-7 tracking-[0.08em] text-stone sm:text-base lg:mx-0 lg:block"
              style={{ animationDelay: "150ms" }}
            >
              יהלומי מעבדה מוסמכים בזהב 14K/18K.
            </p>
            <div
              className="cascade mt-7 flex flex-col items-center gap-3 lg:mt-10 lg:flex-row lg:justify-start"
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
            <p
              className="cascade mx-auto mt-5 hidden text-xs tracking-[0.12em] text-stone lg:mx-0 lg:block"
              style={{ animationDelay: "280ms" }}
            >
              IGI/GIA · אחריות מלאה · משלוח מבוטח
            </p>
          </div>

          <div className="animate-fade-up relative hidden lg:order-last lg:block lg:min-h-[520px]">
            <div className="hero-ring-light" />
            <div className="absolute left-[48%] top-1/2 z-10 w-[132%] max-w-none -translate-x-1/2 -translate-y-1/2 sm:w-[104%] lg:w-[114%]">
              <Image
                src="/images/hero/home-hero-ring-flat-cutout.webp"
                alt="טבעת יהלום מעבדה מרכזית בזהב צהוב"
                width={1143}
                height={643}
                priority
                unoptimized
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="hero-settle h-auto w-full"
              />
            </div>
          </div>
        </div>

      </section>

      {/* ── Bestsellers ───────────────────────────────────── */}
      <section className="bg-cream/60 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="הנמכרים ביותר" />
          <ProductRail items={bestsellers} desktopCols={4} />
        </div>
      </section>

      {/* ── Shop by diamond shape ────────────────────────── */}
      <section className="section-champagne border-y border-line py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="צורות יהלום" />
          <div className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-11 lg:grid lg:grid-cols-6 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
            {diamondShapes.map((shape) => (
              <a
                key={shape.type}
                href={waLink(`היי, אשמח לבדוק יהלום בצורת ${shape.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-[42vw] max-w-[178px] shrink-0 snap-center flex-col items-center justify-center border-y border-gold/25 px-3 py-5 text-center transition-colors hover:border-gold sm:w-[27vw] lg:w-auto lg:max-w-none lg:px-2 lg:py-7"
              >
                <div className="relative h-[90px] w-[90px] sm:h-[112px] sm:w-[112px]">
                  <Image
                    src={shape.image}
                    alt={`יהלום בחיתוך ${shape.name}`}
                    fill
                    sizes="(min-width: 1024px) 112px, 90px"
                    className="mix-blend-multiply object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div>
                  <h3 className="mt-3 font-display text-xl text-ink">{shape.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-ink-soft/75">{shape.note}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading title="הקולקציה" />
        <div className="mt-10 grid grid-cols-2 gap-3 lg:mt-12 lg:grid-cols-4 lg:gap-6">
          {categories.map((cat) => {
            return (
            <Link
              key={cat.slug}
              href={`/jewelry/${cat.slug}`}
              className="group block"
            >
              <div className="art-bg-dark relative aspect-[4/5] overflow-hidden">
                <Image
                  src={categoryImages[cat.slug]}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex items-center justify-center pt-4">
                <h3 className="font-display text-xl">{cat.name}</h3>
              </div>
            </Link>
          );
          })}
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────── */}
      <section className="section-proof border-y border-line">
        <div className="mx-auto max-w-7xl px-6 py-5 text-center sm:px-8 lg:py-6">
          <p className="text-xs font-semibold leading-6 tracking-[0.12em] text-ink-soft sm:text-sm">
            יהלומי מעבדה מוסמכים · זהב 14K/18K · משלוח מבוטח · אחריות והתאמת מידה
          </p>
        </div>
      </section>

      {/* ── Consultation CTA ─────────────────────────────── */}
      <section className="section-champagne border-y border-line px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
        <h2 className="font-display text-3xl font-medium sm:text-4xl">
          מתלבטים בין דגמים?
        </h2>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={waLink("היי, אשמח לייעוץ אישי בבחירת תכשיט")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto"
          >
            <WhatsAppIcon className="h-4 w-4" />
            ייעוץ אישי בוואטסאפ
          </a>
          <Link href="/jewelry/rings" className="btn-outline w-full border-ink-soft/65 sm:w-auto">
            חזרה לקולקציה
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="border-t border-line bg-cream/45 py-10 lg:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-medium sm:text-3xl">
            לפני הזמנה
          </h2>
          <div className="mt-7">
            {faqs.map((f) => (
              <details key={f.q} className="faq-item border-b border-line">
                <summary className="flex items-center justify-between gap-4 py-4">
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JewelryStore",
            name: site.name,
            url: site.domain,
            email: site.email,
            description: site.tagline,
          }),
        }}
      />
    </>
  );
}
