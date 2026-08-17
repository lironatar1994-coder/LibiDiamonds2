"use client";

import { useMemo, useState } from "react";

type MeasurementMode = "circumference" | "diameter";

interface SizeResult {
  israel: number;
  circumference: number;
  diameter: number;
}

/* "empty" and "out of range" used to return the same null, so typing a US size
   or a centimetre value left the panel showing the prompt as if nothing had
   been entered. They are distinct states now. */
type SizeOutcome =
  | { state: "empty" }
  | { state: "out-of-range" }
  | { state: "ok"; size: SizeResult };

function nearestSize(mode: MeasurementMode, rawValue: string): SizeOutcome {
  const measurement = Number.parseFloat(rawValue.replace(",", "."));
  if (!Number.isFinite(measurement)) return { state: "empty" };

  const circumference = mode === "circumference" ? measurement : measurement * Math.PI;
  const israel = Math.round(circumference - 40);
  if (israel < 7 || israel > 24) return { state: "out-of-range" };

  const standardizedCircumference = israel + 40;
  return {
    state: "ok",
    size: {
      israel,
      circumference: standardizedCircumference,
      diameter: standardizedCircumference / Math.PI,
    },
  };
}

export default function RingSizeCalculator() {
  const [mode, setMode] = useState<MeasurementMode>("circumference");
  const [measurement, setMeasurement] = useState("");
  const result = useMemo(() => nearestSize(mode, measurement), [measurement, mode]);

  const changeMode = (nextMode: MeasurementMode) => {
    setMode(nextMode);
    setMeasurement("");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(18rem,0.62fr)] lg:items-end lg:gap-14">
      <div>
        <div className="grid grid-cols-2 border-b border-line" role="group" aria-label="שיטת חישוב המידה">
          <button
            type="button"
            onClick={() => changeMode("circumference")}
            aria-pressed={mode === "circumference"}
            className={`relative min-h-12 px-3 text-sm transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px ${
              mode === "circumference" ? "text-ink after:bg-gilt-deep" : "text-stone after:bg-transparent hover:text-ink"
            }`}
          >
            מדדתי היקף אצבע
          </button>
          <button
            type="button"
            onClick={() => changeMode("diameter")}
            aria-pressed={mode === "diameter"}
            className={`relative min-h-12 px-3 text-sm transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px ${
              mode === "diameter" ? "text-ink after:bg-gilt-deep" : "text-stone after:bg-transparent hover:text-ink"
            }`}
          >
            מדדתי טבעת קיימת
          </button>
        </div>

        <label className="mt-6 block">
          <span className="text-xs font-semibold text-stone">
            {mode === "circumference" ? "היקף האצבע במ״מ" : "הקוטר הפנימי במ״מ"}
          </span>
          <span className="mt-2 flex items-end border-b border-ink pb-2">
            <input
              type="text"
              inputMode="decimal"
              value={measurement}
              onChange={(event) => setMeasurement(event.target.value.replace(/[^0-9.,]/g, ""))}
              placeholder={mode === "circumference" ? "לדוגמה: 54" : "לדוגמה: 17.2"}
              className="min-w-0 flex-1 bg-transparent font-display text-3xl font-light text-ink outline-none placeholder:text-stone/70"
              aria-describedby="ring-calculator-note"
            />
            <span className="pb-1 text-xs text-stone">מ״מ</span>
          </span>
        </label>
        <p id="ring-calculator-note" className="mt-2 text-xs leading-5 text-stone">
          התוצאה מעוגלת למידה הישראלית הקרובה ביותר.
        </p>
      </div>

      {/* One min-height for all three states so the panel never jumps. */}
      <div className="flex min-h-[10.5rem] flex-col justify-center border-y border-line py-5" aria-live="polite">
        {result.state === "ok" ? (
          <>
            <span className="eyebrow text-stone">המידה הקרובה</span>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="tabular font-display text-5xl font-light leading-none text-ink">{result.size.israel}</strong>
              <span className="text-sm text-ink-soft">ישראלית</span>
            </div>
            <p className="tabular mt-4 text-xs text-stone">
              היקף {result.size.circumference} מ״מ · קוטר {result.size.diameter.toFixed(1)} מ״מ
            </p>
          </>
        ) : result.state === "out-of-range" ? (
          <p className="max-w-xs text-sm leading-7 text-clay">
            המדידה מחוץ לטווח המידות שלנו.{" "}
            {mode === "circumference"
              ? "הזינו היקף בין 47 ל־64 מ״מ."
              : "הזינו קוטר בין 15 ל־20.4 מ״מ."}
          </p>
        ) : (
          <p className="max-w-xs text-sm leading-7 text-stone">
            הזינו את המדידה ונציג כאן את המידה הישראלית המתאימה.
          </p>
        )}
      </div>
    </div>
  );
}
