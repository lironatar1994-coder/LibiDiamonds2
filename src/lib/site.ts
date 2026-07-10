export const site = {
  name: "LIBI DIAMONDS",
  nameHe: "ליבי דיאמונדס",
  tagline: "יהלומי מעבדה בעיצוב אלגנטי, מדויק ונצחי",
  domain: "https://www.libidiamonds.co.il",
  // TODO: replace with the real business WhatsApp number (international format, no +)
  whatsapp: "972500000000",
  phoneDisplay: "050-000-0000",
  email: "hello@libidiamonds.co.il",
  instagram: "https://www.instagram.com/libidiamonds",
};

export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const defaultWaMessage =
  "היי, אשמח להתייעץ על תכשיט מהאתר של LIBI DIAMONDS";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(price);
}
