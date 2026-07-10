import { waLink, defaultWaMessage } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

export default function WhatsAppFloat() {
  return (
    <a
      href={waLink(defaultWaMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="בדיקת זמינות ומחיר בוואטסאפ"
      className="fixed bottom-6 left-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-ink text-ivory shadow-lg ring-1 ring-champagne/50 transition-colors hover:bg-gold-deep lg:flex"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
