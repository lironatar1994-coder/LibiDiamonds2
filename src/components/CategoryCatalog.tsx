"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { CatalogStyle, CategorySlug, DiamondShape, Metal, Product } from "@/data/products";

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
  const [displayMetal, setDisplayMetal] = useState<Extract<Metal, "yellow" | "white">>(
    category === "rings" ? "yellow" : "white",
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const activeFilterCount = Number(shape !== "all") + Number(style !== "all");

  const clearFilters = () => {
    setShape("all");
    setStyle("all");
  };

  return (
    <>
      <div className="mt-9 border-y border-line/70">
        <div className="grid h-14 min-w-0 grid-cols-3 items-center divide-x divide-x-reverse divide-line/70">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="catalog-filters"
            className="h-full min-w-0 text-sm text-ink transition-colors hover:text-gold-deep"
          >
            סינון{activeFilterCount ? ` · ${activeFilterCount}` : ""}
          </button>
          <label className="flex h-full min-w-0 items-center justify-center gap-1.5 overflow-hidden text-xs text-stone">
            <span className="sr-only">מיון</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="w-full min-w-0 border-0 bg-transparent px-1 text-center text-sm text-ink outline-none"
              aria-label="מיון מוצרים"
            >
              <option value="featured">מומלצים</option>
              <option value="price-low">מחיר: מהנמוך לגבוה</option>
              <option value="price-high">מחיר: מהגבוה לנמוך</option>
            </select>
          </label>
          <span className="min-w-0 text-center text-xs text-stone">{visibleItems.length} פריטים</span>
        </div>

        {filtersOpen && (
          <div id="catalog-filters" className="border-t border-line/70 py-6 sm:px-4 sm:py-7">
            {showStyleFilter && (
              <fieldset>
                <legend className="mb-3 text-xs text-stone">סגנון</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                  <FilterChoice active={style === "all"} onClick={() => setStyle("all")}>הכל</FilterChoice>
                  {availableStyles.map((option) => (
                    <FilterChoice key={option} active={style === option} onClick={() => setStyle(option)}>
                      {styleNames[option]}
                    </FilterChoice>
                  ))}
                </div>
              </fieldset>
            )}

            {showShapeFilter && (
              <fieldset className={showStyleFilter ? "mt-6 border-t border-line/60 pt-5" : ""}>
                <legend className="mb-3 text-xs text-stone">חיתוך היהלום</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                  <FilterChoice active={shape === "all"} onClick={() => setShape("all")}>הכל</FilterChoice>
                  {availableShapes.map((option) => (
                    <FilterChoice key={option} active={shape === option} onClick={() => setShape(option)}>
                      {shapeNames[option]}
                    </FilterChoice>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="mt-6 border-t border-line/60 pt-5">
              <legend className="mb-3 text-xs text-stone">תצוגת מתכת</legend>
              <div className="grid max-w-sm grid-cols-2 border border-line bg-white">
                <MetalChoice metal="yellow" active={displayMetal === "yellow"} onClick={() => setDisplayMetal("yellow")}>זהב צהוב</MetalChoice>
                <MetalChoice metal="white" active={displayMetal === "white"} onClick={() => setDisplayMetal("white")}>זהב לבן</MetalChoice>
              </div>
            </fieldset>

            {activeFilterCount > 0 && (
              <button type="button" onClick={clearFilters} className="mt-5 border-b border-stone/50 pb-0.5 text-xs text-stone transition-colors hover:text-ink">
                ניקוי הסינון
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
        {visibleItems.map((product) => (
          <ProductCard key={product.slug} product={product} metal={displayMetal} />
        ))}
      </div>
    </>
  );
}

function FilterChoice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border-b pb-1 text-sm transition-colors ${
        active ? "border-ink text-ink" : "border-transparent text-stone hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function MetalChoice({
  metal,
  active,
  onClick,
  children,
}: {
  metal: "yellow" | "white";
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-11 items-center justify-center gap-2 border-l border-line first:border-l-0 ${
        active ? "bg-ink text-ivory" : "text-stone"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-3 w-3 rounded-full border ${
          metal === "yellow" ? "border-[#b99449] bg-[#d0aa5d]" : "border-[#b9bdc1] bg-[#d9dcdf]"
        }`}
      />
      <span className="text-xs">{children}</span>
    </button>
  );
}
