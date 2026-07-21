"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface CatalogControlSheetProps {
  open: boolean;
  title: string;
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export default function CatalogControlSheet({ open, title, titleId, onClose, children, footer }: CatalogControlSheetProps) {
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

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[#071a28]/45 sm:hidden"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="catalog-control-sheet flex max-h-[88svh] w-full flex-col bg-ivory text-ink"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="font-display text-[1.65rem] font-medium">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center"
            aria-label={`סגירת ${title}`}
          >
            <CloseGlyph />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <footer className="shrink-0 border-t border-line bg-ivory px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
