import type { Metadata } from "next";
import { waLink, defaultWaMessage } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";
import { pageMetadata } from "@/lib/seo";
import { servicePromises } from "@/lib/service";
import BrandSignature from "@/components/BrandSignature";

export const metadata: Metadata = pageMetadata({
  title: "משלוחים, אחריות והחזרות",
  description:
    "כל פרטי השירות של LIBI DIAMONDS: משלוח מבוטח, אחריות מלאה, תעודות גמולוגיות ומדיניות החזרות הוגנת.",
  path: "/service",
});

const sections: Array<{ id?: string; title: string; items: string[] }> = [
  {
    title: "משלוחים",
    items: [
      `${servicePromises.insuredDelivery} בכל רחבי הארץ, באריזת מתנה מוקפדת.`,
      `פריטים מהקולקציה נשלחים תוך ${servicePromises.collectionLeadTime}.`,
      `פריטים בהתאמה אישית (מידה מיוחדת, אבן לפי בקשה, עיצוב אישי) — ${servicePromises.bespokeLeadTime}.`,
      "צריכים את התכשיט לתאריך מסוים? כתבו לנו ונעשה כל מאמץ להקדים.",
    ],
  },
  {
    title: "תעודה גמולוגית",
    items: [
      "כל יהלום מרכזי מגיע עם תעודה של מעבדה גמולוגית בינלאומית — IGI או GIA.",
      "התעודה מתעדת את משקל האבן, צבעה, ניקיונה ואיכות הליטוש, וכן את היותה יהלום מעבדה.",
      "מספר התעודה חרוט בלייזר על חגורת היהלום ברוב האבנים — לזיהוי ודאי.",
    ],
  },
  {
    title: "אחריות",
    items: [
      "אחריות יצרן מלאה על עבודת הצורפות: שיבוץ, מתכת וציפוי.",
      `${servicePromises.firstResize} לטבעת — ללא עלות.`,
      "ניקוי והברקה של התכשיט — כלולים לכל החיים, בתיאום מראש.",
    ],
  },
  {
    title: "החזרות והחלפות",
    items: [
      `ניתן להחזיר או להחליף פריט מהקולקציה תוך ${servicePromises.returnsWindow} מקבלתו, במצבו המקורי ובצירוף התעודה.`,
      "החזר כספי מתבצע לאמצעי התשלום המקורי, בהתאם להוראות חוק הגנת הצרכן.",
      "פריטים שיוצרו בהתאמה אישית ניתנים להחלפה בתיאום מראש בלבד.",
    ],
  },
  {
    id: "camera-privacy",
    title: "פרטיות בהדמיית טבעת על היד",
    items: [
      "המצלמה מופעלת רק לאחר אישור מפורש, ורק בזמן השימוש בהדמיה.",
      "הצילום, הווידאו ונקודות זיהוי היד מעובדים במכשיר ואינם נשלחים או נשמרים בשרתי LIBI.",
      "סגירת ההדמיה מפסיקה את המצלמה מיד. ניתן להשתמש גם בתמונה קיימת ללא הפעלת מצלמה חיה.",
    ],
  },
];

export default function ServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <header>
        <h1 className="font-display text-4xl font-medium">
          משלוחים, אחריות והחזרות
        </h1>
        <BrandSignature className="mt-4" />
      </header>

      <dl className="mt-8 grid grid-cols-2 bg-platinum sm:grid-cols-4">
        {[
          ["משלוח", servicePromises.insuredDelivery],
          ["זמן אספקה", servicePromises.collectionLeadTime],
          ["טבעות", servicePromises.firstResize],
          ["החזרות", `תוך ${servicePromises.returnsWindow}`],
        ].map(([label, value]) => (
          <div key={label} className="border-b border-line p-4 even:border-r sm:border-b-0 sm:border-r sm:first:border-r-0">
            <dt className="text-[0.68rem] font-semibold text-stone">{label}</dt>
            <dd className="mt-1 text-sm font-medium leading-5 text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 space-y-12">
        {sections.map((s) => (
          <section key={s.title} id={s.id} className={s.id ? "scroll-mt-28" : undefined}>
            <h2 className="font-display text-2xl font-medium">{s.title}</h2>
            <ul className="mt-4 space-y-3">
              {s.items.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-ink-soft">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-16 bg-platinum p-8 text-center">
        <h2 className="font-display text-xl">שאלה שלא מופיעה כאן?</h2>
        <a
          href={waLink(defaultWaMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-5"
        >
          <WhatsAppIcon className="h-4 w-4" />
          שאלו אותנו בוואטסאפ
        </a>
      </div>
    </div>
  );
}
