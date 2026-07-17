"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  metalNames,
  productImages,
  productSpin,
  type CaratScope,
  type Metal,
  type Product,
} from "@/data/products";
import { assetPath, formatPrice, waLink } from "@/lib/site";
import { servicePromises } from "@/lib/service";
import { WhatsAppIcon } from "@/components/icons";
import ProductMedia from "@/components/ProductMedia";
import ProductHelpSheet, { type ProductHelpTopic } from "@/components/product/ProductHelpSheet";
import RingSizeSheet from "@/components/product/RingSizeSheet";

const TryOnDialog = dynamic(() => import("@/components/try-on/TryOnDialog"), { ssr: false });
const RingSpinViewer = dynamic(() => import("@/components/product/RingSpinViewer"), { ssr: false });

function TryOnGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" className={className} aria-hidden="true">
      <path d="M5.5 19.5v-7.8a1.75 1.75 0 0 1 3.5 0v2.1" strokeLinecap="round" />
      <path d="M9 13.8V7.4a1.75 1.75 0 0 1 3.5 0v6.1" strokeLinecap="round" />
      <path d="M12.5 13.5v-4a1.75 1.75 0 0 1 3.5 0v4.8" strokeLinecap="round" />
      <path d="M16 14.3v-2a1.75 1.75 0 0 1 3.5 0v3.2c0 3.1-2.1 5-5.2 5H10c-2.1 0-3.6-1.1-4.5-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m10.1 5.6 1.15-1.45h1.5L13.9 5.6 12 7.25z" strokeLinecap="round" strokeLinejoin="round" />
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

function InfoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 10.5v5M12 7.8h.01" strokeLinecap="round" />
    </svg>
  );
}

function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="m8 10 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
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

const STANDARD_RING_SIZES = Array.from({ length: 18 }, (_, index) => index + 7);

