import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons";
import BrandSignature from "@/components/BrandSignature";
import { assetPath, defaultWaMessage, waLink } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "הסיפור של LIBI",
  description:
    "כך נבחרים התכשיטים של LIBI DIAMONDS: בדיקת נתוני היהלום, התאמת הזהב והמידה ואישור ברור לפני תחילת העבודה.",
  path: "/about",
  image: "/images/trust/v1/libi-packaging-mockup.webp",
  imageAlt: "הדמיה של אריזת LIBI DIAMONDS",
});

const process = [
  {
    title: "נתוני האבן",
    text: "בוחנים קראט, צבע, ניקיון וליטוש לצד הקוטר והמראה של האבן בפועל.",
  },
  {
    title: "התאמה לתכשיט",
    text: "מתאימים יחד את האבן, גוון הזהב והמידה כדי לשמור על פרופורציה נכונה.",
  },
  {
    title: "אישור לפני עבודה",
    text: "מאשרים אבן, זהב, מידה, מחיר ומועד אספקה לפני תחילת העבודה.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.86fr_1.14fr] lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <h1 className="font-display text-4xl font-medium leading-[1.12] sm:text-5xl lg:text-6xl">
              בחירה מדויקת,
              <br />
              מהאבן ועד השיבוץ.
            </h1>
            <BrandSignature className="mt-5" />
            <p className="mt-5 max-w-lg text-base leading-8 text-stone sm:text-lg">
              LIBI DIAMONDS מתמקדת בתכשיטי יהלומי מעבדה בזהב 14K ו־18K. אנחנו בוחנים יחד את מראה האבן, מבנה התכשיט והתקציב, ומאשרים כל פרט לפני תחילת העבודה.
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
              <Image
                src={assetPath("/images/trust/v1/libi-packaging-mockup.webp")}
                alt="הדמיה של אריזת LIBI DIAMONDS בגוון שנהב"
                fill
                priority
                sizes="(min-width: 1024px) 56vw, 100vw"
                className="object-cover"
              />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
        <h2 className="font-display text-3xl font-medium sm:text-4xl">כך הבחירה נסגרת.</h2>
        <div className="mt-8 grid border-t border-line sm:grid-cols-3 lg:mt-10">
          {process.map((item, index) => (
            <article key={item.title} className="border-b border-line py-7 sm:border-b-0 sm:border-l sm:px-7 sm:first:pr-0 sm:last:border-l-0 lg:px-10">
              <span className="font-display text-sm text-gold-deep" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-2xl font-medium">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone sm:text-base">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-platinum px-4 py-10 text-center text-ink sm:px-6 lg:py-14">
        <h2 className="font-display text-3xl font-medium sm:text-4xl">מתחילים מהתכשיט שאתם מחפשים.</h2>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={waLink(defaultWaMessage)} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <WhatsAppIcon className="h-4 w-4" />
            ייעוץ אישי בוואטסאפ
          </a>
          <Link href="/jewelry/rings" className="btn-outline">לקולקציה</Link>
        </div>
      </section>
    </>
  );
}
