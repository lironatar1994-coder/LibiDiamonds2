"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@/data/products";
import { assetPath } from "@/lib/site";

const TryOnDialog = dynamic(() => import("@/components/try-on/TryOnDialog"), { ssr: false });
const EarringTryOnDialog = dynamic(() => import("@/components/try-on/EarringTryOnDialog"), { ssr: false });

type TryOnChoice = "ring" | "earrings" | "bracelet";

const auraProduct = products.find((product) => product.slug === "aura-solitaire-ring")!;
const stellaProduct = products.find((product) => product.slug === "stella-diamond-studs")!;
const iconProduct = products.find((product) => product.slug === "icon-tennis-bracelet")!;
const rivieraProduct = products.find((product) => product.slug === "riviera-tennis-necklace")!;

const auraCarat = auraProduct.carats.find((option) => option.value === "1.00") ?? auraProduct.carats[0];
const stellaCarat = stellaProduct.carats.find((option) => option.value === "1.00") ?? stellaProduct.carats[0];
const iconCarat = iconProduct.carats[0];

const choiceItems: Array<{
  choice: TryOnChoice | "necklace";
  category: string;
  productName: string;
  image: string;
  imageAlt: string;
  available: boolean;
}> = [
  {
    choice: "ring",
    category: "טבעת",
    productName: "אורה",
    image: "/images/products/catalog/aura-solitaire-ring-yellow-primary.webp",
    imageAlt: "טבעת סוליטר אורה מזהב צהוב",
    available: true,
  },
  {
    choice: "earrings",
    category: "עגילים",
    productName: "סטלה",
    image: "/images/products/catalog/stella-diamond-studs-white-primary.webp",
    imageAlt: "עגילי יהלום סטלה מזהב לבן",
    available: true,
  },
  {
    choice: "bracelet",
    category: "צמיד",
    productName: "אייקון",
    image: "/images/products/catalog/icon-tennis-bracelet-white-primary.webp",
    imageAlt: "צמיד טניס אייקון מזהב לבן",
    available: true,
  },
  {
    choice: "necklace",
    category: "שרשרת",
    productName: "ריביירה",
    image: "/images/products/catalog/riviera-tennis-necklace-white-primary.webp",
    imageAlt: "שרשרת טניס ריביירה מזהב לבן",
    available: false,
  },
];

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function TryOnChoiceSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (choice: TryOnChoice) => void;
}) {
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
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
      className="try-on-choice-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="try-on-choice-title"
        className="try-on-choice-panel"
        dir="rtl"
      >
        <header className="try-on-choice-header">
          <span className="try-on-choice-header-line" aria-hidden="true" />
          <h2 id="try-on-choice-title" className="font-display">
            מה תרצו למדוד?
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="try-on-choice-close"
            aria-label="סגירת בחירת התכשיט"
          >
            <CloseGlyph />
          </button>
        </header>

        <div className="try-on-choice-tray" role="group" aria-label="בחירת תכשיט למדידה">
          {choiceItems.map((item) => (
            <button
              key={item.choice}
              type="button"
              disabled={!item.available}
              aria-disabled={!item.available}
              onClick={() => item.available && onSelect(item.choice as TryOnChoice)}
              className={`try-on-choice-item try-on-choice-item--${item.choice}${item.available ? "" : " is-disabled"}`}
            >
              <span className="try-on-choice-image">
                <Image
                  src={assetPath(item.image)}
                  alt={item.imageAlt}
                  fill
                  sizes="(min-width: 640px) 190px, 46vw"
                  className="object-contain"
                />
              </span>
              <span className="try-on-choice-copy">
                <strong className="font-display">{item.category}</strong>
                <span>״{item.productName}״</span>
                {!item.available && <em>בקרוב</em>}
              </span>
            </button>
          ))}
          <span className="try-on-choice-center-gem" aria-hidden="true" />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function HomeTryOnFeature() {
  const [chooserOpen, setChooserOpen] = useState(false);
  const [activeTryOn, setActiveTryOn] = useState<TryOnChoice | null>(null);

  const closeChooser = useCallback(() => setChooserOpen(false), []);
  const selectTryOn = useCallback((choice: TryOnChoice) => {
    setChooserOpen(false);
    setActiveTryOn(choice);
  }, []);
  const closeTryOn = useCallback(() => setActiveTryOn(null), []);

  const auraTryOn = auraProduct.tryOn?.target === "finger" ? auraProduct.tryOn : null;
  const stellaTryOn = stellaProduct.tryOn?.target === "ear" ? stellaProduct.tryOn : null;
  const iconTryOn = iconProduct.tryOn?.target === "wrist" ? iconProduct.tryOn : null;

  if (!auraTryOn || !stellaTryOn || !iconTryOn || !rivieraProduct) return null;

  return (
    <>
      <section className="home-try-on" aria-labelledby="home-try-on-title">
        <div className="home-try-on-layout mx-auto max-w-7xl">
          <div className="home-try-on-media">
            <Image
              src={assetPath("/images/editorial/try-on/v4-story/aura-try-on-mobile.webp")}
              alt="טבעת סוליטר אורה מזהב צהוב על שכבות אבן כחולה"
              fill
              sizes="100vw"
              className="object-cover md:hidden"
            />
            <Image
              src={assetPath("/images/editorial/try-on/v3-no-hands/aura-focus-desktop.webp")}
              alt="טבעת סוליטר אורה מזהב צהוב על שכבות אבן כחולה"
              fill
              sizes="(min-width: 1280px) 810px, 65vw"
              className="hidden object-cover md:block"
            />
            <span className="home-try-on-media-shade" aria-hidden="true" />
            <span className="home-try-on-focus" aria-hidden="true" />
          </div>

          <div className="home-try-on-copy text-center">
            <div className="home-try-on-copy-inner">
              <h2 id="home-try-on-title" className="font-display text-[2.35rem] font-medium leading-[1.08] text-ivory sm:text-5xl lg:text-[3.25rem]">
                לפני שבוחרים, רואים.
              </h2>
              <button
                type="button"
                onClick={() => setChooserOpen(true)}
                className="home-try-on-cta mx-auto mt-7 inline-flex min-h-[52px] items-center justify-center gap-3 px-7 text-sm font-semibold"
                aria-haspopup="dialog"
              >
                <span className="home-try-on-cta-gem" aria-hidden="true" />
                מדדו תכשיט
              </button>
            </div>
          </div>
        </div>
      </section>

      <TryOnChoiceSheet open={chooserOpen} onClose={closeChooser} onSelect={selectTryOn} />

      <TryOnDialog
        open={activeTryOn === "ring"}
        onClose={closeTryOn}
        productName={auraProduct.name}
        metal="yellow"
        caratValue={auraCarat.value}
        caratSelected={false}
        ringSize="unsure"
        config={auraTryOn}
      />

      <EarringTryOnDialog
        open={activeTryOn === "earrings"}
        onClose={closeTryOn}
        productName={stellaProduct.name}
        metal="white"
        caratValue={stellaCarat.value}
        caratSelected={false}
        config={stellaTryOn}
      />

      <TryOnDialog
        open={activeTryOn === "bracelet"}
        onClose={closeTryOn}
        productName={iconProduct.name}
        metal="white"
        caratValue={iconCarat.value}
        caratSelected={false}
        ringSize="unsure"
        config={iconTryOn}
      />
    </>
  );
}
