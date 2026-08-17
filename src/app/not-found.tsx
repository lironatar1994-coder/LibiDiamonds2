import type { Metadata } from "next";
import Link from "next/link";
import BrandSignature from "@/components/BrandSignature";
import { WhatsAppIcon } from "@/components/icons";
import { waLink, defaultWaMessage } from "@/lib/site";

export const metadata: Metadata = {
  title: "העמוד לא נמצא",
  robots: { index: false, follow: false },
};

const ways = [
  { href: "/jewelry/rings", label: "טבעות אירוסין" },
  { href: "/jewelry/earrings", label: "עגילים" },
  { href: "/jewelry/necklaces", label: "שרשראות" },
  { href: "/jewelry/bracelets", label: "צמידים" },
];

export default function NotFound() {
  return (
    <div className="site-shell mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <BrandSignature className="mx-auto" />
      <h1 className="mt-6 font-display text-[clamp(1.9rem,6vw,2.6rem)] font-medium leading-tight">
        העמוד הזה לא נמצא
      </h1>
      <p className="mx-auto mt-4 max-w-md leading-7 text-stone">
        ייתכן שהקישור השתנה. אפשר להתחיל מאחת הקולקציות — או פשוט לשאול אותנו.
      </p>

      {/* A dead end should offer real doors, not one button back to the top. */}
      <ul className="mx-auto mt-9 grid max-w-sm grid-cols-2 gap-x-8 border-t border-line pt-2 text-right">
        {ways.map((way) => (
          <li key={way.href} className="border-b border-line/70">
            <Link href={way.href} className="link-rule flex min-h-12 items-center justify-end text-sm text-ink-soft">
              {way.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-9 flex flex-col items-center gap-4">
        <Link href="/" className="btn-primary">
          חזרה לעמוד הבית
        </Link>
        <a
          href={waLink(defaultWaMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="link-rule inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft"
        >
          <WhatsAppIcon className="h-4 w-4" />
          לשאול אותנו בוואטסאפ
        </a>
      </div>
    </div>
  );
}
