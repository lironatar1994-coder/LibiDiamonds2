"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { metalNames, productImages, type Product, type Metal } from "@/data/products";
import { formatPrice, waLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

const METAL_SWATCH: Record<Metal, string> = {
  yellow: "#c9a35e",
  white: "#c4c8cd",
  rose: "#d6a289",
};

const confidenceItems = ["IGI/GIA", "משלוח מבוטח", "התאמת מידה ראשונה"];

export default function ProductView({ product }: { product: Product }) {
  const [metal, setMetal] = useState<Metal>(product.metals[0]);
  const [caratIdx, setCaratIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);

  const carat = product.carats[caratIdx];
  const images = productImages(product);
  const message = `היי, אשמח לפרטים על ${product.name} — ${carat.label}, ${metalNames[metal]} (${formatPrice(carat.price)})`;

  useEffect(() => {
    const update = () => setShowStickyCta(window.scrollY > 360);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <div className="grid gap-6 pb-24 lg:grid-cols-2 lg:gap-16 lg:pb-0">
        {/* gallery */}
        <div>
          <div className="art-bg relative aspect-square overflow-hidden bg-[#f7f6f1]">
            <Image
              key={images[selectedImage].src}
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="animate-fade-up object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:max-w-[18rem]">
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`הצגת תמונה ${index + 1} של ${product.name}`}
                  aria-pressed={selectedImage === index}
                  className={`relative aspect-square overflow-hidden border bg-[#f7f6f1] transition-colors ${
                    selectedImage === index ? "border-ink" : "border-line hover:border-stone"
                  }`}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* details */}
        <div>
          <h1 className="font-display text-[1.85rem] font-medium leading-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-stone">{product.subtitle}</p>
          <p className="mt-4 text-2xl tracking-wide lg:mt-5">{formatPrice(carat.price)}</p>
          <div className="mt-5 grid grid-cols-3 gap-px border border-line bg-line text-center text-xs text-ink-soft">
            {confidenceItems.map((item) => (
              <span key={item} className="bg-ivory px-2 py-3 leading-5">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 lg:mt-8">
            <p className="text-sm font-semibold">
              גוון זהב: <span className="font-normal text-stone">{metalNames[metal]}</span>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {product.metals.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetal(m)}
                  aria-label={metalNames[m]}
                  aria-pressed={metal === m}
                  className={`flex min-h-12 items-center gap-2.5 border px-3 py-2 text-sm transition-colors ${
                    metal === m
                      ? "border-ink bg-white text-ink"
                      : "border-line bg-ivory text-ink-soft hover:border-stone"
                  }`}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: METAL_SWATCH[m] }}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">{metalNames[m]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 lg:mt-8">
            <p className="text-sm font-semibold">משקל יהלום</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3" dir="rtl">
              {product.carats.map((c, i) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setCaratIdx(i)}
                  aria-pressed={i === caratIdx}
                  className={`group min-h-[82px] border px-3 py-3 text-right transition-colors sm:px-4 ${
                    i === caratIdx
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-ivory hover:border-gold"
                  }`}
                >
                  <span className="block font-display text-lg leading-tight">{c.label}</span>
                  <span
                    className={`mt-2 block text-sm font-semibold tracking-wide ${
                      i === caratIdx ? "text-ivory" : "text-ink"
                    }`}
                  >
                    {formatPrice(c.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 lg:mt-9">
            <a
              href={waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <WhatsAppIcon className="h-4 w-4" />
              בדיקת זמינות ומחיר בוואטסאפ
            </a>
            <p className="text-center text-xs text-stone">
              ליווי אישי בבחירת האבן, הזהב והמידה.
            </p>
          </div>

        {/* specs */}
        <dl className="mt-10 grid grid-cols-2 gap-px border border-line bg-line text-sm">
          {[
            ["צבע", product.specs.color],
            ["ניקיון", product.specs.clarity],
            ["ליטוש", product.specs.cut],
            ["תעודה", product.specs.cert],
          ].map(([label, value]) => (
            <div key={label} className="bg-ivory p-4">
              <dt className="text-xs text-stone">{label}</dt>
              <dd className="mt-1 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 leading-relaxed text-stone">{product.description}</p>

        {/* service accordions */}
        <div className="mt-8 border-t border-line">
          {[
            {
              t: "משלוח ואספקה",
              d: "משלוח מבוטח עד הבית בכל הארץ, באריזת מתנה מוקפדת. אספקה תוך 7–14 ימי עסקים; פריטים בהתאמה אישית — 3–4 שבועות.",
            },
            {
              t: "תעודה ואחריות",
              d: "היהלום המרכזי מגיע עם תעודה גמולוגית בינלאומית (IGI/GIA). על התכשיט חלה אחריות מלאה על השיבוץ והמתכת, והתאמת מידה ראשונה כלולה.",
            },
            {
              t: "החזרות והחלפות",
              d: "ניתן להחזיר או להחליף פריט מהקולקציה תוך 14 יום מקבלתו, במצבו המקורי. פריטים בהתאמה אישית — בתיאום מראש.",
            },
          ].map((item) => (
            <details key={item.t} className="faq-item border-b border-line">
              <summary className="flex items-center justify-between gap-4 py-4">
                <span className="text-sm font-semibold">{item.t}</span>
                <span className="faq-icon text-lg text-gold" aria-hidden>
                  +
                </span>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-stone">{item.d}</p>
            </details>
          ))}
        </div>
        </div>
      </div>

      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 px-4 py-3 shadow-[0_-8px_24px_rgba(33,30,24,0.08)] backdrop-blur lg:hidden">
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
