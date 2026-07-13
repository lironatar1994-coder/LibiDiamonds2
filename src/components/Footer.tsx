import Link from "next/link";
import { site, waLink, defaultWaMessage } from "@/lib/site";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons";
import BrandLogo from "@/components/BrandLogo";

const collectionLinks = [
  { href: "/jewelry/rings", label: "טבעות" },
  { href: "/jewelry/earrings", label: "עגילים" },
  { href: "/jewelry/necklaces", label: "שרשראות" },
  { href: "/jewelry/bracelets", label: "צמידים" },
];

const informationLinks = [
  { href: "/about", label: "הסיפור שלנו" },
  { href: "/journal", label: "מדריכים" },
  { href: "/service", label: "משלוחים, אחריות והחזרות" },
  { href: "/contact", label: "צור קשר" },
];

export default function Footer() {
  return (
    <footer className="footer-warm border-t border-line">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <BrandLogo size="footer" className="footer-logo-centered mx-auto" />
          <p className="mx-auto mt-4 hidden max-w-[18rem] text-sm leading-relaxed text-stone sm:block">
            יהלומי מעבדה בזהב 14K/18K. בחירה אישית, תעודה ואחריות.
          </p>
          <div className="mt-2.5 flex justify-center gap-5 sm:mt-5">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="אינסטגרם"
              className="text-stone transition-colors hover:text-gold"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={waLink(defaultWaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="וואטסאפ"
              className="text-stone transition-colors hover:text-gold"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-8 border-t border-line pt-5 sm:mt-9 sm:gap-x-16 sm:pt-7 lg:mx-auto lg:max-w-2xl">
          <nav aria-label="הקולקציה">
            <h3 className="text-sm font-semibold tracking-wider">הקולקציה</h3>
            <ul className="mt-3 space-y-2 text-sm text-stone sm:mt-4 sm:space-y-2.5">
              {collectionLinks.map((link) => (
                <li key={link.href}>
                  <Link className="hover:text-gold" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="מידע">
            <h3 className="text-sm font-semibold tracking-wider">מידע</h3>
            <ul className="mt-3 space-y-2 text-sm text-stone sm:mt-4 sm:space-y-2.5">
              {informationLinks.map((link) => (
                <li key={link.href}>
                  <Link className="hover:text-gold" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line pt-5 text-sm text-ink-soft sm:mt-8 sm:pt-6">
          <a
            className="inline-flex items-center gap-2 transition-colors hover:text-gold"
            href={waLink(defaultWaMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span>ייעוץ בוואטסאפ</span>
            <span dir="ltr" className="text-stone">{site.phoneDisplay}</span>
          </a>
          <span className="hidden h-1 w-1 rotate-45 bg-gold/60 sm:block" aria-hidden />
          <a className="transition-colors hover:text-gold" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>

        <div className="mt-5 border-t border-line pt-4 text-center text-[0.68rem] text-stone sm:mt-7 sm:pt-5 sm:text-xs">
          <p>© {new Date().getFullYear()} {site.name} · כל הזכויות שמורות</p>
        </div>
      </div>
    </footer>
  );
}
