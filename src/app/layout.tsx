import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Assistant } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { absoluteUrl, site } from "@/lib/site";
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
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
