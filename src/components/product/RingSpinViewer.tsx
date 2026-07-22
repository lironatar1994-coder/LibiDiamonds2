"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import type { ProductSpinAsset } from "@/data/products";
import { assetPath } from "@/lib/site";

interface RingSpinViewerProps {
  open: boolean;
  onClose: () => void;
  asset: ProductSpinAsset;
  productName: string;
  metalName: string;
}

function framePath(asset: ProductSpinAsset, frameIndex: number) {
  return assetPath(`${asset.basePath}/frame-${String(frameIndex + 1).padStart(2, "0")}.webp`);
}

export default function RingSpinViewer({ open, onClose, asset, productName, metalName }: RingSpinViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [frame, setFrame] = useState(Math.max(0, asset.posterFrame - 1));
  const [dragging, setDragging] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; frame: number } | null>(null);

  const wrapFrame = useCallback((next: number) => {
    const count = asset.frameCount;
    return ((next % count) + count) % count;
  }, [asset.frameCount]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setFrame(Math.max(0, asset.posterFrame - 1));
  }, [asset]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setFrame((current) => wrapFrame(current - 1));
      if (event.key === "ArrowRight") setFrame((current) => wrapFrame(current + 1));
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
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
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, open, wrapFrame]);

  useEffect(() => {
    if (!open) return;
    const poster = Math.max(0, asset.posterFrame - 1);
    const nearby = [poster, wrapFrame(poster - 1), wrapFrame(poster + 1), wrapFrame(poster - 2), wrapFrame(poster + 2)];
    const order = [...new Set([...nearby, ...Array.from({ length: asset.frameCount }, (_, index) => index)])];
    let cancelled = false;
    const preload = (index: number) => {
      if (cancelled || index >= order.length) return;
      const image = new window.Image();
      image.onload = image.onerror = () => window.setTimeout(() => preload(index + 1), index < 5 ? 0 : 30);
      image.src = framePath(asset, order[index]);
    };
    preload(0);
    return () => { cancelled = true; };
  }, [asset, open, wrapFrame]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, frame };
    setDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setFrame(wrapFrame(drag.frame + Math.round((drag.x - event.clientX) / 8)));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
    setDragging(false);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ring-spin-title" className="fixed inset-0 z-[95] flex flex-col bg-ivory text-ink">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4 sm:px-6">
        <div className="min-w-0">
          <h2 id="ring-spin-title" className="truncate text-sm font-semibold">{productName}</h2>
          <p className="mt-0.5 text-xs text-stone">תצוגת 360° · {metalName}</p>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center border border-line bg-white text-2xl leading-none" aria-label="סגירת תצוגת 360 מעלות">×</button>
      </header>
      <div
        className={`relative min-h-0 flex-1 select-none overflow-hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
        tabIndex={0}
        aria-label={`${asset.alt}. גררו לצדדים או השתמשו בחיצי המקלדת לסיבוב.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img
          src={framePath(asset, frame)}
          alt={asset.alt}
          draggable={false}
          className="h-full w-full object-contain"
          onError={() => setFrame(Math.max(0, asset.posterFrame - 1))}
        />
      </div>
      <div className="shrink-0 border-t border-line px-4 py-3 text-center text-xs text-stone" aria-hidden>
        360°
      </div>
    </div>,
    document.body,
  );
}
