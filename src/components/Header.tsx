"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site, waLink, defaultWaMessage } from "@/lib/site";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons";
import BrandLogo from "@/components/BrandLogo";

const collectionNav = [
  { href: "/jewelry/rings", label: "טבעות" },
  { href: "/jewelry/earrings", label: "עגילים" },
  { href: "/jewelry/necklaces", label: "שרשראות" },
  { href: "/jewelry/bracelets", label: "צמידים" },
];

const brandNav = [
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צור קשר" },
];

const navItems = [...collectionNav, ...brandNav];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [homeHeroPassed, setHomeHeroPassed] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setHomeHeroPassed(false);
      return;
    }

    const heroBrand = document.querySelector<HTMLElement>("[data-home-hero-brand]");
    if (!heroBrand) {
      setHomeHeroPassed(true);
      return;
    }

    const syncPosition = () => {
      setHomeHeroPassed(heroBrand.getBoundingClientRect().bottom <= 0);
    };

    syncPosition();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHomeHeroPassed(false);
      } else if (entry.boundingClientRect.bottom <= 0) {
        setHomeHeroPassed(true);
      }
    });
    observer.observe(heroBrand);

    return () => observer.disconnect();
  }, [isHome]);

  // lock page scroll while the full-screen menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);
  const headerVisible = !isHome || homeHeroPassed || open;

  return (
    <>
      {/* single-row maison header */}
      <header
        aria-hidden={isHome && !headerVisible ? true : undefined}
        className={`site-header-ivory z-50 border-b backdrop-blur-sm ${
          isHome
            ? `site-header-home fixed inset-x-0 top-0 ${headerVisible ? "site-header-home-visible" : "site-header-home-hidden"}`
            : "sticky top-0"
        }`}
      >
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:h-auto sm:px-6 sm:py-3 lg:px-8 lg:py-4">
          {/* start (right in RTL): collections nav / mobile burger */}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="-ms-2 flex h-11 w-11 items-center justify-center lg:hidden"
              aria-label="פתיחת תפריט"
              aria-expanded={open}
            >
              <svg width="23" height="23" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.55">
                <path d="M3 6h16M3 11h16M3 16h16" />
              </svg>
            </button>
            <nav className="hidden lg:block" aria-label="קולקציה">
              <ul className="flex items-center gap-8">
                {collectionNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="nav-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <BrandLogo />

          {/* end (left in RTL): brand nav + whatsapp */}
          <div className="flex items-center justify-end gap-8">
            <nav className="hidden lg:block" aria-label="מותג">
              <ul className="flex items-center gap-8">
                {brandNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="nav-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <a
              href={waLink(defaultWaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="-me-2 flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-gold-deep"
              aria-label={`בדיקת זמינות ומחיר בוואטסאפ עם ${site.name}`}
              title="בדיקת זמינות ומחיר בוואטסאפ"
            >
              <WhatsAppIcon className="h-[1.35rem] w-[1.35rem]" />
            </a>
          </div>
        </div>
      </header>

      {/* full-screen mobile menu */}
      {open && (
        <div className="site-menu-ivory fixed inset-0 z-[60] flex flex-col lg:hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <button
              type="button"
              onClick={close}
              className="-ms-2 flex h-11 w-11 items-center justify-center"
              aria-label="סגירת תפריט"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l14 14M18 4L4 18" />
              </svg>
            </button>
            <BrandLogo onClick={close} />
            <span className="h-11 w-11" aria-hidden />
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-8" aria-label="ניווט ראשי">
            <ul>
              {navItems.map((item, i) => (
                <li
                  key={item.href}
                  className="menu-item border-b border-line/60 last:border-0"
                  style={{ animationDelay: `${80 + i * 55}ms` }}
                >
                  <Link
                    href={item.href}
                    onClick={close}
                    className="font-display block py-4 text-3xl font-medium text-ink transition-colors active:text-gold-deep"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className="menu-item border-t border-line px-6 pb-8 pt-6"
            style={{ animationDelay: `${80 + navItems.length * 55}ms` }}
          >
            <a
              href={waLink(defaultWaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
            >
              <WhatsAppIcon className="h-4 w-4" />
              בדיקת זמינות ומחיר בוואטסאפ
            </a>
            <div className="mt-5 flex items-center justify-center text-xs text-stone">
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
                aria-label="אינסטגרם"
              >
                <InstagramIcon className="h-4 w-4" />
                libidiamonds@
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
