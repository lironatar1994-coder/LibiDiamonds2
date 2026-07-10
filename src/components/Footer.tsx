import Link from "next/link";
import { site, waLink, defaultWaMessage } from "@/lib/site";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="footer-warm border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="text-center sm:text-right">
            <BrandLogo size="footer" className="mx-auto items-center sm:mx-0 sm:items-start" />
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-stone sm:mx-0">
              תכשיטי יהלומי מעבדה בזהב 14K/18K, עם תעודה גמולוגית וליווי אישי.
            </p>
            <div className="mt-5 flex justify-center gap-4 sm:justify-start">
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

          <div className="border-t border-line pt-6 sm:border-0 sm:pt-0">
            <h3 className="text-sm font-semibold tracking-wider">הקולקציה</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-stone sm:block sm:space-y-2.5">
              <li><Link className="hover:text-gold" href="/jewelry/rings">טבעות</Link></li>
              <li><Link className="hover:text-gold" href="/jewelry/earrings">עגילים</Link></li>
              <li><Link className="hover:text-gold" href="/jewelry/necklaces">שרשראות</Link></li>
              <li><Link className="hover:text-gold" href="/jewelry/bracelets">צמידים</Link></li>
            </ul>
          </div>

          <div className="border-t border-line pt-6 sm:border-0 sm:pt-0">
            <h3 className="text-sm font-semibold tracking-wider">מידע</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-stone sm:block sm:space-y-2.5">
              <li><Link className="hover:text-gold" href="/journal">LIBI Journal</Link></li>
              <li><Link className="hover:text-gold" href="/about">הסיפור שלנו</Link></li>
              <li><Link className="hover:text-gold" href="/service">משלוחים, אחריות והחזרות</Link></li>
              <li><Link className="hover:text-gold" href="/contact">צור קשר</Link></li>
            </ul>
          </div>

          <div className="border-t border-line pt-6 sm:border-0 sm:pt-0">
            <h3 className="text-sm font-semibold tracking-wider">נשמח לדבר</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li>
                <a className="hover:text-gold" href={waLink(defaultWaMessage)} target="_blank" rel="noopener noreferrer">
                  ייעוץ אישי בוואטסאפ: {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a className="hover:text-gold" href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li className="pt-1 text-xs leading-relaxed">
                א׳–ה׳ 9:00–19:00 · ו׳ 9:00–13:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-center text-xs text-stone lg:mt-12">
          <p>© {new Date().getFullYear()} {site.name} · כל הזכויות שמורות</p>
        </div>
      </div>
    </footer>
  );
}
