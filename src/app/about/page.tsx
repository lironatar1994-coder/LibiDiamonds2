import type { Metadata } from "next";
import Link from "next/link";
import { HeroDiamond } from "@/components/JewelryArt";
import { waLink, defaultWaMessage } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "הסיפור שלנו",
  description:
    "LIBI DIAMONDS — תכשיטי יהלומי מעבדה בעיצוב אלגנטי ומדויק. הכירו את הערכים שמנחים אותנו: שקיפות, איכות בלי פשרות וליווי אישי.",
};

const values = [
  {
    t: "שקיפות מלאה",
    d: "כל אבן מרכזית מגיעה עם תעודה גמולוגית בינלאומית, וכל נתון — משקל, צבע, ניקיון וליטוש — כתוב שחור על גבי לבן. אין אותיות קטנות.",
  },
  {
    t: "איכות בלי פשרות",
    d: "אנחנו עובדים רק עם יהלומי מעבדה בליטוש Excellent ובדרגות צבע וניקיון גבוהות, משובצים בעבודת יד בזהב אמיתי 14K או 18K.",
  },
  {
    t: "ליווי אישי",
    d: "תכשיט יהלום לא קונים כל יום. לכן כל לקוח מקבל ליווי אישי — בוואטסאפ או בפגישה — עד שהבחירה מרגישה מדויקת לגמרי.",
  },
  {
    t: "מחיר הוגן",
    d: "יהלומי מעבדה מאפשרים לנו להציע יותר יהלום על כל שקל — בלי מתווכים מיותרים ובלי פרמיית מותג מנופחת.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-[linear-gradient(165deg,#f8f4ea_0%,#f2e9d6_60%,#e9dcc0_100%)]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow">הסיפור שלנו</p>
            <h1 className="mt-4 font-display text-4xl font-medium leading-snug sm:text-5xl">
              יהלום מושלם.
              <br />
              בהישג יד.
            </h1>
            <p className="mt-6 max-w-lg leading-relaxed text-stone">
              LIBI DIAMONDS נולדה מתוך אמונה פשוטה: הרגעים הגדולים של החיים
              ראויים לתכשיט מושלם — ותכשיט מושלם לא חייב להיות רחוק מהישג יד.
            </p>
          </div>
          <HeroDiamond className="mx-auto hidden w-full max-w-md opacity-90 lg:block" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-5 leading-relaxed text-ink-soft">
          <p>
            במשך עשורים, יהלום גדול ואיכותי היה סמל שמור למעטים. המהפכה של
            יהלומי המעבדה שינתה את זה: היום אפשר לענוד יהלום אמיתי לכל דבר —
            זהה כימית, פיזית ואופטית ליהלום מכרה — במחיר שמאפשר לבחור אבן
            גדולה, נקייה ובהירה יותר.
          </p>
          <p>
            אנחנו ב־LIBI בחרנו לעמוד בצד הזה של ההיסטוריה. כל תכשיט שלנו נולד
            מעיצוב נקי ומוקפד, יהלומי מעבדה נבחרים עם תעודה גמולוגית, ועבודת
            צורפות מדויקת בזהב אמיתי. בלי רעש, בלי מבצעים צעקניים — רק יופי
            שקט שנשאר לתמיד.
          </p>
          <p>
            ומעל הכל — שירות. אנחנו מלווים כל לקוח ולקוחה באופן אישי: עוזרים
            להבין את נתוני האבן, משווים אפשרויות אמיתיות, ומוודאים שהבחירה
            מרגישה נכונה. כי בסוף, תכשיט הוא לא מוצר. הוא רגע.
          </p>
        </div>
      </section>

      <section className="bg-cream/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-medium">
            מה מנחה אותנו
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.t} className="border-t-2 border-gold/60 pt-5">
                <h3 className="font-display text-xl">{v.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-display text-3xl font-medium">בואו נכיר</h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-stone">
          יש לכם רגע גדול באופק? נשמח להיות חלק ממנו.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={waLink(defaultWaMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <WhatsAppIcon className="h-4 w-4" />
            דברו איתנו
          </a>
          <Link href="/jewelry/rings" className="btn-outline">
            לקולקציה
          </Link>
        </div>
      </section>
    </>
  );
}
