"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { metalNames, productImages, type Product, type Metal } from "@/data/products";
import { assetPath, formatPrice, waLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";
import ProductMedia from "@/components/ProductMedia";

const METAL_SWATCH: Record<Metal, string> = {
  yellow: "#c9a35e",
  white: "#c4c8cd",
  rose: "#d6a289",
};

const confidenceItems = ["IGI/GIA", "משלוח מבוטח", "התאמת מידה ראשונה"];

const libiStandardItems = [
  {
    title: "בחירה לפי המראה, לא רק לפי המספרים",
    detail:
      "אנחנו מחברים בין נתוני האבן לבין התוצאה על היד: קראט, צבע, ניקיון וליטוש נבחנים לצד מבנה השיבוץ, גוון הזהב והתקציב.",
  },
  {
    title: "התאמה לפני תחילת העבודה",
    detail:
      "משקל האבן, גוון הזהב והמידה נסגרים יחד, כדי שהפרופורציות, גובה השיבוץ ונוחות הענידה יתאימו לבחירה הסופית.",
  },
  {
    title: "שקיפות מלאה בהזמנה",
    detail:
      "לפני האישור מקבלים סיכום ברור של האבן והתכשיט, המחיר הסופי, סוג התעודה ומועד האספקה המשוער — בלי פרטים שנשארים פתוחים.",
  },
  {
    title: "ליווי גם אחרי המסירה",
    detail:
      "התכשיט מגיע עם תעודה גמולוגית לאבן המרכזית, אחריות על השיבוץ והמתכת, משלוח מבוטח והתאמת מידה ראשונה.",
  },
];

const serviceItems = [
  {
    title: "משלוח ואספקה",
    detail:
      "משלוח מבוטח עד הבית בכל הארץ, באריזת מתנה מוקפדת. אספקה תוך 7–14 ימי עסקים; פריטים בהתאמה אישית — 3–4 שבועות.",
  },
  {
    title: "החזרות והחלפות",
    detail:
      "ניתן להחזיר או להחליף פריט מהקולקציה תוך 14 יום מקבלתו, במצבו המקורי. פריטים בהתאמה אישית — בתיאום מראש.",
  },
];

const packagingByCategory: Record<Product["category"], { src: string; alt: string }> = {
  rings: {
    src: "/images/trust/v1/libi-packaging-mockup.webp",
    alt: "הדמיה של אריזת טבעת LIBI DIAMONDS בגוון שנהב",
  },
  earrings: {
    src: "/images/trust/v2/libi-packaging-earrings-mockup.webp",
    alt: "הדמיה של אריזת עגילים LIBI DIAMONDS עם מגש זוגי בגוון שנהב",
  },
  necklaces: {
    src: "/images/trust/v2/libi-packaging-necklaces-mockup.webp",
    alt: "הדמיה של אריזת שרשרת LIBI DIAMONDS עם מגש רחב בגוון שנהב",
  },
  bracelets: {
    src: "/images/trust/v2/libi-packaging-bracelets-mockup.webp",
    alt: "הדמיה של אריזת צמיד LIBI DIAMONDS עם מגש מאורך בגוון שנהב",
  },
};

export default function ProductView({ product }: { product: Product }) {
  const [metal, setMetal] = useState<Metal>(product.defaultMetal ?? product.metals[0]);
  const [caratIdx, setCaratIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);

  const carat = product.carats[caratIdx];
  const images = productImages(product, metal);
  const packaging = packagingByCategory[product.category];
  const message = `היי, אשמח לפרטים על ${product.name} — ${carat.label}, ${metalNames[metal]} (${formatPrice(carat.price)})`;
  const metalGridClass = product.metals.length === 3 ? "grid-cols-3" : "grid-cols-2";
  const caratGridClass =
    product.carats.length === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : product.carats.length === 3
        ? "grid-cols-3"
        : "grid-cols-2";

  useEffect(() => {
    const update = () => setShowStickyCta(window.scrollY > 360);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    setSelectedImage(0);
  }, [metal]);

  return (
    <>
      <div className="grid gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(23rem,0.85fr)] lg:items-start lg:gap-16 xl:gap-20">
        <section className="lg:sticky lg:top-28">
          <ProductMedia
            key={images[selectedImage].src}
            image={images[selectedImage]}
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="aspect-square"
            imageClassName="animate-fade-up object-cover"
          />

          {images.length > 1 && (
            <div className="mt-3 flex gap-3 sm:mt-4">
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`הצגת תמונה ${index + 1} של ${product.name}`}
                  aria-pressed={selectedImage === index}
                  className={`relative aspect-square w-20 overflow-hidden bg-ivory transition-all sm:w-24 ${
                    selectedImage === index
                      ? "ring-1 ring-ink ring-offset-2 ring-offset-white"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <ProductMedia
                    image={image}
                    decorative
                    sizes="96px"
                    className="h-full w-full"
                    imageClassName="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0">
          <header className="border-b border-line pb-6 lg:pb-7">
            <h1 className="font-display text-[2.15rem] font-medium leading-[1.1] sm:text-5xl lg:text-[3.15rem]">
              {product.name}
            </h1>
            <p className="mt-3 text-sm tracking-[0.03em] text-stone sm:text-base">{product.subtitle}</p>
            <div className="mt-7 lg:mt-9">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-stone">החל מ־</p>
                <p className="mt-1 font-display text-3xl font-medium tracking-wide text-ink sm:text-4xl">
                  {formatPrice(carat.price)}
                </p>
              </div>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-4 text-[0.7rem] font-semibold tracking-[0.08em] text-ink-soft sm:gap-x-5 sm:text-xs">
            {confidenceItems.map((item, index) => (
              <span key={item} className="flex items-center gap-x-4 sm:gap-x-5">
                {index > 0 && <span className="h-1 w-1 rotate-45 bg-gold/70" aria-hidden />}
                {item}
              </span>
            ))}
          </div>

          <section className="pt-7 lg:pt-8">
            <p className="text-sm font-semibold">גוון הזהב</p>
            <div className={`mt-3 grid gap-2.5 ${metalGridClass}`}>
              {product.metals.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMetal(option)}
                  aria-label={metalNames[option]}
                  aria-pressed={metal === option}
                  className={`flex min-h-12 items-center justify-center gap-2 border px-2 py-2 text-[0.78rem] transition-colors min-[390px]:text-sm ${
                    metal === option
                      ? "border-gold-deep bg-selection text-ink"
                      : "border-line bg-white text-ink-soft hover:border-stone"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: METAL_SWATCH[option] }}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">{metalNames[option]}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="pt-7 lg:pt-8">
            <p className="text-sm font-semibold">משקל היהלום</p>
            <div className={`mt-3 grid gap-2.5 ${caratGridClass}`} dir="rtl">
              {product.carats.map((option, index) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setCaratIdx(index)}
                  aria-pressed={index === caratIdx}
                  className={`min-h-[92px] border px-2.5 py-3 text-right transition-colors sm:px-3 ${
                    index === caratIdx
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-white text-ink hover:border-gold-deep"
                  }`}
                >
                  <span className="block font-display text-base leading-tight sm:text-lg">{option.label}</span>
                  <span className={`mt-2 block text-[0.78rem] font-semibold tracking-wide sm:text-sm ${index === caratIdx ? "text-ivory" : "text-ink"}`}>
                    {formatPrice(option.price)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-8 border-t border-line pt-6 lg:mt-9">
            <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
              <WhatsAppIcon className="h-4 w-4" />
              בדיקת זמינות ומחיר בוואטסאפ
            </a>
            <p className="mt-3 text-center text-xs text-stone">ליווי אישי בבחירת האבן, הזהב והמידה.</p>
          </div>

          <section className="mt-9 border-y border-line py-6 lg:mt-10 lg:py-7">
            <dl className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4">
              {[
                ["צבע", product.specs.color],
                ["ניקיון", product.specs.clarity],
                ["ליטוש", product.specs.cut],
                ["תעודה", product.specs.cert],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[0.68rem] font-semibold tracking-[0.09em] text-stone">{label}</dt>
                  <dd className="mt-1.5 text-sm font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-7 max-w-xl text-sm leading-7 text-stone sm:text-[0.98rem]">{product.description}</p>
            <Link
              href="/journal/why-choose-a-lab-diamond"
              className="mt-5 inline-block border-b border-gold/55 pb-1 text-xs font-semibold tracking-[0.06em] text-ink-soft hover:border-gold hover:text-ink"
            >
              למה לבחור יהלום מעבדה?
            </Link>
          </section>

          <section className="border-b border-line py-8 lg:py-10" aria-labelledby="order-includes-title">
            <h2 id="order-includes-title" className="font-display text-2xl font-medium sm:text-3xl">
              מה מצורף להזמנה.
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
                  <Image
                    src={assetPath(packaging.src)}
                    alt={packaging.alt}
                    fill
                    sizes="(min-width: 1024px) 21vw, (min-width: 640px) 46vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3">
                  <span className="block text-xs font-semibold tracking-[0.08em] text-ink-soft">הדמיית אריזה</span>
                  <span className="mt-1 block text-xs leading-5 text-stone">האריזה הסופית עשויה להשתנות בפרטים הקטנים.</span>
                </figcaption>
              </figure>

              <figure>
                <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
                  <Image
                    src={assetPath("/images/trust/v1/certificate-sample-mockup.webp")}
                    alt="דוגמה כללית למבנה של תעודה גמולוגית"
                    fill
                    sizes="(min-width: 1024px) 21vw, (min-width: 640px) 46vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3">
                  <span className="block text-xs font-semibold tracking-[0.08em] text-ink-soft">דוגמה להמחשה בלבד</span>
                  <span className="mt-1 block text-xs leading-5 text-stone">התעודה בפועל מותאמת ליהלום שנבחר ומצורפת למסירה.</span>
                </figcaption>
              </figure>
            </div>
          </section>

          <div className="border-b border-line">
            {serviceItems.map((item) => (
              <details key={item.title} className="faq-item border-t border-line">
                <summary className="flex items-center justify-between gap-4 py-4">
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="faq-icon text-lg text-gold" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="max-w-xl pb-5 text-sm leading-7 text-stone">{item.detail}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <section
        className="mt-14 mb-24 border-y border-line py-10 sm:mt-16 sm:py-12 lg:mt-20 lg:mb-0 lg:grid lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16 lg:py-16"
        aria-labelledby="libi-standard-title"
      >
        <div>
          <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-gold-deep">LIBI DIAMONDS</p>
          <h2 id="libi-standard-title" className="mt-3 max-w-xs font-display text-3xl font-medium leading-tight sm:text-4xl">
            הסטנדרט של LIBI.
          </h2>
        </div>

        <ol className="mt-8 border-t border-line lg:mt-0">
          {libiStandardItems.map((item, index) => (
            <li
              key={item.title}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line py-5 sm:grid-cols-[2.5rem_minmax(10rem,0.72fr)_minmax(0,1.28fr)] sm:gap-5 sm:py-6"
            >
              <span className="pt-0.5 font-display text-sm text-gold-deep" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-medium leading-snug sm:text-[1.35rem]">{item.title}</h3>
              <p className="col-start-2 mt-1 text-sm leading-7 text-stone sm:col-start-3 sm:mt-0">{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 px-4 py-3 shadow-[0_-8px_24px_rgba(18,19,19,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-stone">{product.name}</p>
              <p className="font-semibold tracking-wide">{formatPrice(carat.price)}</p>
            </div>
            <a
              href={waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 bg-ink px-4 py-3 text-sm text-ivory"
            >
              <WhatsAppIcon className="h-4 w-4" />
              בדיקת זמינות
            </a>
          </div>
        </div>
      )}
    </>
  );
}
