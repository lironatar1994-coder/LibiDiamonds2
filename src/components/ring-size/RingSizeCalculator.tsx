"use client";

import { useMemo, useState } from "react";

type MeasurementMode = "circumference" | "diameter";

interface SizeResult {
  israel: number;
  circumference: number;
  diameter: number;
}

function nearestSize(mode: MeasurementMode, rawValue: string): SizeResult | null {
  const measurement = Number.parseFloat(rawValue.replace(",", "."));
  if (!Number.isFinite(measurement)) return null;

  const circumference = mode === "circumference" ? measurement : measurement * Math.PI;
  const israel = Math.round(circumference - 40);
  if (israel < 7 || israel > 24) return null;

  const standardizedCircumference = israel + 40;
  return {
    israel,
    circumference: standardizedCircumference,
    diameter: standardizedCircumference / Math.PI,
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
            className={`relative min-h-12 px-3 text-sm transition-colors after:absolute after:inset-x-5 after:bottom-0 after:h-px ${
              mode === "circumference" ? "text-ink after:bg-gold-deep" : "text-stone after:bg-transparent hover:text-ink"
            }`}
          >
            מדדתי היקף אצבע
          </button>
          <button
            type="button"
            onClick={() => changeMode("diameter")}
            aria-pressed={mode === "diameter"}
            className={`relative min-h-12 px-3 text-sm transition-colors after:absolute after:inset-x-5 after:bottom-0 after:h-px ${
              mode === "diameter" ? "text-ink after:bg-gold-deep" : "text-stone after:bg-transparent hover:text-ink"
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
              className="min-w-0 flex-1 bg-transparent font-display text-3xl font-light text-ink outline-none placeholder:text-stone/45"
              aria-describedby="ring-calculator-note"
            />
            <span className="pb-1 text-xs text-stone">מ״מ</span>
          </span>
        </label>
        <p id="ring-calculator-note" className="mt-2 text-[0.68rem] leading-5 text-stone">
          התוצאה מעוגלת למידה הישראלית הקרובה ביותר.
        </p>
      </div>

      <div className="min-h-[10.5rem] border-y border-line py-5" aria-live="polite">
        {result ? (
          <>
            <span className="text-[0.65rem] font-semibold text-stone">המידה הקרובה</span>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="font-display text-5xl font-light leading-none text-ink">{result.israel}</strong>
              <span className="text-sm text-ink-soft">ישראלית</span>
            </div>
            <p className="mt-4 text-xs text-stone">
              היקף {result.circumference} מ״מ · קוטר {result.diameter.toFixed(1)} מ״מ
            </p>
          </>
        ) : (
          <div className="flex min-h-[7.5rem] items-center">
            <p className="max-w-xs text-sm leading-7 text-stone">
              הזינו את המדידה ונציג כאן את המידה הישראלית המתאימה.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
