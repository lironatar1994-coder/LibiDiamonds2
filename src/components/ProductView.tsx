"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  metalNames,
  productImages,
  type CaratScope,
  type Metal,
  type Product,
} from "@/data/products";
import { assetPath, formatPrice, waLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";
import ProductMedia from "@/components/ProductMedia";

const TryOnDialog = dynamic(() => import("@/components/try-on/TryOnDialog"), { ssr: false });

function TryOnGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" className={className} aria-hidden="true">
      <path d="M4 8.5h3l1.4-2h7.2l1.4 2h3v10H4z" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.2" />
      <path d="M19 4v3M17.5 5.5h3" strokeLinecap="round" />
    </svg>
  );
}

function ZoomGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4.5 4.5M10.5 8v5M8 10.5h5" strokeLinecap="round" />
    </svg>
  );
}

const METAL_SWATCH: Record<Metal, string> = {
  yellow: "#c9a35e",
  white: "#c4c8cd",
  rose: "#d6a289",
};

const CARAT_SCOPE_COPY: Record<CaratScope, { legend: string; qualifier: string }> = {
  center: { legend: "משקל האבן המרכזית", qualifier: "קראט" },
  single: { legend: "משקל היהלום", qualifier: "קראט" },
  pair: { legend: "משקל כולל לזוג", qualifier: "קראט סה״כ" },
  total: { legend: "משקל יהלומים כולל", qualifier: "קראט סה״כ" },
};

