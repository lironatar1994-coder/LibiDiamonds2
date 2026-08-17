"use client";

import { useRef, useState } from "react";
import { waLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

const interests = ["טבעת אירוסין", "עגילים", "שרשרת", "צמיד", "עיצוב אישי", "אחר"];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [interest, setInterest] = useState(interests[0]);
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const message = [
    `היי, אני ${name.trim()} ואשמח לייעוץ.`,
    `מה מחפשים: ${interest}`,
    budget.trim() && `תקציב משוער: ${budget.trim()}`,
    notes.trim() && `עוד פרטים: ${notes.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");

  const fieldCls =
    "w-full min-h-11 border bg-pearl px-4 py-3 text-sm outline-none transition-colors hover:border-gilt/45 focus:border-onyx";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // The button opens WhatsApp directly, so an empty name would send us a
    // message with no one attached to it. Stop here instead.
    if (!name.trim()) {
      setNameError("נשמח לדעת עם מי אנחנו מדברים");
      nameRef.current?.focus();
      return;
    }

    setNameError(null);
    setSent(true);
    window.open(waLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
          שם
        </label>
        <input
          id="name"
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
          }}
          className={`${fieldCls} ${nameError ? "border-clay" : "border-line"}`}
          placeholder="איך קוראים לכם?"
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "name-error" : undefined}
        />
        {nameError && (
          <p id="name-error" role="alert" className="mt-1.5 text-xs leading-5 text-clay">
            {nameError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="interest" className="mb-1.5 block text-sm font-semibold">
          מה מחפשים?
        </label>
        <select
          id="interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className="select-quiet w-full text-sm"
        >
          {interests.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="budget" className="mb-1.5 block text-sm font-semibold">
          תקציב משוער <span className="font-normal text-stone">(לא חובה)</span>
        </label>
        <input
          id="budget"
          type="text"
          inputMode="numeric"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className={`${fieldCls} border-line`}
          placeholder="למשל: 5,000–8,000 ₪"
        />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold">
          מה עוד כדאי שנדע? <span className="font-normal text-stone">(לא חובה)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`${fieldCls} max-h-64 resize-y border-line leading-6`}
          placeholder="מועד, סגנון מועדף, מידה..."
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        <WhatsAppIcon className="h-4 w-4" />
        שליחה בוואטסאפ
      </button>
      <p className="text-center text-xs leading-5 text-stone" aria-live="polite">
        {sent
          ? "פתחנו לכם וואטסאפ עם ההודעה — נשאר רק לשלוח."
          : "הטופס פותח הודעת וואטסאפ מוכנה לשליחה."}
      </p>
    </form>
  );
}
