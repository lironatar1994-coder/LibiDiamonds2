"use client";

import Image from "next/image";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import CatalogControlSheet from "@/components/catalog/CatalogControlSheet";
import ProductCard from "@/components/ProductCard";
import ProductMedia from "@/components/ProductMedia";
import RingStyleAtelierIllustration, { type RingAtelierStyle } from "@/components/RingStyleAtelierIllustration";
import { productImages } from "@/data/products";
import type { CatalogStyle, CategorySlug, DiamondShape, Metal, Product } from "@/data/products";
import { assetPath } from "@/lib/site";

type SortMode = "popular" | "price-low" | "price-high";

const INITIAL_PRODUCT_COUNT = 18;
const PRODUCT_COUNT_STEP = 12;

const categoryEditorial: Record<CategorySlug, { desktop: string; mobile: string; alt: string }> = {
  rings: {
    desktop: "/images/editorial/categories/rings-desktop.webp",
    mobile: "/images/editorial/categories/rings-mobile-viewing-tray.webp",
    alt: "טבעת סוליטר מזהב צהוב עם יהלום עגול על אבן מינרלית בהירה",
  },
  earrings: {
    desktop: "/images/editorial/categories/earrings-desktop.webp",
    mobile: "/images/editorial/categories/earrings-mobile.webp",
    alt: "זוג עגילי יהלום צמודים מזהב לבן על אבן מינרלית בהירה",
  },
  necklaces: {
    desktop: "/images/editorial/categories/necklaces-desktop.webp",
    mobile: "/images/editorial/categories/necklaces-mobile.webp",
    alt: "שרשרת טניס מדורגת מזהב לבן ויהלומים על אבן מינרלית בהירה",
  },
  bracelets: {
    desktop: "/images/editorial/categories/bracelets-desktop.webp",
    mobile: "/images/editorial/categories/bracelets-mobile.webp",
    alt: "צמיד טניס מזהב לבן ויהלומים על אבן מינרלית בהירה",
  },
};

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
  "multi-stone": "שלוש אבנים",
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
  const defaultMetal: Extract<Metal, "yellow" | "white"> = category === "rings" ? "yellow" : "white";
  const [sort, setSort] = useState<SortMode>("popular");
  const [displayMetal, setDisplayMetal] = useState<Extract<Metal, "yellow" | "white">>(defaultMetal);
  const [draftShape, setDraftShape] = useState<DiamondShape | "all">("all");
  const [draftMetal, setDraftMetal] = useState<Extract<Metal, "yellow" | "white">>(defaultMetal);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PRODUCT_COUNT);
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
    if (sort === "popular") return filtered;
    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.priceFrom - b.priceFrom;
      return b.priceFrom - a.priceFrom;
    });
  }, [items, shape, sort, style]);
  const displayedItems = visibleItems.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(INITIAL_PRODUCT_COUNT);
  }, [displayMetal, shape, sort, style]);
  const showShapeFilter = category === "rings" && availableShapes.length > 1;
  const showStyleFilter = availableStyles.length > 1;
  const activeFilterCount = Number(shape !== "all") + Number(style !== "all") + Number(displayMetal !== defaultMetal);
  const styleShowcase = availableStyles.slice(0, 4).map((option) => ({
    style: option,
    product: items.find((item) => item.style === option)!,
  }));

  const clearFilters = () => {
    setShape("all");
    setStyle("all");
    setDisplayMetal(defaultMetal);
  };

  const draftResultCount = useMemo(() => items.filter((item) =>
    (draftShape === "all" || item.diamondShape === draftShape) &&
    (style === "all" || item.style === style),
  ).length, [draftShape, items, style]);

  const openMobileFilters = () => {
    setDraftShape(shape);
    setDraftMetal(displayMetal);
    setMobileFilterOpen(true);
  };
  const closeMobileFilters = useCallback(() => setMobileFilterOpen(false), []);
  const closeMobileSort = useCallback(() => setMobileSortOpen(false), []);
  const applyMobileFilters = () => {
    setShape(draftShape);
    setDisplayMetal(draftMetal);
    setMobileFilterOpen(false);
  };
  const selectSort = (nextSort: SortMode) => {
    setSort(nextSort);
    setMobileSortOpen(false);
  };
  const sortLabel = sort === "popular"
    ? "הפופולריים ביותר"
    : sort === "price-low"
      ? "מחיר: מהנמוך לגבוה"
      : "מחיר: מהגבוה לנמוך";
  const resultTransitionKey = `${style}-${shape}-${sort}-${displayMetal}`;

  return (
    <>
      {styleShowcase.length > 1 && (
        <section
          className={category === "rings"
            ? "-mx-4 mt-6 border-y border-[#d7e1e6] bg-[radial-gradient(circle_at_12%_16%,rgba(145,169,183,0.16),transparent_33%),radial-gradient(circle_at_88%_82%,rgba(178,195,204,0.12),transparent_36%),linear-gradient(118deg,rgba(255,255,255,0.9)_0%,rgba(243,246,247,0.76)_42%,rgba(232,239,242,0.58)_100%),#f3f6f7] py-5 sm:mx-0 sm:mt-9 sm:py-7"
            : "mt-5 sm:mt-8"
          }
          aria-labelledby="catalog-style-heading"
        >
          {category === "rings" ? (
            <div className="px-4 text-center sm:px-7">
              <h2 id="catalog-style-heading" className="font-display text-[1.28rem] font-normal text-[#102434] sm:text-[1.55rem]">
                מצאו את סגנון הטבעת שלכם
              </h2>
            </div>
          ) : (
            <div className="mb-3 flex items-center gap-3 sm:mb-4">
              <h2 id="catalog-style-heading" className="shrink-0 text-[0.68rem] font-medium tracking-[0.14em] text-ink-soft">
                בחירה לפי סגנון
              </h2>
              <span className="h-px flex-1 bg-line/80" aria-hidden="true" />
            </div>
          )}

          <div className={category === "rings"
            ? "mt-4 overflow-x-auto overscroll-x-contain px-4 pb-1 scroll-px-4 snap-x snap-mandatory [scrollbar-width:none] sm:mt-5 sm:overflow-visible sm:px-7 [&::-webkit-scrollbar]:hidden"
            : "-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          } dir={category === "rings" ? "rtl" : undefined}>
            <div className={category === "rings"
              ? "flex min-w-max gap-3 sm:min-w-0 sm:justify-center sm:gap-6"
              : "flex min-w-max gap-2.5 sm:grid sm:min-w-0 sm:grid-cols-4 sm:gap-4"
            }>
              {styleShowcase.map(({ style: option, product }) => {
                const images = productImages(product, displayMetal);
                const image = images[1] ?? images[0];
                const active = style === option;
                const isRingAtelierStyle = category === "rings" && ["solitaire", "halo", "multi-stone", "band"].includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStyle(active ? "all" : option)}
                    aria-pressed={active}
                    className={`group shrink-0 text-right ${
                      isRingAtelierStyle
                        ? "catalog-ring-style-button w-[6.5rem] flex-none snap-start text-center sm:w-[8.25rem]"
                        : "w-[9.25rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:w-auto"
                    }`}
                  >
                    {isRingAtelierStyle ? (
                      <span className="flex flex-col items-center">
                        <RingStyleAtelierIllustration style={option as RingAtelierStyle} active={active} />
                        <span className={`mt-2.5 block min-h-5 text-center text-[0.78rem] leading-5 text-ink-soft transition-[color,font-weight] sm:mt-3 sm:text-[0.84rem] ${
                          active ? "font-medium text-ink" : "font-normal"
                        }`}>
                          {styleNames[option]}
                        </span>
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 rotate-45 border border-gilt transition-opacity motion-reduce:transition-none ${
                            active ? "bg-gilt opacity-100" : "bg-transparent opacity-0 group-focus-visible:opacity-100"
                          }`}
                          aria-hidden="true"
                        />
                      </span>
                    ) : (
                      <>
                        <ProductMedia
                          image={image}
                          sizes="(min-width: 640px) 25vw, 148px"
                          decorative
                          className={`catalog-style-media aspect-[4/3] border transition-colors ${
                            active ? "border-ink" : "border-transparent group-hover:border-line"
                          }`}
                          imageClassName="object-cover scale-[1.08] transition-transform duration-500 group-hover:scale-[1.12]"
                        />
                        <span className={`mt-2 block border-b pb-1 text-sm transition-colors ${
                          active ? "border-ink text-ink" : "border-transparent text-ink-soft"
                        }`}>
                          {styleNames[option]}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {category === "rings" && <div className="catalog-mobile-utility sticky top-16 z-30 -mx-4 mt-5 grid h-14 grid-cols-[44fr_56fr] divide-x divide-x-reverse divide-line/80 border-y border-line/80 bg-ivory/95 backdrop-blur-md sm:hidden">
        <button
          type="button"
          onClick={openMobileFilters}
          className="flex min-w-0 items-center justify-center gap-1.5 px-2 text-ink"
          aria-haspopup="dialog"
        >
          <span className="text-[0.76rem] font-semibold">סינון</span>
          <span className="text-[0.66rem] text-gilt" aria-hidden="true">·</span>
          <span className="text-[0.7rem] text-stone">{visibleItems.length} עיצובים</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileSortOpen(true)}
          className="min-w-0 px-2 text-[0.75rem] font-medium text-ink"
          aria-haspopup="dialog"
        >
          <span className="block truncate">מיון: {sortLabel}</span>
        </button>
      </div>}

      <div className={`${category === "rings" ? "mt-7 hidden sm:block" : "mt-5 block sm:mt-7"} border-y border-line/70`}>
        <div className="grid h-14 min-w-0 grid-cols-2 items-center divide-x divide-x-reverse divide-line/70">
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
              <option value="popular">הפופולריים ביותר</option>
              <option value="price-low">מחיר: מהנמוך לגבוה</option>
              <option value="price-high">מחיר: מהגבוה לנמוך</option>
            </select>
          </label>
        </div>

        {filtersOpen && (
          <div id="catalog-filters" className="border-t border-line/70 py-6 sm:px-4 sm:py-7">
            {showStyleFilter && category !== "rings" && (
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
              <fieldset className={showStyleFilter && category !== "rings" ? "mt-6 border-t border-line/60 pt-5" : ""}>
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
              <button type="button" onClick={clearFilters} className="mt-5 min-h-11 border-b border-stone/50 px-2 text-xs text-stone transition-colors hover:text-ink">
                ניקוי הסינון
              </button>
            )}
          </div>
        )}
      </div>

      {category === "rings" && activeFilterCount > 0 && (
        <div className="mt-3 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-line/60 pb-2 sm:mt-4" aria-label="סינון פעיל">
          {style !== "all" && <ActiveFilterLabel onClear={() => setStyle("all")}>{styleNames[style]}</ActiveFilterLabel>}
          {shape !== "all" && <ActiveFilterLabel onClear={() => setShape("all")}>{shapeNames[shape]}</ActiveFilterLabel>}
          {displayMetal !== defaultMetal && <ActiveFilterLabel onClear={() => setDisplayMetal(defaultMetal)}>זהב לבן</ActiveFilterLabel>}
          <button type="button" onClick={clearFilters} className="ms-auto min-h-11 text-[0.7rem] text-stone underline decoration-line underline-offset-4">
            ניקוי הכל
          </button>
        </div>
      )}

      <p className="sr-only" aria-live="polite">נמצאו {visibleItems.length} עיצובים</p>

      {visibleItems.length > 0 ? (
        <div
          key={resultTransitionKey}
          className={`catalog-results-grid mt-6 grid grid-cols-2 gap-x-3 sm:mt-9 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-6 ${
            category === "rings" ? "gap-y-8" : "gap-y-9"
          }`}
        >
          {displayedItems.map((product, index) => (
            <Fragment key={product.slug}>
              <ProductCard product={product} metal={displayMetal} variant="catalog" />
              {visibleItems.length > 10 && index === 7 && (
                <CategoryEditorial category={category} viewport="mobile" />
              )}
              {visibleItems.length > 10 && index === 8 && (
                <CategoryEditorial category={category} viewport="desktop" />
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="my-14 border-y border-line/70 px-5 py-14 text-center sm:my-20 sm:py-20">
          <span className="mx-auto block h-3 w-3 rotate-45 border border-gilt" aria-hidden="true" />
          <h3 className="mt-6 font-display text-2xl font-medium text-ink">לא מצאנו טבעת בשילוב הזה.</h3>
          <button type="button" onClick={clearFilters} className="mt-5 min-h-11 border-b border-gilt px-3 text-sm text-ink">
            ניקוי הסינון
          </button>
        </div>
      )}

      {visibleCount < visibleItems.length && (
        <div className="mt-10 flex justify-center sm:mt-14">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PRODUCT_COUNT_STEP)}
            className={`catalog-load-more flex min-h-12 min-w-64 items-center justify-center gap-3 px-6 text-sm text-ink transition-colors ${
              category === "rings" ? "border border-gilt bg-ivory hover:bg-[#f8f6f0]" : "border-b border-ink pb-2 hover:border-gold-deep hover:text-gold-deep"
            }`}
          >
            {category === "rings" && <span className="h-2 w-2 rotate-45 border border-gilt" aria-hidden="true" />}
            הצגת טבעות נוספות
          </button>
        </div>
      )}

      {category === "rings" && <CatalogControlSheet
        open={mobileFilterOpen}
        title="סינון הטבעות"
        titleId="catalog-mobile-filter-title"
        onClose={closeMobileFilters}
        footer={(
          <div>
            <button
              type="button"
              onClick={applyMobileFilters}
              disabled={draftResultCount === 0}
              className="btn-primary min-h-[52px] w-full disabled:cursor-not-allowed disabled:opacity-45"
            >
              {draftResultCount > 0 ? `הצגת ${draftResultCount} טבעות` : "אין תוצאות"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftShape("all");
                setDraftMetal(defaultMetal);
              }}
              className="mx-auto mt-3 block min-h-11 px-3 text-xs text-stone underline decoration-line underline-offset-4"
            >
              ניקוי בחירה
            </button>
          </div>
        )}
      >
        {showShapeFilter && (
          <fieldset>
            <legend className="mb-3 text-xs font-semibold text-stone">חיתוך היהלום</legend>
            <div className="grid grid-cols-3 gap-2">
              <SheetChoice active={draftShape === "all"} onClick={() => setDraftShape("all")}>הכל</SheetChoice>
              {availableShapes.map((option) => (
                <SheetChoice key={option} active={draftShape === option} onClick={() => setDraftShape(option)}>
                  {shapeNames[option]}
                </SheetChoice>
              ))}
            </div>
          </fieldset>
        )}
        <fieldset className={showShapeFilter ? "mt-7 border-t border-line pt-6" : ""}>
          <legend className="mb-3 text-xs font-semibold text-stone">תצוגת מתכת</legend>
          <div className="grid grid-cols-2 border border-line bg-white">
            <MetalChoice metal="yellow" active={draftMetal === "yellow"} onClick={() => setDraftMetal("yellow")}>זהב צהוב</MetalChoice>
            <MetalChoice metal="white" active={draftMetal === "white"} onClick={() => setDraftMetal("white")}>זהב לבן</MetalChoice>
          </div>
        </fieldset>
      </CatalogControlSheet>}

      {category === "rings" && <CatalogControlSheet
        open={mobileSortOpen}
        title="מיון הטבעות"
        titleId="catalog-mobile-sort-title"
        onClose={closeMobileSort}
      >
        <div role="radiogroup" aria-label="מיון הטבעות" className="divide-y divide-line">
          <SortChoice active={sort === "popular"} onClick={() => selectSort("popular")}>הפופולריים ביותר</SortChoice>
          <SortChoice active={sort === "price-low"} onClick={() => selectSort("price-low")}>מחיר: מהנמוך לגבוה</SortChoice>
          <SortChoice active={sort === "price-high"} onClick={() => selectSort("price-high")}>מחיר: מהגבוה לנמוך</SortChoice>
        </div>
      </CatalogControlSheet>}
    </>
  );
}

function CategoryEditorial({
  category,
  viewport,
}: {
  category: CategorySlug;
  viewport: "mobile" | "desktop";
}) {
  const editorial = categoryEditorial[category];
  const mobile = viewport === "mobile";

  return (
    <div
      className={mobile
        ? "relative col-span-2 -mx-4 my-10 aspect-[3/4] overflow-hidden sm:-mx-6 lg:hidden"
        : "hidden lg:col-span-3 lg:my-3 lg:block lg:aspect-[15/8] lg:overflow-hidden"}
    >
      <Image
        src={assetPath(mobile ? editorial.mobile : editorial.desktop)}
        alt={editorial.alt}
        width={mobile ? 1200 : 1800}
        height={mobile ? 1600 : 960}
        sizes={mobile ? "100vw" : "(min-width: 1280px) 1216px, 100vw"}
        className="h-full w-full object-cover"
      />
      {mobile && category === "rings" && (
        <span
          className="absolute left-5 top-6 border-s border-gilt ps-3 text-[0.62rem] font-semibold tracking-[0.22em] text-ink-soft"
          dir="ltr"
        >
          AURA · 18K YELLOW GOLD
        </span>
      )}
    </div>
  );
}

function ActiveFilterLabel({ onClear, children }: { onClear: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClear} className="flex min-h-11 items-center gap-2 text-xs font-medium text-ink-soft">
      <span>{children}</span>
      <span className="text-base font-light text-gilt-deep" aria-hidden="true">×</span>
      <span className="sr-only">הסרה</span>
    </button>
  );
}

function SheetChoice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 border px-2 text-sm transition-colors ${
        active ? "border-ink bg-ink text-ivory" : "border-line bg-white text-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}

function SortChoice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="flex min-h-[54px] w-full items-center justify-between py-2 text-right text-sm text-ink"
    >
      <span>{children}</span>
      <span className={`h-2.5 w-2.5 rotate-45 border border-gilt ${active ? "bg-gilt" : "bg-transparent"}`} aria-hidden="true" />
    </button>
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
