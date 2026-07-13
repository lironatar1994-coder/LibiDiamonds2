import type { Metadata } from "next";
import { waLink, defaultWaMessage } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "משלוחים, אחריות והחזרות",
  description:
    "כל פרטי השירות של LIBI DIAMONDS: משלוח מבוטח, אחריות מלאה, תעודות גמולוגיות ומדיניות החזרות הוגנת.",
  path: "/service",
});

const sections = [
  {
    title: "משלוחים",
    items: [
      "משלוח מבוטח עד הבית בכל רחבי הארץ, באריזת מתנה מוקפדת.",
      "פריטים מהקולקציה נשלחים תוך 7–14 ימי עסקים.",
      "פריטים בהתאמה אישית (מידה מיוחדת, אבן לפי בקשה, עיצוב אישי) — 3–4 שבועות.",
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
      "התאמת מידה ראשונה לטבעת — ללא עלות.",
      "ניקוי והברקה של התכשיט — כלולים לכל החיים, בתיאום מראש.",
    ],
  },
  {
    title: "החזרות והחלפות",
    items: [
      "ניתן להחזיר או להחליף פריט מהקולקציה תוך 14 יום מקבלתו, במצבו המקורי ובצירוף התעודה.",
      "החזר כספי מתבצע לאמצעי התשלום המקורי, בהתאם להוראות חוק הגנת הצרכן.",
      "פריטים שיוצרו בהתאמה אישית ניתנים להחלפה בתיאום מראש בלבד.",
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
        <p className="mt-4 leading-relaxed text-stone">
          קנייה של תכשיט יהלום צריכה להרגיש בטוחה מהרגע הראשון. אלה
          ההתחייבויות שלנו אליכם.
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {sections.map((s) => (
          <section key={s.title}>
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

      <div className="mt-16 bg-cream p-8 text-center">
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
