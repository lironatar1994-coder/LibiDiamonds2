import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, guides } from "@/data/guides";
import { waLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.excerpt };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const more = guides.filter((g) => g.slug !== guide.slug).slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <nav className="text-xs text-stone" aria-label="פירורי לחם">
        <Link href="/" className="hover:text-gold">ראשי</Link>
        <span className="mx-2">/</span>
        <Link href="/journal" className="hover:text-gold">LIBI Journal</Link>
      </nav>

      <article>
        <header className="mt-8">
          <p className="eyebrow">{guide.readingMinutes} דקות קריאה</p>
          <h1 className="mt-4 font-display text-3xl font-medium leading-snug sm:text-4xl">
            {guide.title}
          </h1>
        </header>

        <div className="mt-10 space-y-8">
          {guide.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="mb-3 font-display text-2xl font-medium">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p key={j} className="mb-4 leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>

      <aside className="mt-14 bg-cream p-8 text-center">
        <h2 className="font-display text-2xl">נשארו שאלות?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone">
          נשמח להסביר, להשוות אבנים אמיתיות עם תעודות, ולעזור לכם לבחור נכון —
          בלי לחץ.
        </p>
        <a
          href={waLink(`היי, קראתי את המדריך "${guide.title}" ויש לי שאלה`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-6"
        >
          <WhatsAppIcon className="h-4 w-4" />
          שאלו אותנו בוואטסאפ
        </a>
      </aside>

      {more.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-display text-2xl">מדריכים נוספים</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            {more.map((g) => (
              <Link key={g.slug} href={`/journal/${g.slug}`} className="group block">
                <h3 className="font-display text-lg leading-snug transition-colors group-hover:text-gold-deep">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{g.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
