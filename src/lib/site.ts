const configuredDomain = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const site = {
  name: "LIBI DIAMONDS",
  nameHe: "ליבי דיאמונדס",
  tagline: "יהלומי מעבדה בעיצוב אלגנטי, מדויק ונצחי",
  domain: (configuredDomain || "https://www.libidiamonds.co.il").replace(/\/+$/, ""),
  locale: "he_IL",
  language: "he-IL",
  country: "IL",
  currency: "ILS",
  serviceArea: "ישראל",
  logo: "/icon.svg",
  socialImage: "/images/hero/mineral/hero-desktop.webp",
  whatsapp: "972508611888",
  phoneDisplay: "050-8611888",
  email: "Libidiamonds@gmail.com",
  instagram: "https://www.instagram.com/libidiamonds",
};

export function absoluteUrl(path = ""): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!path) return site.domain;
  return `${site.domain}${path.startsWith("/") ? path : `/${path}`}`;
}

export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function assetPath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!basePath || !path.startsWith("/")) {
    return path;
  }
  return `${basePath}${path}`;
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
