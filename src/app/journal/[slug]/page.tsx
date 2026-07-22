import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, guides } from "@/data/guides";
import { absoluteUrl, assetPath, site, waLink } from "@/lib/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
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
  const baseMetadata = pageMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/journal/${guide.slug}`,
    image: guide.cover.src,
    imageAlt: guide.cover.alt,
    type: "article",
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "article",
      publishedTime: guide.date,
      modifiedTime: guide.updated ?? guide.date,
      authors: [site.name],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const more = guide.relatedGuideSlugs?.length
    ? guides.filter((candidate) => guide.relatedGuideSlugs?.includes(candidate.slug))
    : guides.filter((candidate) => candidate.slug !== guide.slug).slice(0, 2);
  const articleUrl = absoluteUrl(`/journal/${guide.slug}`);
  const breadcrumb = breadcrumbJsonLd([
    { name: "ראשי", path: "/" },
    { name: "LIBI Journal", path: "/journal" },
    { name: guide.title, path: `/journal/${guide.slug}` },
  ]);
  const updatedLabel = guide.updated
    ? new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(`${guide.updated}T00:00:00`),
      )
    : null;
  const tocSections = guide.sections.filter((section) => section.heading);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${articleUrl}#article`,
    headline: guide.title,
    description: guide.excerpt,
    url: articleUrl,
    image: absoluteUrl(guide.cover.src),
    datePublished: guide.date,
    dateModified: guide.updated ?? guide.date,
    mainEntityOfPage: articleUrl,
    inLanguage: "he-IL",
    author: { "@id": `${site.domain}/#organization` },
    publisher: {
      "@id": `${site.domain}/#organization`,
      "@type": "Organization",
      name: site.name,
      url: site.domain,
      logo: { "@type": "ImageObject", url: absoluteUrl(site.logo) },
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <nav className="text-xs text-stone" aria-label="פירורי לחם">
        <Link href="/" className="hover:text-gold-deep">ראשי</Link>
        <span className="mx-2">/</span>
        <Link href="/journal" className="hover:text-gold-deep">LIBI Journal</Link>
      </nav>

      <article>
        <header className="mt-8">
          <p className="eyebrow">
            {guide.readingMinutes} דקות קריאה
            {updatedLabel && ` · עודכן ${updatedLabel}`}
          </p>
          <h1 className="mt-4 font-display text-3xl font-medium leading-snug sm:text-4xl">
            {guide.title}
          </h1>
        </header>

        <div className="relative mt-8 aspect-[3/2] overflow-hidden bg-warm-stone sm:mt-10">
          <Image
            src={assetPath(guide.cover.src)}
            alt={guide.cover.alt}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        {tocSections.length > 0 && (
          <details className="group mt-8 border-y border-line bg-platinum-soft/45 px-4 sm:px-6">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-ink marker:content-none">
              <span>במדריך הזה</span>
              <span className="text-lg font-light text-gold-deep transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <nav className="border-t border-line/70 pb-5 pt-4" aria-label="תוכן המדריך">
              <ol className="grid gap-x-8 gap-y-3 text-sm leading-6 text-ink-soft sm:grid-cols-2">
                {tocSections.map((section, index) => (
                  <li key={section.id} className="flex gap-3">
                    <span className="shrink-0 font-display text-xs text-gold-deep" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                    <a href={`#${section.id}`} className="border-b border-transparent transition-colors hover:border-gold/60 hover:text-ink">
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>
        )}

        <div className="mt-10 space-y-8">
          {guide.sections.map((section, i) => (
            <Fragment key={section.id}>
            <section id={section.heading ? section.id : undefined} className={section.heading ? "scroll-mt-24" : undefined}>
              {i === (guide.comparisonAfterSection ?? 1) && guide.comparison && (
                <div className="mb-10 border-y border-line py-6 sm:py-7">
                  <h2 className="font-display text-2xl font-medium">{guide.comparison.heading}</h2>
                  <div className="mt-5 divide-y divide-line/70 border-y border-line sm:hidden">
                    {guide.comparison.rows.map((row) => (
                      <div key={row[0]} className="py-4">
                        <p className="text-sm font-semibold text-ink">{row[0]}</p>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-xs leading-5 text-ink-soft">
                          <p>
                            <span className="block text-stone">{guide.comparison!.columns[1]}</span>
                            {row[1]}
                          </p>
                          <p>
                            <span className="block text-stone">{guide.comparison!.columns[2]}</span>
                            {row[2]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <table className="mt-5 hidden w-full text-right text-sm sm:table">
                    <thead className="border-b border-line text-xs font-semibold tracking-[0.06em] text-stone">
                      <tr>
                        {guide.comparison.columns.map((column) => (
                          <th key={column} className="px-3 py-3 first:pr-0 last:pl-0">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/70 text-ink-soft">
                      {guide.comparison.rows.map((row) => (
                        <tr key={row[0]}>
                          {row.map((value, index) => (
                            <td key={`${row[0]}-${index}`} className={`px-3 py-3.5 leading-6 ${index === 0 ? "font-semibold text-ink" : ""}`}>
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              {section.steps && section.steps.length > 0 && (
                <ol className="mt-5 divide-y divide-line border-y border-line">
                  {section.steps.map((step, index) => (
                    <li key={step} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:py-5">
                      <span className="pt-0.5 font-display text-sm text-gold-deep" aria-hidden>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-7 text-ink-soft">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
            {guide.commerceBridge && i === guide.commerceBridge.afterSection && (
              <aside className="border-y border-line bg-platinum-soft/45 px-5 py-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-7" aria-label="המשך לקולקציה">
                <p className="font-display text-xl font-medium leading-snug text-ink">{guide.commerceBridge.title}</p>
                <Link href={guide.commerceBridge.href} className="mt-4 inline-flex min-h-11 shrink-0 items-center border-b border-gilt/65 text-sm font-semibold text-ink-soft transition-colors hover:border-gilt hover:text-ink sm:mt-0">
                  {guide.commerceBridge.label} <span className="mr-2" aria-hidden>←</span>
                </Link>
              </aside>
            )}
            </Fragment>
          ))}
        </div>
      </article>

      {guide.sources && guide.sources.length > 0 && (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="font-display text-2xl font-medium">מקורות והמשך קריאה</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone">
            {guide.sources.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-gold/55 pb-0.5 text-ink-soft hover:border-gold hover:text-ink"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

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
                <div className="relative mb-4 aspect-[3/2] overflow-hidden bg-warm-stone">
                  <Image
                    src={assetPath(g.cover.src)}
                    alt={g.cover.alt}
                    fill
                    sizes="(min-width: 640px) 360px, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <h3 className="font-display text-lg leading-snug transition-colors group-hover:text-gold-deep">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{g.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </div>
  );
}
