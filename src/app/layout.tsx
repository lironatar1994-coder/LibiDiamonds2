import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Assistant } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitorSignal from "@/components/VisitorSignal";
import { absoluteUrl, allowIndexing, site } from "@/lib/site";
import "./globals.css";

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-frank",
  display: "swap",
});

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-assistant",
  display: "swap",
});

const designContract = `<!--
THESIS: LIBI is a luminous diamond atelier; it refuses the heavy beige luxury grid.
OWN-WORLD: Diamond white, pearl, midnight ink and hairline gilt; flat folio surfaces, no ornamental card chrome.
STORY: See the jewelry clearly, understand the collection, try it on, then ask for personal guidance.
FIRST VIEWPORT: A high-key split composition gives the ring most of the frame and keeps one clear collection action beside it.
FORM: Luminous Atelier Folio, grounded direction 3, seed 02d54efe.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  applicationName: site.name,
  title: {
    default: `${site.name} — תכשיטי יהלומי מעבדה`,
    template: `%s | ${site.name}`,
  },
  description:
    "תכשיטי יהלומי מעבדה בעיצוב אלגנטי ומדויק: טבעות אירוסין, עגילים, שרשראות וצמידים. תעודה גמולוגית לכל יהלום, זהב 14K/18K וליווי אישי עד הבחירה.",
  authors: [{ name: site.name, url: site.domain }],
  creator: site.name,
  publisher: site.name,
  robots: {
    index: allowIndexing,
    follow: allowIndexing,
    googleBot: {
      index: allowIndexing,
      follow: allowIndexing,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: `${site.name} — תכשיטי יהלומי מעבדה`,
    description: site.tagline,
    siteName: site.name,
    url: site.domain,
    locale: site.locale,
    type: "website",
    images: [
      {
        url: absoluteUrl(site.socialImage),
        width: 1536,
        height: 1024,
        alt: site.tagline,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — תכשיטי יהלומי מעבדה`,
    description: site.tagline,
    images: [absoluteUrl(site.socialImage)],
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={`${frank.variable} ${assistant.variable}`}>
      <body>
        <div hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: designContract }} />
        <VisitorSignal />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
