import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";
import { InstagramIcon } from "@/components/icons";
import { pageMetadata } from "@/lib/seo";
import BrandSignature from "@/components/BrandSignature";

export const metadata: Metadata = pageMetadata({
  title: "צור קשר וייעוץ אישי",
  description:
    "נשמח ללוות אתכם בבחירת תכשיט היהלום — בוואטסאפ, במייל או בפגישה אישית. מענה מהיר ואישי.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-[clamp(1.9rem,6vw,2.6rem)] font-medium">נשמח לדבר</h1>
        <BrandSignature className="mt-4" />
      </header>

      <div className="mt-9 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="max-w-lg">
          <ContactForm />
        </div>

        <div className="space-y-8">
          {/* platinum-soft, not platinum: the heavier stone tone put the gilt
              contact glyphs at 4.2:1 and read muddy against the cream page. */}
          <div className="border border-line bg-mist p-8">
            <h2 className="font-display text-xl">פרטי קשר</h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={`tel:+${site.whatsapp}`}
                  className="flex items-center gap-3 text-ink-soft transition-colors hover:text-gilt-deep"
                >
                  <span className="text-gilt-deep">טל׳</span>
                  <span dir="ltr">{site.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 text-ink-soft transition-colors hover:text-gilt-deep"
                >
                  <span className="text-gilt-deep">@</span>
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-ink-soft transition-colors hover:text-gilt-deep"
                >
                  <InstagramIcon className="h-5 w-5 text-gilt-deep" />
                  libidiamonds@
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