const libiStandardItems = [
  {
    title: "בחירה לפי המראה בפועל",
    detail: "נתוני האבן נבחנים לצד הפרופורציות, השיבוץ וגוון הזהב.",
  },
  {
    title: "התאמה לפני תחילת העבודה",
    detail: "האבן, הזהב והמידה נסגרים יחד לפני הייצור.",
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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [summaryPassed, setSummaryPassed] = useState(false);
  const [primaryCtaVisible, setPrimaryCtaVisible] = useState(false);
  const [relatedReached, setRelatedReached] = useState(false);
  const summaryRef = useRef<HTMLElement>(null);
  const primaryCtaRef = useRef<HTMLDivElement>(null);
  const viewerCloseRef = useRef<HTMLButtonElement>(null);

  const carat = product.carats[caratIdx];
  const images = productImages(product, metal);
  const packaging = packagingByCategory[product.category];
  const caratCopy = CARAT_SCOPE_COPY[product.caratScope];
  const caratLabel = `${carat.value} ${caratCopy.qualifier}`;
  const message = `היי, אשמח לפרטים על ${product.name} — ${caratLabel}, ${metalNames[metal]} (${formatPrice(carat.price)})`;
  const metalGridClass = product.metals.length === 3 ? "grid-cols-3" : "grid-cols-2";
  const caratGridClass =
    product.carats.length === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : product.carats.length === 3
        ? "grid-cols-3"
        : "grid-cols-2";
  const detailImage = images.find((image) => image.view === "detail" || image.view === "profile") ?? images[1] ?? images[0];
  const showMobileSticky = summaryPassed && !primaryCtaVisible && !relatedReached && !viewerOpen && !tryOnOpen;

  useEffect(() => {
    setSelectedImage(0);
  }, [metal]);

  useEffect(() => {
    const summary = summaryRef.current;
    const cta = primaryCtaRef.current;
    if (!summary || !cta) return;

    const summaryObserver = new IntersectionObserver(([entry]) => {
      setSummaryPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    }, { threshold: 0 });
    summaryObserver.observe(summary);

    const ctaObserver = new IntersectionObserver(([entry]) => {
      setPrimaryCtaVisible(entry.isIntersecting);
    }, { threshold: 0.05 });
    ctaObserver.observe(cta);

    const related = document.getElementById("related-products");
    const relatedObserver = related
      ? new IntersectionObserver(([entry]) => setRelatedReached(entry.isIntersecting), {
          rootMargin: "0px 0px -45% 0px",
        })
      : null;
    if (related && relatedObserver) relatedObserver.observe(related);

    return () => {
      summaryObserver.disconnect();
      ctaObserver.disconnect();
      relatedObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!viewerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    viewerCloseRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [viewerOpen]);

  const openViewer = (index: number) => {
    setSelectedImage(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(23rem,0.82fr)] lg:items-start lg:gap-14 xl:gap-20">
        <section className="-mx-4 sm:mx-0" aria-label={`גלריית תמונות של ${product.name}`}>
          <button
            type="button"
            onClick={() => openViewer(selectedImage)}
            className="group relative block w-full text-right"
            aria-label={`פתיחת ${images[selectedImage].alt} במסך מלא`}
          >
            <ProductMedia
              key={images[selectedImage].src}
              image={images[selectedImage]}
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="aspect-square"
              imageClassName="animate-fade-up object-cover transition-transform duration-700 group-hover:scale-[1.012]"
            />
            <span className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center border border-black/10 bg-white/88 text-ink backdrop-blur-sm transition-colors group-hover:bg-white" aria-hidden>
              <ZoomGlyph className="h-5 w-5" />
            </span>
          </button>

          {images.length > 1 && (
            <div className={`mt-2 flex justify-center gap-2 px-4 sm:mt-3 sm:justify-start sm:px-0 ${images.length > 2 ? "lg:hidden" : ""}`}>
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`הצגת תמונה ${index + 1} של ${product.name}`}
                  aria-pressed={selectedImage === index}
                  className={`relative aspect-square w-16 overflow-hidden border transition-[border-color,opacity] sm:w-24 ${
                    selectedImage === index
                      ? "border-ink opacity-100"
                      : "border-transparent opacity-58 hover:opacity-100"
                  }`}
                >
                  <ProductMedia image={image} decorative sizes="96px" className="h-full w-full" imageClassName="object-cover" />
                </button>
              ))}
            </div>
          )}

          {images.length > 2 && (
            <div className="mt-4 hidden grid-cols-3 gap-4 lg:grid">
              {images.slice(1).map((image, imageOffset) => {
                const index = imageOffset + 1;
                return (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => openViewer(index)}
                    className="group relative block aspect-square overflow-hidden"
                    aria-label={`פתיחת ${image.alt} במסך מלא`}
                  >
                    <ProductMedia
                      image={image}
                      decorative
                      sizes="(min-width: 1024px) 19vw, 50vw"
                      className="h-full w-full"
                      imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.018]"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <header ref={summaryRef}>
            <h1 className="font-display text-[2.05rem] font-medium leading-[1.12] sm:text-5xl lg:text-[3.15rem]">
              {product.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone sm:text-base">{product.subtitle}</p>
            <div className="mt-4 flex items-baseline gap-3 lg:mt-7" aria-live="polite">
              <span className="text-xs font-semibold text-stone">מחיר</span>
              <span className="font-display text-[2.15rem] font-medium leading-none text-ink sm:text-4xl">
                {formatPrice(carat.price)}
              </span>
            </div>
          </header>

          <div className="mt-5 grid grid-cols-3 border-y border-line py-3 text-center text-[0.68rem] font-semibold text-ink-soft sm:text-xs lg:mt-7 lg:py-3.5">
            <span>תעודה גמולוגית</span>
            <span className="border-x border-line">משלוח מבוטח</span>
            <span>התאמת מידה</span>
          </div>

          <fieldset className="pt-5 lg:pt-7">
            <legend className="text-sm font-semibold">גוון הזהב</legend>
            <div className={`mt-2.5 grid gap-2.5 ${metalGridClass}`}>
              {product.metals.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMetal(option)}
                  aria-label={metalNames[option]}
                  aria-pressed={metal === option}
                  className={`flex min-h-12 items-center justify-center gap-2 border px-2 py-2 text-sm transition-colors ${
                    metal === option
                      ? "border-ink bg-selection text-ink"
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
          </fieldset>

          <fieldset className="pt-5 lg:pt-7">
            <legend className="text-sm font-semibold">{caratCopy.legend}</legend>
            <div className={`mt-2.5 grid gap-2.5 ${caratGridClass}`} dir="rtl">
              {product.carats.map((option, index) => (
                <button
                  key={`${option.value}-${option.price}`}
                  type="button"
                  onClick={() => setCaratIdx(index)}
                  aria-pressed={index === caratIdx}
                  aria-label={`${option.value} ${caratCopy.qualifier}, ${formatPrice(option.price)}`}
                  className={`flex min-h-[88px] min-w-0 flex-col items-center justify-center border px-1.5 py-2.5 text-center transition-colors sm:min-h-[92px] sm:px-3 sm:py-3 ${
                    index === caratIdx
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-white text-ink hover:border-gold-deep"
                  }`}
                >
                  <span className="block font-display text-xl leading-none" dir="ltr">{option.value}</span>
                  <span className={`mt-1.5 block whitespace-nowrap text-[0.72rem] leading-none ${index === caratIdx ? "text-footer-muted" : "text-stone"}`}>
                    {caratCopy.qualifier}
                  </span>
                  <span className={`mt-2.5 block whitespace-nowrap text-xs font-semibold tracking-wide ${index === caratIdx ? "text-ivory" : "text-ink"}`}>
                    {formatPrice(option.price)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div ref={primaryCtaRef} className="mt-6 lg:mt-8">
            <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-[54px] w-full">
              <WhatsAppIcon className="h-4 w-4" />
              בדיקת זמינות ומחיר בוואטסאפ
            </a>
            <p className="mt-2.5 text-center text-xs leading-5 text-stone">ליווי אישי בבחירת האבן, הזהב והמידה.</p>
          </div>

          {product.tryOn?.enabled && product.category === "rings" && (
            <div className="pt-3.5">
              <button
                type="button"
                onClick={() => setTryOnOpen(true)}
                className="flex min-h-[50px] w-full items-center justify-center gap-2.5 border border-ink bg-transparent px-5 text-sm font-semibold tracking-[0.035em] text-ink transition-colors hover:bg-ink hover:text-ivory"
              >
                <TryOnGlyph className="h-5 w-5" />
                לראות את הטבעת על היד
              </button>
            </div>
          )}

          <p className="mt-3 text-center text-xs text-stone sm:mt-4">
            {metalNames[metal]} · {caratLabel} · {product.specs.cert}
          </p>
        </section>
      </div>

      <section className="mt-10 border-y border-line py-6 sm:mt-12 sm:py-7 lg:mt-16" aria-label="מפרט היהלום">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 text-right sm:grid-cols-4 sm:gap-x-5">
          {[
            ["צבע", product.specs.color],
            ["ניקיון", product.specs.clarity],
            ["ליטוש", product.specs.cut],
            ["תעודה", product.specs.cert],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[0.68rem] font-semibold tracking-[0.09em] text-stone">{label}</dt>
              <dd className="mt-1 text-base font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-11 grid gap-7 sm:mt-14 lg:mt-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:items-center lg:gap-16" aria-labelledby="product-details-title">
        <ProductMedia
          image={detailImage}
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="aspect-[4/3]"
          imageClassName="object-cover"
        />
        <div>
          <h2 id="product-details-title" className="font-display text-[2rem] font-medium leading-tight sm:text-4xl">
            הפרטים שעושים את ההבדל
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-stone sm:text-base">{product.description}</p>

          {product.highlights && product.highlights.length > 0 && (
            <dl className="mt-6 border-t border-line">
              {product.highlights.map((highlight) => (
                <div key={highlight.title} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5">
                  <dt className="font-display text-lg font-medium">{highlight.title}</dt>
                  <dd className="text-sm leading-6 text-stone">{highlight.detail}</dd>
                </div>
              ))}
            </dl>
          )}

          {product.dimensions && product.dimensions.length > 0 && (
            <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              {product.dimensions.map((dimension) => (
                <div key={dimension.label}>
                  <dt className="text-[0.68rem] font-semibold tracking-[0.08em] text-stone">{dimension.label}</dt>
                  <dd className="mt-1 text-sm font-semibold">{dimension.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="-mx-4 mt-12 bg-platinum-soft px-4 py-10 sm:-mx-6 sm:mt-16 sm:px-6 sm:py-12 lg:-mx-8 lg:mt-20 lg:px-8 lg:py-16" aria-labelledby="order-includes-title">
        <h2 id="order-includes-title" className="font-display text-[2rem] font-medium sm:text-4xl">
          כך התכשיט מגיע
        </h2>
        <div className="mt-6 grid gap-7 sm:grid-cols-2 lg:mt-8 lg:gap-8">
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
              <Image
                src={assetPath(packaging.src)}
                alt={packaging.alt}
                fill
                sizes="(min-width: 1024px) 44vw, (min-width: 640px) 48vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3">
              <span className="block text-sm font-semibold text-ink-soft">אריזת LIBI</span>
              <span className="mt-1 block text-xs leading-5 text-stone">הדמיה; פרטי האריזה עשויים להשתנות מעט.</span>
            </figcaption>
          </figure>

          <figure>
            <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
              <Image
                src={assetPath("/images/trust/v1/certificate-sample-mockup.webp")}
                alt="דוגמה כללית למבנה של תעודה גמולוגית"
                fill
                sizes="(min-width: 1024px) 44vw, (min-width: 640px) 48vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3">
              <span className="block text-sm font-semibold text-ink-soft">תעודה גמולוגית</span>
              <span className="mt-1 block text-xs leading-5 text-stone">התעודה בפועל מותאמת ליהלום שנבחר.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mt-12 sm:mt-16 lg:mt-20 lg:grid lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16" aria-labelledby="libi-standard-title">
        <div>
          <h2 id="libi-standard-title" className="max-w-xs font-display text-3xl font-medium leading-tight sm:text-4xl">
            הסטנדרט של LIBI
          </h2>
          <Link href="/about" className="mt-4 inline-block border-b border-gold/55 pb-1 text-xs font-semibold text-ink-soft transition-colors hover:border-gold hover:text-ink">
            לתהליך הבחירה המלא
          </Link>
        </div>

        <ol className="mt-6 border-t border-line lg:mt-0">
          {libiStandardItems.map((item, index) => (
            <li key={item.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-line py-4 sm:grid-cols-[2.5rem_minmax(10rem,0.72fr)_minmax(0,1.28fr)] sm:gap-x-5 sm:py-5">
              <span className="pt-0.5 font-display text-sm text-gold-deep" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-medium leading-snug sm:text-[1.35rem]">{item.title}</h3>
              <p className="col-start-2 mt-1 text-sm leading-6 text-ink-soft/80 sm:col-start-3 sm:mt-0">{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 border-b border-line sm:mt-14 lg:mt-16" aria-label="שירות ומשלוחים">
        {serviceItems.map((item) => (
          <details key={item.title} className="faq-item border-t border-line">
            <summary className="flex items-center justify-between gap-4 py-4.5">
              <span className="text-sm font-semibold">{item.title}</span>
              <span className="faq-icon text-lg text-gold" aria-hidden>+</span>
            </summary>
            <p className="max-w-2xl pb-5 text-sm leading-7 text-stone">{item.detail}</p>
          </details>
        ))}
      </section>

      {showMobileSticky && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink px-4 pt-3 text-ivory shadow-[0_-12px_30px_rgba(18,19,19,0.16)] lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-[5.25rem] shrink-0">
              <span className="block text-[0.62rem] text-footer-subtle">מחיר</span>
              <span className="font-display text-lg font-medium">{formatPrice(carat.price)}</span>
            </div>
            <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-ivory px-3 text-sm font-semibold text-ink">
              <WhatsAppIcon className="h-4 w-4" />
              בדיקת זמינות בוואטסאפ
            </a>
          </div>
        </div>
      )}

      {viewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`תצוגה מוגדלת של ${product.name}`}
          className="fixed inset-0 z-[80] flex flex-col bg-[#0d0e0e] text-white"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewerOpen(false);
          }}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/12 px-4 sm:px-6">
            <p className="truncate text-sm text-white/75">{product.name}</p>
            <button
              ref={viewerCloseRef}
              type="button"
              onClick={() => setViewerOpen(false)}
              className="flex h-11 w-11 items-center justify-center border border-white/25 text-2xl leading-none transition-colors hover:bg-white hover:text-ink"
              aria-label="סגירת התמונה"
              title="סגירה"
            >
              ×
            </button>
          </div>
          <div className="relative min-h-0 flex-1 touch-pinch-zoom">
            <Image
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex shrink-0 justify-center gap-2 overflow-x-auto border-t border-white/12 px-4 py-3">
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`הצגת תמונה ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden border ${selectedImage === index ? "border-white" : "border-white/20 opacity-55"}`}
                >
                  <Image src={image.src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {product.tryOn?.enabled && (
        <TryOnDialog
          open={tryOnOpen}
          onClose={() => setTryOnOpen(false)}
          productName={product.name}
          metal={metal}
          config={product.tryOn}
        />
      )}
    </>
  );
}
