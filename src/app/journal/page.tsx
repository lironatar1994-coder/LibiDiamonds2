import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "LIBI Journal — מדריכים ליהלומים ותכשיטים",
  description:
    "כל מה שכדאי לדעת לפני שבוחרים תכשיט יהלום: יהלומי מעבדה, 4C, טבעות אירוסין ועוד — בעברית פשוטה וברורה.",
};

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="eyebrow">LIBI Journal</p>
        <h1 className="mt-3 font-display text-4xl font-medium">
          ללמוד לפני שבוחרים
        </h1>
        <p className="mt-4 leading-relaxed text-stone">
          רכישת תכשיט יהלום היא החלטה משמעותית — והידע הופך אותה לקלה והרבה
          יותר בטוחה. כאן תמצאו את כל מה שאנחנו מסבירים ללקוחות שלנו, בכתב.
        </p>
      </header>

      <div className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-2">
        {guides.map((g) => (
          <Link key={g.slug} href={`/journal/${g.slug}`} className="group block">
            <article className="border-t-2 border-gold/60 pt-5 transition-colors group-hover:border-gold">
              <p className="text-xs tracking-wider text-stone">
                {g.readingMinutes} דקות קריאה
              </p>
              <h2 className="mt-3 font-display text-2xl leading-snug transition-colors group-hover:text-gold-deep">
                {g.title}
              </h2>
              <p className="mt-3 leading-relaxed text-stone">{g.excerpt}</p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
