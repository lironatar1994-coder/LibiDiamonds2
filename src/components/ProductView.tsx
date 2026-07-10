"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { metalNames, productImage, type Product, type Metal } from "@/data/products";
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
  const [showStickyCta, setShowStickyCta] = useState(false);

  const carat = product.carats[caratIdx];
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
          <div className="art-bg relative aspect-square overflow-hidden">
            <Image
              src={productImage(product)}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* details */}
        <div>
          <h1 className="font-display text-3xl font-medium sm:text-4xl">{product.name}</h1>
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
            <div className="mt-3 flex gap-3">
              {product.metals.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetal(m)}
                  aria-label={metalNames[m]}
                  aria-pressed={metal === m}
                  className={`h-11 w-11 rounded-full border-2 transition-all ${
                    metal === m ? "border-ink" : "border-transparent hover:border-line"
                  }`}
                  style={{ backgroundColor: METAL_SWATCH[m] }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7 lg:mt-8">
            <div className="flex items-end justify-between gap-4">
              <p className="text-sm font-semibold">משקל יהלום</p>
              <p className="text-xs tracking-[0.12em] text-stone">המחיר מתעדכן לפי בחירה</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3" dir="rtl">
              {product.carats.map((c, i) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setCaratIdx(i)}
                  aria-pressed={i === caratIdx}
                  className={`group relative min-h-[88px] border px-4 py-3 text-right transition-colors ${
                    i === caratIdx
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-ivory hover:border-gold"
                  }`}
                >
                  <span
                    className={`absolute left-3 top-3 h-2 w-2 rounded-full ${
                      i === caratIdx ? "bg-gold" : "bg-line group-hover:bg-gold"
                    }`}
                    aria-hidden
                  />
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
              מענה אישי ומהיר · ללא התחייבות · אפשרות לפגישה אישית
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