const serviceItems = [
  {
    id: "shipping",
    title: "משלוח ואספקה",
    detail:
      `${servicePromises.insuredDelivery} בכל הארץ, באריזת מתנה מוקפדת. אספקה תוך ${servicePromises.collectionLeadTime}; פריטים בהתאמה אישית — ${servicePromises.bespokeLeadTime}.`,
  },
  {
    id: "returns",
    title: "החזרות והחלפות",
    detail:
      "ניתן להחזיר או להחליף פריט מהקולקציה תוך 14 יום מקבלתו, במצבו המקורי. פריטים בהתאמה אישית — בתיאום מראש.",
  },
  {
    id: "warranty",
    title: "אחריות ושירות",
    detail:
      "אחריות מלאה על עבודת הצורפות והשיבוץ, והתאמת מידה ראשונה כלולה. אנחנו זמינים בוואטסאפ לכל שאלה — גם אחרי המסירה.",
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
  const [ringSize, setRingSize] = useState<number | "unsure">("unsure");
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [spinOpen, setSpinOpen] = useState(false);
  const [sizeSheetOpen, setSizeSheetOpen] = useState(false);
  const [activeHelp, setActiveHelp] = useState<ProductHelpTopic | null>(null);
  const [summaryPassed, setSummaryPassed] = useState(false);
  const [primaryCtaVisible, setPrimaryCtaVisible] = useState(false);
  const [relatedReached, setRelatedReached] = useState(false);
  const summaryRef = useRef<HTMLElement>(null);
  const primaryCtaRef = useRef<HTMLDivElement>(null);
  const viewerCloseRef = useRef<HTMLButtonElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const viewerTrackRef = useRef<HTMLDivElement>(null);
  const selectedImageRef = useRef(0);

  const carat = product.carats[caratIdx];
  const images = productImages(product, metal);
  const spinAsset = productSpin(product, metal);
  const packaging = packagingByCategory[product.category];
  const caratCopy = CARAT_SCOPE_COPY[product.caratScope];
  const caratLabel = `${carat.value} ${caratCopy.qualifier}`;
  const ringSizes = product.ringSizes ?? STANDARD_RING_SIZES;
  const ringSizeLabel = ringSize === "unsure" ? "מידה לא נבחרה" : `מידה ${ringSize} · היקף ${ringSize + 40} מ״מ`;
  const selectedSummary = `${metalNames[metal]} · ${caratLabel}${product.category === "rings" ? ` · ${ringSizeLabel}` : ""}`;
  const message = `היי, אשמח לקבל ייעוץ ולבדוק זמינות עבור ${product.name} — ${caratLabel}, ${metalNames[metal]}${product.category === "rings" ? `, ${ringSize === "unsure" ? "עדיין לא בטוח/ה במידה" : `מידה ישראלית ${ringSize} (היקף ${ringSize + 40} מ״מ)`}` : ""}. מחיר: ${formatPrice(carat.price)}`;
  const detailImage = images.find((image) => image.view === "detail" || image.view === "profile") ?? images[1] ?? images[0];
  const showMobileSticky =
    summaryPassed && !primaryCtaVisible && !relatedReached && !viewerOpen && !tryOnOpen && !spinOpen && !sizeSheetOpen && !activeHelp;

  useEffect(() => {
    selectedImageRef.current = selectedImage;
  }, [selectedImage]);

  useEffect(() => {
    setSelectedImage(0);
    galleryTrackRef.current?.scrollTo({ left: 0 });
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
    scrollTrackToSlide(viewerTrackRef, selectedImageRef.current, "auto");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      scrollTrackToSlide(galleryTrackRef, selectedImageRef.current, "auto");
    };
  }, [viewerOpen]);

  const openViewer = (index: number) => {
    setActiveHelp(null);
    setSpinOpen(false);
    setTryOnOpen(false);
    setSelectedImage(index);
    setViewerOpen(true);
  };

  const openHelp = (topic: ProductHelpTopic) => {
    setViewerOpen(false);
    setSpinOpen(false);
    setTryOnOpen(false);
    setSizeSheetOpen(false);
    setActiveHelp(topic);
  };

  const openSpin = () => {
    if (!spinAsset) return;
    setViewerOpen(false);
    setTryOnOpen(false);
    setActiveHelp(null);
    setSpinOpen(true);
  };

  const openTryOn = () => {
    setViewerOpen(false);
    setSpinOpen(false);
    setActiveHelp(null);
    setTryOnOpen(true);
  };

  const syncSelectedFromTrack = (track: HTMLDivElement | null) => {
    if (!track || track.clientWidth === 0) return;
    const index = Math.min(
      images.length - 1,
      Math.max(0, Math.round(Math.abs(track.scrollLeft) / track.clientWidth)),
    );
    setSelectedImage((current) => (current === index ? current : index));
  };

  const scrollTrackToSlide = (
    trackRef: React.RefObject<HTMLDivElement | null>,
    index: number,
    behavior: ScrollBehavior = "smooth",
  ) => {
    trackRef.current?.children[index]?.scrollIntoView({ behavior, inline: "center", block: "nearest" });
  };

  return (
    <>
      <div className="grid gap-0 sm:gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(23rem,0.82fr)] lg:items-start lg:gap-14 xl:gap-20">
        <section className="-mx-4 sm:mx-0" aria-label={`גלריית תמונות של ${product.name}`}>
          <div className="relative sm:hidden">
            <div
              ref={galleryTrackRef}
              onScroll={() => syncSelectedFromTrack(galleryTrackRef.current)}
              className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
              aria-label={`החלקה בין תמונות ${product.name}`}
            >
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => openViewer(index)}
                  className="relative w-full shrink-0 snap-center"
                  aria-label={`פתיחת ${image.alt} במסך מלא`}
                >
                  <ProductMedia
                    image={image}
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : undefined}
                    sizes="100vw"
                    className="catalog-card-media aspect-square"
                    imageClassName="object-cover"
                  />
                </button>
              ))}
            </div>
            <span className="pointer-events-none absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/68 text-ink backdrop-blur-sm" aria-hidden>
              <ZoomGlyph className="h-[1.1rem] w-[1.1rem]" />
            </span>
            {spinAsset && (
              <button
                type="button"
                onClick={openSpin}
                className="absolute left-3 top-3 flex h-11 min-w-11 items-center justify-center border border-black/10 bg-white/88 px-3 text-xs font-semibold text-ink backdrop-blur-sm"
                aria-label={`תצוגת 360 מעלות של ${product.name}`}
                title="תצוגת 360 מעלות"
              >
                360°
              </button>
            )}
            {product.tryOn?.enabled && product.category === "rings" && (
              <button
                type="button"
                onClick={openTryOn}
                className="absolute bottom-3 right-3 flex min-h-11 items-center gap-2 px-1.5 text-[0.78rem] font-medium text-ink [text-shadow:0_1px_12px_rgba(255,255,255,0.96)]"
              >
                <TryOnGlyph className="h-[1.2rem] w-[1.2rem]" />
                נסו על היד
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-1.5 flex justify-center gap-1 sm:hidden" role="group" aria-label="בחירת תמונה">
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => scrollTrackToSlide(galleryTrackRef, index)}
                  aria-label={`מעבר לתמונה ${index + 1} של ${product.name}`}
                  aria-pressed={selectedImage === index}
                  className="flex h-7 w-7 items-center justify-center"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      selectedImage === index ? "w-4 bg-ink" : "w-1.5 bg-stone/50"
                    }`}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          )}

          <div className="relative hidden sm:block">
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
                className="catalog-card-media aspect-square"
                imageClassName="animate-fade-up object-cover transition-transform duration-700 group-hover:scale-[1.012]"
              />
              <span className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/68 text-ink backdrop-blur-sm transition-colors group-hover:bg-white/90" aria-hidden>
                <ZoomGlyph className="h-[1.1rem] w-[1.1rem]" />
              </span>
            </button>
            {spinAsset && (
              <button
                type="button"
                onClick={openSpin}
                className="absolute left-4 top-4 flex h-11 min-w-11 items-center justify-center border border-black/10 bg-white/88 px-3 text-xs font-semibold text-ink backdrop-blur-sm transition-colors hover:bg-white"
                aria-label={`תצוגת 360 מעלות של ${product.name}`}
                title="תצוגת 360 מעלות"
              >
                360°
              </button>
            )}
            {product.tryOn?.enabled && product.category === "rings" && (
              <button
                type="button"
                onClick={openTryOn}
                className="absolute bottom-4 right-4 flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-ink [text-shadow:0_1px_12px_rgba(255,255,255,0.96)]"
              >
                <TryOnGlyph className="h-5 w-5" />
                נסו על היד
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className={`mt-3 hidden gap-2.5 sm:flex ${images.length > 2 ? "lg:hidden" : ""}`}>
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`הצגת תמונה ${index + 1} של ${product.name}`}
                  aria-pressed={selectedImage === index}
                  className={`relative aspect-square w-24 overflow-hidden border transition-[border-color,opacity] ${
                    selectedImage === index
                      ? "border-ink opacity-100"
                      : "border-transparent opacity-58 hover:opacity-100"
                  }`}
                >
                  <ProductMedia image={image} decorative sizes="96px" className="catalog-card-media h-full w-full" imageClassName="object-cover" />
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
                      className="catalog-card-media h-full w-full"
                      imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.018]"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="-mx-4 min-w-0 bg-white px-4 pb-7 pt-2 sm:mx-0 sm:px-6 sm:py-7 lg:sticky lg:top-28 lg:self-start lg:bg-ivory lg:px-7 lg:py-8">
          <header ref={summaryRef}>
            <h1 className="font-display text-[1.95rem] font-light leading-[1.12] text-ink sm:text-5xl lg:text-[3rem]">
              {product.name}
            </h1>
            <p className="mt-1.5 text-[0.82rem] leading-6 text-stone sm:text-base">{product.subtitle}</p>
            <div className="mt-3.5 text-right" aria-live="polite">
              <span className="block font-display text-[2.3rem] font-light leading-none text-ink sm:text-4xl">
                {formatPrice(carat.price)}
              </span>
              <span className="mt-1 block text-[0.66rem] font-medium text-stone">כולל מע״מ</span>
            </div>
          </header>

          <p className="mt-3.5 border-t border-line pt-3 text-right text-[0.7rem] font-medium text-stone">
            <span dir="ltr">{product.specs.cert} · {product.specs.color} · {product.specs.clarity} · {product.specs.cut}</span>
          </p>

          <fieldset className="pt-4.5 lg:pt-5">
            <legend className="text-[0.7rem] font-semibold text-stone">זהב</legend>
            <div className={`mt-2 grid ${product.metals.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {product.metals.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMetal(option)}
                  aria-label={metalNames[option]}
                  aria-pressed={metal === option}
                  className={`relative flex min-h-[52px] items-center justify-center gap-2 border-b px-2 text-sm transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-px after:transition-colors ${
                    metal === option
                      ? "border-gold/55 bg-selection text-ink after:bg-gold-deep"
                      : "border-line bg-transparent text-ink after:bg-transparent hover:bg-white/65"
                  }`}
                >
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border shadow-inner ${metal === option ? "border-ink/25" : "border-black/10"}`}
                    style={{ backgroundColor: METAL_SWATCH[option] }}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">{metalNames[option]}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="pt-4.5 lg:pt-5">
            <legend className="sr-only">{caratCopy.legend}</legend>
            <div className="flex items-center justify-between gap-3 text-[0.7rem] font-semibold text-stone">
              <span>{caratCopy.legend}</span>
              <button
                type="button"
                onClick={() => openHelp("carat")}
                className="flex h-8 w-8 items-center justify-center text-ink-soft transition-colors hover:text-ink"
                aria-label={`מידע על ${caratCopy.legend}`}
              >
                <InfoGlyph className="h-4 w-4" />
              </button>
            </div>
            <div className="no-scrollbar mt-1.5 flex overflow-x-auto border-y border-line" dir="rtl">
              {product.carats.map((option, index) => {
                const selected = index === caratIdx;
                return (
                  <button
                    key={`${option.value}-${option.price}`}
                    type="button"
                    onClick={() => setCaratIdx(index)}
                    aria-pressed={selected}
                    aria-label={`${option.value} ${caratCopy.qualifier}, ${formatPrice(option.price)}`}
                    className={`flex min-h-[72px] min-w-[25%] flex-1 flex-col items-center justify-center border-l border-line px-1.5 py-2 text-center transition-colors last:border-l-0 ${
                      selected ? "bg-ink text-ivory" : "bg-transparent text-ink hover:bg-white/70"
                    }`}
                  >
                    <span className={`block font-display text-[1.35rem] leading-none ${selected ? "text-ivory" : "text-ink"}`} dir="ltr">{option.value}</span>
                    <span className={`mt-1.5 block whitespace-nowrap text-[0.65rem] font-medium ${selected ? "text-footer-muted" : "text-stone"}`}>
                      {formatPrice(option.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {product.category === "rings" && (
            <div className="pt-4.5 lg:pt-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.7rem] font-semibold text-stone">מידת טבעת</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveHelp(null);
                  setViewerOpen(false);
                  setSpinOpen(false);
                  setTryOnOpen(false);
                  setSizeSheetOpen(true);
                }}
                className="mt-1.5 flex min-h-[52px] w-full items-center justify-between border-y border-line bg-white/55 px-3.5 text-sm text-ink transition-colors hover:border-stone hover:bg-white"
                aria-haspopup="dialog"
                aria-expanded={sizeSheetOpen}
              >
                <span className="text-right">
                  <span className="block">{ringSize === "unsure" ? "בחירת מידה" : `מידה ${ringSize} ישראלית`}</span>
                  <span className="mt-0.5 block text-[0.68rem] text-stone">
                    {ringSize === "unsure" ? "אפשר לבחור גם בהמשך" : `היקף ${ringSize + 40} מ״מ`}
                  </span>
                </span>
                <ChevronGlyph className="h-4 w-4 text-ink-soft" />
              </button>
            </div>
          )}

          <p className="mt-4 text-[0.7rem] leading-5 text-stone" aria-live="polite">{selectedSummary}</p>

          <div ref={primaryCtaRef} className="mt-4.5 lg:mt-5">
            <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-[54px] w-full">
              <WhatsAppIcon className="h-4 w-4" />
              ייעוץ אישי וזמינות בוואטסאפ
            </a>
          </div>

          <p className="mt-2.5 text-center text-[0.68rem] leading-5 text-stone">
            אספקה בדרך כלל תוך {servicePromises.collectionLeadTime}
          </p>

        </section>
      </div>

      <section className="mt-11 grid gap-7 sm:mt-14 lg:mt-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:items-center lg:gap-16" aria-labelledby="product-details-title">
        <ProductMedia
          image={detailImage}
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="catalog-card-media aspect-[4/3]"
          imageClassName="object-cover"
        />
        <div>
          <h2 id="product-details-title" className="font-display text-[2rem] font-medium leading-tight sm:text-4xl">
            העיצוב
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-stone sm:text-base">{product.description}</p>

          {product.dimensions && product.dimensions.length > 0 && (
            <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-4">
              {product.dimensions.map((dimension) => (
                <div key={dimension.label}>
                  <dt className="text-[0.72rem] font-semibold tracking-[0.08em] text-stone">{dimension.label}</dt>
                  <dd className="mt-1 text-sm font-semibold">{dimension.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="mt-8 border-y border-line sm:mt-11" aria-label="מה כלול בהזמנה">
        <dl className="grid grid-cols-3 divide-x divide-x-reverse divide-line py-4 sm:py-5">
          <div className="px-2 text-center sm:px-5">
            <dt className="text-[0.62rem] font-medium text-stone sm:text-xs">תעודה</dt>
            <dd className="mt-1 text-[0.78rem] font-semibold text-ink sm:text-sm" dir="ltr">{product.specs.cert}</dd>
          </div>
          <div className="px-2 text-center sm:px-5">
            <dt className="text-[0.62rem] font-medium text-stone sm:text-xs">משלוח</dt>
            <dd className="mt-1 text-[0.78rem] font-semibold text-ink sm:text-sm">מבוטח</dd>
          </div>
          <div className="px-2 text-center sm:px-5">
            <dt className="text-[0.62rem] font-medium text-stone sm:text-xs">שירות</dt>
            <dd className="mt-1 text-[0.78rem] font-semibold text-ink sm:text-sm">
              {product.category === "rings" ? "התאמת מידה" : "אחריות מלאה"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="-mx-4 mt-8 bg-ivory px-4 py-8 sm:-mx-6 sm:mt-12 sm:px-6 sm:py-10 lg:-mx-8 lg:mt-14 lg:px-8 lg:py-12" aria-labelledby="order-includes-title">
        <h2 id="order-includes-title" className="sr-only">אריזה ותעודה</h2>
        <p className="text-[0.95rem] font-medium leading-7 text-ink-soft sm:text-base">
          דאגנו לכל פרט — גם לאריזה.
        </p>
        <div className="mt-3.5 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.65fr)] lg:grid-rows-2 lg:gap-5">
          <figure className="col-span-2 lg:col-span-1 lg:row-span-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-ivory lg:h-full lg:aspect-auto">
              <Image
                src={assetPath(packaging.src)}
                alt={packaging.alt}
                fill
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-cover"
              />
            </div>
          </figure>

          <figure>
            <div className="relative aspect-square overflow-hidden bg-ivory lg:h-full lg:aspect-auto">
              <Image
                src={assetPath("/images/trust/v3/libi-shopping-bag-mockup.webp")}
                alt="שקית קנייה יוקרתית של LIBI DIAMONDS בגוון שנהב עם ידיות סרט"
                fill
                sizes="(min-width: 1024px) 27vw, 50vw"
                className="object-cover"
              />
            </div>
          </figure>

          <figure id="certificate-figure" className="scroll-mt-24">
            <div className="relative aspect-square overflow-hidden bg-ivory lg:h-full lg:aspect-auto">
              <Image
                src={assetPath("/images/trust/v1/certificate-sample-mockup.webp")}
                alt="דוגמה כללית למבנה של תעודה גמולוגית"
                fill
                sizes="(min-width: 1024px) 27vw, 50vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-[0.65rem] leading-5 text-ink-soft sm:text-xs">תעודה גמולוגית מותאמת ליהלום.</figcaption>
          </figure>
        </div>
      </section>

      <section className="mt-3 border-b border-line sm:mt-6 lg:mt-8" aria-label="שירות ומשלוחים">
        {serviceItems.map((item) => (
          <details key={item.title} id={`service-${item.id}`} className="faq-item scroll-mt-24 border-t border-line">
            <summary className="flex items-center justify-between gap-4 py-3 sm:py-3.5">
              <span className="text-sm font-medium">{item.title}</span>
              <span className="faq-icon text-base font-light text-ink-soft" aria-hidden>+</span>
            </summary>
            <p className="max-w-2xl pb-4 text-sm leading-7 text-stone">{item.detail}</p>
          </details>
        ))}
      </section>

      {showMobileSticky && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink px-4 pt-3 text-ivory shadow-[0_-12px_30px_rgba(18,19,19,0.16)] lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-[5.25rem] shrink-0 leading-tight">
              <span className="block text-[0.62rem] tracking-[0.06em] text-footer-subtle">מחיר</span>
              <span className="font-display text-lg font-light">{formatPrice(carat.price)}</span>
            </div>
            <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-ivory px-2.5 text-[0.8rem] font-semibold text-ink min-[390px]:text-sm">
              <WhatsAppIcon className="h-4 w-4" />
              ייעוץ וזמינות בוואטסאפ
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
          <div
            ref={viewerTrackRef}
            onScroll={() => syncSelectedFromTrack(viewerTrackRef.current)}
            className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto"
          >
            {images.map((image) => (
              <div key={image.src} className="relative w-full shrink-0 snap-center touch-pinch-zoom">
                <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-contain" loading="eager" />
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <div className="flex shrink-0 justify-center gap-2 overflow-x-auto border-t border-white/12 px-4 py-3">
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => scrollTrackToSlide(viewerTrackRef, index)}
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

      <ProductHelpSheet topic={activeHelp} onClose={() => setActiveHelp(null)} product={product} />

      {product.category === "rings" && (
        <RingSizeSheet
          open={sizeSheetOpen}
          sizes={ringSizes}
          value={ringSize}
          onSelect={setRingSize}
          onClose={() => setSizeSheetOpen(false)}
          onOpenGuide={() => window.location.assign(assetPath("/ring-size-guide"))}
        />
      )}

      {spinAsset && (
        <RingSpinViewer
          open={spinOpen}
          onClose={() => setSpinOpen(false)}
          asset={spinAsset}
          productName={product.name}
          metalName={metalNames[metal]}
        />
      )}
    </>
  );
}
