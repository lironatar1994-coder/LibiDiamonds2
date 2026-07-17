"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

interface RingSizeSheetProps {
  open: boolean;
  sizes: number[];
  value: number | "unsure";
  onSelect: (value: number | "unsure") => void;
  onClose: () => void;
  onOpenGuide: () => void;
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export default function RingSizeSheet({ open, sizes, value, onSelect, onClose, onOpenGuide }: RingSizeSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [draftSize, setDraftSize] = useState(14);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const sortedSizes = useMemo(() => [...sizes].sort((a, b) => a - b), [sizes]);
  const commonSizes = useMemo(() => {
    const preferred = sortedSizes.filter((size) => size >= 10 && size <= 18);
    return preferred.length > 1 ? preferred : sortedSizes;
  }, [sortedSizes]);
  const additionalSizes = useMemo(
    () => sortedSizes.filter((size) => !commonSizes.includes(size)),
    [commonSizes, sortedSizes],
  );
  const draftIsCommon = commonSizes.includes(draftSize);
  const sliderIndex = Math.max(0, commonSizes.indexOf(draftSize));
  const sliderProgress = draftIsCommon && commonSizes.length > 1 ? (sliderIndex / (commonSizes.length - 1)) * 100 : 0;
  const circumference = draftSize + 40;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || commonSizes.length === 0) return;
    const initialSize = typeof value === "number"
      ? value
      : commonSizes.includes(14)
        ? 14
        : commonSizes[Math.floor(commonSizes.length / 2)];
    setDraftSize(initialSize);
    setShowAllSizes(typeof value === "number" && !commonSizes.includes(value));
  }, [commonSizes, open, value]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  if (!mounted || !open) return null;

  const choose = (nextValue: number | "unsure") => {
    onSelect(nextValue);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/38 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ring-size-sheet-title"
        className="flex max-h-[92svh] w-full flex-col bg-ivory sm:max-w-lg sm:border sm:border-line"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4 sm:px-7">
          <div>
            <h2 id="ring-size-sheet-title" className="font-display text-2xl font-medium text-ink">בחרו מידה</h2>
            <button
              type="button"
              onClick={onOpenGuide}
              className="mt-1 border-b border-gold/45 pb-0.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold hover:text-ink"
            >
              מדריך מידות
            </button>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:bg-white"
            aria-label="סגירת בחירת המידה"
          >
            <CloseGlyph />
          </button>
        </header>

        <div className="overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-7 sm:pb-7">
          <div className="text-center" aria-live="polite">
            <span className="block text-[0.65rem] font-semibold text-stone">מידה ישראלית</span>
            <strong className="mt-1 block font-display text-[3.25rem] font-light leading-none text-ink">
              {draftSize}
            </strong>
            <span className="mt-1.5 block text-xs text-ink-soft">היקף {circumference} מ״מ</span>
          </div>

          {commonSizes.length > 0 && (
            <div className="mt-7" dir="ltr">
              <input
                type="range"
                min={0}
                max={Math.max(0, commonSizes.length - 1)}
                step={1}
                value={sliderIndex}
                onChange={(event) => setDraftSize(commonSizes[Number(event.target.value)])}
                className={`ring-size-gauge w-full ${draftIsCommon ? "" : "ring-size-gauge--inactive"}`}
                style={{ "--ring-size-progress": `${sliderProgress}%` } as CSSProperties}
                aria-label="בחירת מידה ישראלית"
                aria-valuetext={`מידה ${draftSize}, היקף ${circumference} מילימטר`}
              />

              <div
                className="mt-0.5 grid"
                style={{ gridTemplateColumns: `repeat(${commonSizes.length}, minmax(0, 1fr))` }}
                role="group"
                aria-label="מידות נפוצות"
              >
                {commonSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setDraftSize(size)}
                    aria-label={`מידה ${size}`}
                    aria-pressed={draftSize === size}
                    className={`relative flex min-h-9 items-end justify-center pb-0.5 text-[0.68rem] transition-colors before:absolute before:top-0 before:h-1.5 before:w-px ${
                      draftSize === size
                        ? "font-semibold text-ink before:bg-gold-deep"
                        : "text-stone before:bg-line hover:text-ink"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {additionalSizes.length > 0 && (
            <div className="mt-5 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setShowAllSizes((current) => !current)}
                className="flex min-h-9 w-full items-center justify-between text-xs font-medium text-ink-soft transition-colors hover:text-ink"
                aria-expanded={showAllSizes}
              >
                <span>מידות נוספות</span>
                <span className={`text-base font-light transition-transform ${showAllSizes ? "rotate-45" : ""}`} aria-hidden>+</span>
              </button>

              {showAllSizes && (
                <div className="mt-3 grid grid-cols-5 gap-2" role="group" aria-label="מידות נוספות">
                  {additionalSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setDraftSize(size)}
                      aria-pressed={draftSize === size}
                      className={`min-h-11 border font-display text-lg transition-colors ${
                        draftSize === size
                          ? "border-ink bg-ink text-ivory"
                          : "border-line bg-white text-ink hover:border-stone"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => choose(draftSize)}
            className="btn-primary mt-5 min-h-[52px] w-full"
          >
            בחירת מידה {draftSize}
          </button>

          <button
            type="button"
            onClick={() => choose("unsure")}
            className="mx-auto mt-4 block border-b border-gold/45 pb-0.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold hover:text-ink"
          >
            לא בטוחים במידה? נבחר יחד
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
