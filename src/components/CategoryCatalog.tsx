"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { CategorySlug, DiamondShape, Product } from "@/data/products";

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

export default function CategoryCatalog({
  items,
  category,
}: {
  items: Product[];
  category: CategorySlug;
}) {
  const [shape, setShape] = useState<DiamondShape | "all">("all");
  const availableShapes = useMemo(
    () => shapeOrder.filter((option) => items.some((item) => item.diamondShape === option)),
    [items],
  );
  const visibleItems = shape === "all" ? items : items.filter((item) => item.diamondShape === shape);
  const showShapeFilter = category === "rings" && availableShapes.length > 1;

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

      <div className={`${showShapeFilter ? "mt-10" : "mt-12"} grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6`}>
        {visibleItems.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </>
  );
}
