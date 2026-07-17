"use client";

import { useEffect, useRef, useState } from "react";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

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
        className="flex max-h-[88svh] w-full flex-col bg-ivory sm:max-w-lg sm:border sm:border-line"
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
          <button
            type="button"
            onClick={() => choose("unsure")}
            aria-pressed={value === "unsure"}
            className={`flex min-h-12 w-full items-center justify-between border-y px-3.5 text-sm transition-colors ${
              value === "unsure" ? "border-ink bg-white text-ink" : "border-line text-ink-soft hover:bg-white/65 hover:text-ink"
            }`}
          >
            <span>לא בטוחים במידה</span>
            <span className="text-xs">נבחר יחד</span>
          </button>

          <div className="mt-5 grid grid-cols-4 gap-2" role="group" aria-label="מידות טבעת">
            {sizes.map((size) => {
              const selected = value === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => choose(size)}
                  aria-pressed={selected}
                  className={`flex aspect-square min-h-14 items-center justify-center border font-display text-xl transition-colors ${
                    selected
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-white text-ink hover:border-stone"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
