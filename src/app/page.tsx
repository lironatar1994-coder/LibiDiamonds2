import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { WhatsAppIcon } from "@/components/icons";
import {
  categories,
  products,
  productImages,
  type CategorySlug,
  type Product,
} from "@/data/products";
import { site, waLink, defaultWaMessage, assetPath, formatPrice } from "@/lib/site";

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
        <span className="mx-auto mt-3 block h-px w-8 bg-gold/55" aria-hidden />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-5 sm:gap-7 ${className}`}>
      <h2 className="shrink-0 font-display text-[2rem] font-medium leading-none sm:text-4xl">{title}</h2>
      <span className="h-px flex-1 bg-gradient-to-l from-gold/55 to-transparent" aria-hidden />
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
        className="editorial-product-feature group grid overflow-hidden lg:grid-cols-[1.45fr_0.55fr]"
      >
        <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[16/7]">
          <Image
            src={featuredImage.src}
            alt={featuredImage.alt}
            fill
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.018]"
          />
        </div>
        <div className="flex items-center justify-center px-5 py-7 text-center lg:px-8 lg:py-10">
          <div>
            <h3 className="font-display text-2xl font-medium sm:text-3xl">{featured.name}</h3>
            <p className="mt-2 font-display text-lg text-ink-soft">
              החל מ־{formatPrice(featured.priceFrom)}
            </p>
            <span className="mt-5 inline-block border-b border-gold/60 pb-1 text-xs font-semibold tracking-[0.1em] text-ink-soft transition-colors group-hover:border-gold-deep group-hover:text-ink">
              לצפייה בפריט
            </span>
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
  rings: assetPath("/images/products/v2/aura-solitaire-ring-primary.webp"),
  earrings: assetPath("/images/products/v2/stella-diamond-studs-primary.webp"),
  necklaces: assetPath("/images/products/v2/riviera-tennis-necklace-primary.webp"),
  bracelets: assetPath("/images/products/v2/icon-tennis-bracelet-primary.webp"),
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
      <section className="hero-editorial relative isolate overflow-hidden">
        <div className="absolute inset-0 lg:hidden">
          <Image
            src={assetPath("/images/hero/v2/home-hero-mobile.webp")}
            alt="טבעת יהלום מעבדה בזהב צהוב על שיש בהיר"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hero-settle object-cover object-[center_62%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,248,243,0.9)_0%,rgba(250,248,243,0.7)_34%,rgba(250,248,243,0.08)_62%,rgba(250,248,243,0.78)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(74svh-60px)] max-w-7xl items-start px-4 py-4 sm:px-6 lg:min-h-[min(82vh,760px)] lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-10 lg:px-8 lg:py-14">
          <div className="pt-3 text-center sm:pt-10 lg:order-first lg:max-w-lg lg:pt-0 lg:text-right">
            <h1
              className="cascade mx-auto max-w-[8ch] font-display text-[2.75rem] font-light leading-[1.04] text-ink sm:text-6xl lg:mx-0 xl:text-7xl"
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
            <p
              className="cascade mx-auto mt-5 hidden text-xs tracking-[0.12em] text-stone lg:mx-0 lg:block"
              style={{ animationDelay: "280ms" }}
            >
              IGI/GIA · אחריות מלאה · משלוח מבוטח
            </p>
          </div>

          <div className="animate-fade-up relative hidden lg:order-last lg:block lg:min-h-[520px]">
            <div className="hero-ring-light" />
            <Image
              src={assetPath("/images/hero/v2/home-hero-desktop.webp")}
              alt="טבעת יהלום מעבדה מרכזית בזהב צהוב"
              fill
              priority
              unoptimized
              sizes="58vw"
              className="hero-settle z-10 object-cover object-[72%_center]"
            />
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
      <section className="section-diamond-light py-10 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="בחרו את החיתוך" variant="centered" />
          <div className="mt-6 grid grid-cols-3 gap-x-2 gap-y-5 sm:mt-8 sm:gap-x-6 sm:gap-y-8 lg:mt-9 lg:grid-cols-6 lg:gap-5">
            {diamondShapes.map((shape) => (
              <a
                key={shape.type}
                href={waLink(`היי, אשמח לבדוק יהלום בצורת ${shape.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center px-1 py-1 text-center"
              >
                <div className="shape-stone-field relative h-[82px] w-[82px] min-[390px]:h-[90px] min-[390px]:w-[90px] sm:h-[122px] sm:w-[122px] lg:h-[132px] lg:w-[132px]">
                  <Image
                    src={shape.image}
                    alt={`יהלום בחיתוך ${shape.name}`}
                    fill
                    sizes="(min-width: 1024px) 124px, (min-width: 640px) 118px, 92px"
                    className="mix-blend-multiply object-contain p-[9%] transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                  />
                </div>
                <div>
                  <h3 className="mt-2 font-display text-base text-ink sm:mt-3 sm:text-xl">{shape.name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="section-gallery">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-18">
          <SectionHeading title="הקולקציה" />
          <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-6 lg:mt-10 lg:grid-cols-5 lg:gap-6">
            {categories.map((cat) => {
              return (
              <Link
                key={cat.slug}
                href={`/jewelry/${cat.slug}`}
                className={`group block ${cat.slug === "rings" ? "lg:col-span-2" : "lg:col-span-1"}`}
              >
                <div className={`art-bg-dark relative overflow-hidden ${cat.slug === "rings" ? "aspect-[4/5] lg:aspect-[8/5]" : "aspect-[4/5]"}`}>
                  <Image
                    src={categoryImages[cat.slug]}
                    alt={cat.name}
                    fill
                    sizes={cat.slug === "rings" ? "(min-width: 1024px) 40vw, 50vw" : "(min-width: 1024px) 20vw, 50vw"}
                    className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] ${cat.slug === "rings" ? "lg:object-[center_57%]" : ""}`}
                  />
                </div>
                <div className="flex items-center justify-center pt-3 lg:pt-4">
                  <h3 className="font-display text-lg lg:text-xl">{cat.name}</h3>
                </div>
              </Link>
            );
            })}
          </div>
        </div>
      </section>

      <section className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/9] lg:aspect-[16/7]" aria-label="צילום אווירה של טבעת אורה">
        <Image
          src={assetPath("/images/editorial/bridal-still-life.webp")}
          alt="טבעת סוליטר אורה על אבן בהירה לצד נייר משובח ומשי שנהב"
          fill
          sizes="100vw"
          className="object-cover object-[center_60%]"
        />
      </section>

      {/* ── Trust strip ──────────────────────────────────── */}
      <section className="section-proof border-y border-line">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-4 text-center sm:px-8 lg:py-6">
          {["יהלומים מוסמכים", "זהב 14K/18K", "משלוח מבוטח", "אחריות מלאה"].map((item, index) => (
            <span key={item} className="flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.08em] text-ink-soft sm:text-sm">
              {index > 0 && <span className="hidden h-1 w-1 rotate-45 bg-gold/65 sm:block" aria-hidden />}
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Consultation CTA ─────────────────────────────── */}
      <section className="section-cta-signature px-4 py-9 text-ivory sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 text-center lg:flex-row lg:gap-8 lg:text-right">
          <div className="hidden h-px flex-1 bg-champagne/35 lg:block" />
          <h2 className="max-w-lg font-display text-2xl font-medium leading-tight sm:text-4xl">
            נבחר יחד את היהלום הנכון.
          </h2>
          <span className="hidden h-2 w-2 rotate-45 border border-champagne/65 lg:block" aria-hidden />
          <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <a
              href={waLink("היי, אשמח לייעוץ אישי בבחירת תכשיט")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-inverse w-full sm:w-auto"
            >
              <WhatsAppIcon className="h-4 w-4" />
              ייעוץ אישי בוואטסאפ
            </a>
            <Link href="/jewelry/rings" className="btn-outline-inverse hidden w-full sm:inline-flex sm:w-auto">
              טבעות יהלום
            </Link>
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
