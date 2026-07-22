import type { Metadata } from "next";
import Link from "next/link";
import BrandSignature from "@/components/BrandSignature";
import { WhatsAppIcon } from "@/components/icons";
import RingSizeCalculator from "@/components/ring-size/RingSizeCalculator";
import { ExistingRingVisual, FingerCircumferenceVisual } from "@/components/ring-size/RingSizeGuideVisuals";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "מדריך מידות לטבעות",
  description: "איך מודדים טבעת או אצבע בבית, ממירים למידה ישראלית ובוחרים את מידת הטבעת הנכונה. מדריך מאויר וטבלת מידות 7–24.",
  path: "/ring-size-guide",
});

const sizes = Array.from({ length: 18 }, (_, index) => {
  const israel = index + 7;
  const circumference = israel + 40;
  return {
    israel,
    circumference,
    diameter: (circumference / Math.PI).toFixed(1),
  };
});

const breadcrumbs = breadcrumbJsonLd([
  { name: "ראשי", path: "/" },
  { name: "מדריך מידות לטבעות", path: "/ring-size-guide" },
]);

const howTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "איך מודדים מידה לטבעת",
  description: "שתי דרכים למדידת מידת טבעת בבית: לפי טבעת קיימת או לפי היקף האצבע.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "בחרו טבעת מתאימה או פס נייר",
      text: "השתמשו בטבעת שמתאימה לאותה אצבע, או בפס נייר צר שאינו נמתח.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "מדדו במילימטרים",
      text: "מדדו את הקוטר הפנימי של הטבעת או את היקף האצבע בנקודת החפיפה.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "המירו למידה ישראלית",
      text: "השתמשו במחשבון או בטבלת המידות כדי למצוא את המידה הישראלית הקרובה.",
    },
  ],
};

