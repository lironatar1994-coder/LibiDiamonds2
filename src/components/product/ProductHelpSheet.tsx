"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/data/products";

export type ProductHelpTopic = "size" | "carat" | "metal" | "certificate";

interface ProductHelpSheetProps {
  topic: ProductHelpTopic | null;
  onClose: () => void;
  product: Product;
}

const TOPIC_TITLES: Record<ProductHelpTopic, string> = {
  size: "איך בוחרים מידה?",
  carat: "מה אומר משקל הקראט?",
  metal: "איזה גוון זהב לבחור?",
  certificate: "מה כוללת התעודה?",
};

const ringSizes = Array.from({ length: 18 }, (_, index) => {
  const israel = index + 7;
  const circumference = israel + 40;
  return {
    israel,
    circumference,
    diameter: (circumference / Math.PI).toFixed(1),
  };
});

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden>
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function HelpContent({ topic, product }: { topic: ProductHelpTopic; product: Product }) {
  if (topic === "size") {
    return (
      <>
        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h3 className="font-display text-xl font-medium">לפי טבעת קיימת</h3>
            <p className="mt-2 text-sm leading-7 text-stone">
              הניחו טבעת שמתאימה לאותה אצבע על סרגל ומדדו את הקוטר הפנימי, מקצה פנימי לקצה פנימי.
            </p>
          </section>
          <section>
            <h3 className="font-display text-xl font-medium">לפי היקף האצבע</h3>
            <p className="mt-2 text-sm leading-7 text-stone">
              כרכו פס נייר דק סביב בסיס האצבע, סמנו את נקודת המפגש ומדדו את האורך במילימטרים בלי למתוח.
            </p>
          </section>
        </div>
        <div className="mt-7 overflow-x-auto border-y border-line">
          <table className="w-full min-w-[30rem] border-collapse text-center text-sm">
            <thead className="text-[0.68rem] font-semibold text-stone">
              <tr>
                <th className="px-3 py-3">מידה ישראלית</th>
                <th className="px-3 py-3">היקף במ״מ</th>
                <th className="px-3 py-3">קוטר פנימי במ״מ</th>
              </tr>
            </thead>
            <tbody>
              {ringSizes.map((size) => (
                <tr key={size.israel} className="border-t border-line/70">
                  <td className="px-3 py-2.5 font-medium">{size.israel}</td>
                  <td className="px-3 py-2.5">{size.circumference}</td>
                  <td className="px-3 py-2.5">{size.diameter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-6 text-stone">
          המדידה הביתית היא הערכה. לפני הייצור נאשר יחד את המידה הסופית.
        </p>
      </>
    );
  }

  if (topic === "carat") {
    return (
      <div className="space-y-5 text-sm leading-7 text-stone">
        <p>
          קראט הוא יחידת משקל של היהלום, לא מדידה של הקוטר שלו. שתי אבנים באותו משקל עשויות להיראות שונות בגודל בהתאם לצורת החיתוך ולפרופורציות.
        </p>
        <p>
          בבחירה אנחנו בוחנים יחד את המראה מלמעלה, איכות החיתוך והאיזון עם מבנה התכשיט, ולא רק את המספר.
        </p>
      </div>
    );
  }

  if (topic === "metal") {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <span className="block h-5 w-5 rounded-full border border-black/10 bg-[#c9a35e]" aria-hidden />
          <h3 className="mt-3 font-display text-xl font-medium">זהב צהוב</h3>
          <p className="mt-2 text-sm leading-7 text-stone">גוון חם שמדגיש את הניגוד מול היהלום ומתאים למראה קלאסי.</p>
        </section>
        <section>
          <span className="block h-5 w-5 rounded-full border border-black/10 bg-[#c4c8cd]" aria-hidden />
          <h3 className="mt-3 font-display text-xl font-medium">זהב לבן</h3>
          <p className="mt-2 text-sm leading-7 text-stone">גוון קריר ורציף שמתחבר חזותית ללובן היהלום.</p>
        </section>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm leading-7 text-stone">
        התכשיט מגיע עם תעודה גמולוגית המתייחסת ליהלום שנבחר בפועל. במוצר זה מפרט הייחוס הוא:
      </p>
      <dl className="mt-6 grid grid-cols-2 border-y border-line">
        {[
          ["תעודה", product.specs.cert],
          ["צבע", product.specs.color],
          ["ניקיון", product.specs.clarity],
          ["ליטוש", product.specs.cut],
        ].map(([label, value]) => (
          <div key={label} className="border-b border-line px-3 py-4 odd:border-l last:border-b-0 [&:nth-last-child(2)]:border-b-0">
            <dt className="text-[0.68rem] font-semibold text-stone">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-ink" dir="ltr">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-6 text-stone">הנתונים הסופיים מאושרים מולכם לפני ההזמנה.</p>
    </div>
  );
}

export default function ProductHelpSheet({ topic, onClose, product }: ProductHelpSheetProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!topic) return;
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
  }, [onClose, topic]);

  if (!mounted || !topic) return null;

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
        aria-labelledby="product-help-title"
        className="flex max-h-[82svh] w-full flex-col bg-ivory sm:max-w-xl sm:border sm:border-line"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4 sm:px-7">
          <h2 id="product-help-title" className="font-display text-2xl font-medium text-ink">{TOPIC_TITLES[topic]}</h2>
          <button ref={closeRef} type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center border border-line bg-white text-ink" aria-label="סגירת החלון">
            <CloseGlyph />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
          <HelpContent topic={topic} product={product} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
