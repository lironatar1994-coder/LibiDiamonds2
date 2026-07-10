import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Assistant } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { site } from "@/lib/site";
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
  title: {
    default: `${site.name} — תכשיטי יהלומי מעבדה`,
    template: `%s | ${site.name}`,
  },
  description:
    "תכשיטי יהלומי מעבדה בעיצוב אלגנטי ומדויק: טבעות אירוסין, עגילים, שרשראות וצמידים. תעודה גמולוגית לכל יהלום, זהב 14K/18K וליווי אישי עד הבחירה.",
  openGraph: {
    title: `${site.name} — תכשיטי יהלומי מעבדה`,
    description: site.tagline,
    locale: "he_IL",
    type: "website",
  },
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
        <WhatsAppFloat />
      </body>
    </html>
  );
}
