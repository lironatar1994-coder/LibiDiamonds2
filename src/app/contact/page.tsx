import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { site, waLink, defaultWaMessage } from "@/lib/site";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "צור קשר",
  description:
    "נשמח ללוות אתכם בבחירת תכשיט היהלום — בוואטסאפ, במייל או בפגישה אישית. מענה מהיר ואישי.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="eyebrow">צור קשר</p>
        <h1 className="mt-3 font-display text-4xl font-medium">נשמח לדבר</h1>
        <p className="mt-4 leading-relaxed text-stone">
          מתלבטים? רוצים לראות אבנים? מחפשים משהו שלא באתר? הדרך הכי מהירה
          אלינו היא וואטסאפ — אבל כל דרך אחרת עובדת גם.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="max-w-lg">
          <ContactForm />
        </div>

        <div className="space-y-8">
          <div className="bg-cream p-8">
            <h2 className="font-display text-xl">דרכים נוספות</h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={waLink(defaultWaMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-ink-soft transition-colors hover:text-gold"
                >
                  <WhatsAppIcon className="h-5 w-5 text-gold" />
                  וואטסאפ: {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 text-ink-soft transition-colors hover:text-gold"
                >
                  <span className="text-gold">@</span>
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-ink-soft transition-colors hover:text-gold"
                >
                  <InstagramIcon className="h-5 w-5 text-gold" />
                  libidiamonds@
                </a>
              </li>
            </ul>
          </div>

          <div className="border border-line p-8">
            <h2 className="font-display text-xl">שעות מענה</h2>
            <dl className="mt-5 space-y-2 text-sm text-ink-soft">
              <div className="flex justify-between">
                <dt>ראשון–חמישי</dt>
                <dd>9:00–19:00</dd>
              </div>
              <div className="flex justify-between">
                <dt>שישי וערבי חג</dt>
                <dd>9:00–13:00</dd>
              </div>
              <div className="flex justify-between">
                <dt>שבת</dt>
                <dd>סגור</dd>
              </div>
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-stone">
              פגישות אישיות להתרשמות מהאבנים — בתיאום מראש.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