export default function RingSizeGuidePage() {
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />

      <header className="mx-auto max-w-5xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:pb-20 lg:pt-24">
        <BrandSignature />
        <h1 className="mt-5 max-w-3xl font-display text-[2.65rem] font-medium leading-[1.08] text-ink sm:text-6xl">
          מדריך מידות לטבעות
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-stone sm:text-lg sm:leading-9">
          שתי מדידות פשוטות מספיקות כדי להגיע למידה מדויקת. בחרו טבעת קיימת או מדדו את היקף האצבע — תמיד במילימטרים.
        </p>
        <nav className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm" aria-label="תוכן המדריך">
          <a href="#measure" className="border-b border-gold/45 pb-1 text-ink-soft transition-colors hover:border-gold-deep hover:text-ink">איך מודדים</a>
          <a href="#calculator" className="border-b border-gold/45 pb-1 text-ink-soft transition-colors hover:border-gold-deep hover:text-ink">מציאת המידה</a>
          <a href="#size-table" className="border-b border-gold/45 pb-1 text-ink-soft transition-colors hover:border-gold-deep hover:text-ink">טבלת מידות</a>
        </nav>
      </header>

      <section id="measure" className="scroll-mt-24 border-y border-line" aria-labelledby="measure-title">
        <h2 id="measure-title" className="sr-only">איך מודדים מידה לטבעת</h2>
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <article className="border-b border-line lg:border-b-0 lg:border-l">
            <figure className="aspect-[4/3] overflow-hidden">
              <ExistingRingVisual />
            </figure>
            <div className="px-4 pb-11 pt-7 sm:px-8 sm:pb-14 lg:px-12">
              <span className="text-xs font-semibold text-gold-deep">01</span>
              <h3 className="mt-2 font-display text-3xl font-medium text-ink">לפי טבעת קיימת</h3>
              <ol className="mt-5 space-y-3 text-sm leading-7 text-ink-soft">
                <li>בחרו טבעת שמתאימה לאותה אצבע ובאותה היד.</li>
                <li>הניחו אותה על סרגל ומדדו את הקוטר הפנימי בלבד, מקצה לקצה.</li>
                <li>הזינו את הקוטר במחשבון או מצאו אותו בטבלה.</li>
              </ol>
            </div>
          </article>

          <article>
            <figure className="aspect-[4/3] overflow-hidden">
              <FingerCircumferenceVisual />
            </figure>
            <div className="px-4 pb-11 pt-7 sm:px-8 sm:pb-14 lg:px-12">
              <span className="text-xs font-semibold text-gold-deep">02</span>
              <h3 className="mt-2 font-display text-3xl font-medium text-ink">לפי היקף האצבע</h3>
              <ol className="mt-5 space-y-3 text-sm leading-7 text-ink-soft">
                <li>כרכו פס נייר צר ולא נמתח סביב בסיס האצבע.</li>
                <li>סמנו את נקודת החפיפה. הפס צריך להיות צמוד, אבל לעבור גם מעל המפרק.</li>
                <li>פתחו את הפס ומדדו את האורך במילימטרים.</li>
              </ol>
            </div>
          </article>
        </div>
      </section>

      <section id="calculator" className="scroll-mt-24 bg-platinum-soft py-12 sm:py-16 lg:py-20" aria-labelledby="calculator-title">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 id="calculator-title" className="font-display text-4xl font-medium text-ink sm:text-5xl">מצאו את המידה</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-stone">הזינו את המדידה שקיבלתם. ההמרה תוצג לפי שיטת המידות הישראלית.</p>
          <div className="mt-8 sm:mt-10">
            <RingSizeCalculator />
          </div>
        </div>
      </section>

      <section id="size-table" className="scroll-mt-24 py-12 sm:py-16 lg:py-20" aria-labelledby="size-table-title">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="size-table-title" className="font-display text-4xl font-medium text-ink sm:text-5xl">טבלת מידות</h2>
              <p className="mt-3 text-sm leading-7 text-stone">המידות <span dir="ltr">10–18</span> הן הטווח הנפוץ המוצג בבורר המהיר באתר.</p>
            </div>
            <span className="text-xs text-stone">כל המידות במילימטרים</span>
          </div>

          <div className="mt-8 overflow-hidden border-y border-line">
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="text-[0.68rem] font-semibold text-stone">
                  <th className="px-2 py-3.5 sm:px-5">מידה ישראלית</th>
                  <th className="px-2 py-3.5 sm:px-5">היקף</th>
                  <th className="px-2 py-3.5 sm:px-5">קוטר פנימי</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((size) => {
                  const common = size.israel >= 10 && size.israel <= 18;
                  return (
                    <tr key={size.israel} className={`border-t border-line/75 text-sm ${common ? "bg-ivory" : "bg-white"}`}>
                      <td className="px-2 py-3 font-display text-lg font-medium text-ink sm:px-5">{size.israel}</td>
                      <td className="px-2 py-3 text-ink-soft sm:px-5">{size.circumference}</td>
                      <td className="px-2 py-3 text-ink-soft sm:px-5">{size.diameter}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ivory py-12 sm:py-16" aria-labelledby="measure-well-title">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 id="measure-well-title" className="font-display text-3xl font-medium text-ink sm:text-4xl">לפני שמחליטים</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {[
              ["מדדו בסוף היום", "האצבעות עשויות להיות מעט רחבות יותר בערב. הימנעו ממדידה כשהיד קרה מאוד או לאחר פעילות מאומצת."],
              ["בדקו את המפרק", "הטבעת צריכה לעבור מעל המפרק בהתנגדות קלה, אך לשבת בנוחות בבסיס האצבע."],
              ["בין שתי מידות", "ברוב המקרים נעדיף את המידה הגדולה יותר, במיוחד בטבעת רחבה."],
              ["אותה אצבע, אותה יד", "המידה עשויה להשתנות בין יד ימין לשמאל וגם בין אצבעות מקבילות."],
            ].map(([title, detail]) => (
              <div key={title} className="border-t border-line pt-4">
                <dt className="font-display text-xl font-medium text-ink">{title}</dt>
                <dd className="mt-2 text-sm leading-7 text-stone">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-ink py-12 text-ivory sm:py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-7 px-4 sm:px-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-medium sm:text-4xl">עדיין לא בטוחים?</h2>
            <p className="mt-2 text-sm leading-7 text-footer-muted">שלחו לנו צילום של הטבעת על הסרגל או של פס הנייר, ונבדוק יחד לפני ההזמנה.</p>
          </div>
          <a
            href={waLink("היי, מדדתי מידה לטבעת ואשמח לעזרה בבדיקת המדידה")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[52px] items-center justify-center gap-2 border border-gold/70 px-7 text-sm font-semibold transition-colors hover:bg-ivory hover:text-ink"
          >
            <WhatsAppIcon className="h-4 w-4" />
            בדיקת מידה בוואטסאפ
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 text-sm sm:px-6">
        <Link href="/jewelry/rings" className="border-b border-gold/45 pb-1 text-ink-soft transition-colors hover:border-gold-deep hover:text-ink">
          חזרה לטבעות
        </Link>
      </div>
    </div>
  );
}
