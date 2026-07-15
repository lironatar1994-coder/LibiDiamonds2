"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { CatalogStyle, CategorySlug, DiamondShape, Product } from "@/data/products";

type SortMode = "featured" | "price-low" | "price-high";

const shapeOrder: DiamondShape[] = [
  "round",
  "oval",
  "emerald",
  "cushion",
  "pear",
  "princess",
  "marquise",
  "radiant",
  "asscher",
];

const shapeNames: Record<DiamondShape, string> = {
  round: "עגול",
  oval: "אובל",
  emerald: "אמרלד",
  cushion: "קושן",
  pear: "טיפה",
  princess: "פרינסס",
  marquise: "מרקיזה",
  radiant: "רדיאנט",
  asscher: "אשר",
};

const styleNames: Record<CatalogStyle, string> = {
  solitaire: "סוליטר",
  halo: "היילו",
  "multi-stone": "מספר אבנים",
  band: "טבעות יהלומים",
  studs: "צמודים",
  hoops: "חישוקים",
  drops: "תלויים",
  pendant: "תליונים",
  tennis: "טניס",
  station: "תחנות",
  bangle: "קשיחים",
};

export default function CategoryCatalog({
  items,
  category,
}: {
  items: Product[];
  category: CategorySlug;
}) {
  const [shape, setShape] = useState<DiamondShape | "all">("all");
  const [style, setStyle] = useState<CatalogStyle | "all">("all");
  const [sort, setSort] = useState<SortMode>("featured");
  const availableShapes = useMemo(
    () => shapeOrder.filter((option) => items.some((item) => item.diamondShape === option)),
    [items],
  );
  const availableStyles = useMemo(
    () => Array.from(new Set(items.map((item) => item.style).filter((value): value is CatalogStyle => Boolean(value)))),
    [items],
  );
  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) =>
      (shape === "all" || item.diamondShape === shape) &&
      (style === "all" || item.style === style),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.priceFrom - b.priceFrom;
      if (sort === "price-high") return b.priceFrom - a.priceFrom;
      return Number(Boolean(b.featured || b.bestseller)) - Number(Boolean(a.featured || a.bestseller));
    });
  }, [items, shape, sort, style]);
  const showShapeFilter = category === "rings" && availableShapes.length > 1;
  const showStyleFilter = availableStyles.length > 1;

  return (
    <>
      {showShapeFilter ? (
        <div
          className="-mx-4 mt-9 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:mt-11 sm:px-0 [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="סינון טבעות לפי צורת יהלום"
        >
          <div className="flex min-w-max items-center gap-7 border-b border-line/70 sm:justify-center sm:gap-9" dir="rtl">
            <button
              type="button"
              onClick={() => setShape("all")}
              aria-pressed={shape === "all"}
              className={`relative h-11 whitespace-nowrap text-sm transition-colors after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px after:transition-colors ${
                shape === "all"
                  ? "text-ink after:bg-ink"
                  : "text-stone after:bg-transparent hover:text-ink"
              }`}
            >
              הכל
            </button>
            {availableShapes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setShape(option)}
                aria-pressed={shape === option}
                className={`relative h-11 whitespace-nowrap text-sm transition-colors after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px after:transition-colors ${
                  shape === option
                    ? "text-ink after:bg-ink"
                    : "text-stone after:bg-transparent hover:text-ink"
                }`}
              >
                {shapeNames[option]}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={`${showShapeFilter ? "mt-5" : "mt-9"} border-y border-line/70 py-3`}>
        <div className="flex items-center justify-between gap-4">
          <span className="whitespace-nowrap text-xs text-stone">{visibleItems.length} פריטים</span>
          <label className="flex items-center gap-2 text-xs text-stone">
            <span>מיון</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="h-10 border-0 bg-transparent pr-1 text-sm text-ink outline-none"
              aria-label="מיון מוצרים"
            >
              <option value="featured">מומלצים</option>
              <option value="price-low">מחיר: מהנמוך לגבוה</option>
              <option value="price-high">מחיר: מהגבוה לנמוך</option>
            </select>
          </label>
        </div>
        {showStyleFilter && (
          <div className="-mx-4 mt-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" role="group" aria-label="סינון לפי סגנון">
            <div className="flex min-w-max gap-2">
              <button type="button" onClick={() => setStyle("all")} aria-pressed={style === "all"} className={`h-9 border px-4 text-xs ${style === "all" ? "border-ink bg-ink text-ivory" : "border-line bg-white text-stone"}`}>הכל</button>
              {availableStyles.map((option) => (
                <button key={option} type="button" onClick={() => setStyle(option)} aria-pressed={style === option} className={`h-9 border px-4 text-xs ${style === option ? "border-ink bg-ink text-ivory" : "border-line bg-white text-stone"}`}>
                  {styleNames[option]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
        {visibleItems.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </>
  );
}
