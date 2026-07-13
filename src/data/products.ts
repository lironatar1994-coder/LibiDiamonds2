import { assetPath } from "@/lib/site";

export type Metal = "yellow" | "white" | "rose";
export type CategorySlug = "rings" | "earrings" | "necklaces" | "bracelets";
export type DiamondShape = "round" | "oval" | "emerald" | "cushion" | "pear" | "princess";
export type ArtType =
  | "solitaire"
  | "halo"
  | "three-stone"
  | "pave"
  | "studs"
  | "hoops"
  | "tennis-necklace"
  | "pendant"
  | "bezel-pendant"
  | "tennis-bracelet"
  | "bangle";

export interface CaratOption {
  label: string;
  price: number;
}

export interface ProductGalleryImage {
  src: string;
  alt: string;
}

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  category: CategorySlug;
  diamondShape?: DiamondShape;
  art: ArtType;
  priceFrom: number;
  carats: CaratOption[];
  metals: Metal[];
  specs: {
    color: string;
    clarity: string;
    cut: string;
    cert: string;
  };
  description: string;
  gallery?: ProductGalleryImage[];
  featured?: boolean;
  bestseller?: boolean;
}

export function productImages(
  product: Pick<Product, "slug" | "name" | "gallery">,
): ProductGalleryImage[] {
  const images = product.gallery?.length
    ? product.gallery
    : [
        {
          src: `/images/products/${product.slug}.webp`,
          alt: product.name,
        },
      ];

  return images.map((image) => ({ ...image, src: assetPath(image.src) }));
}

export function productImage(
  product: Pick<Product, "slug" | "name" | "gallery">,
): string {
  return productImages(product)[0].src;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  title: string;
  description: string;
  art: ArtType;
}

export const metalNames: Record<Metal, string> = {
  yellow: "זהב צהוב",
  white: "זהב לבן",
  rose: "זהב ורוד",
};

export const categories: Category[] = [
  {
    slug: "rings",
    name: "טבעות",
    title: "טבעות אירוסין ויהלום",
    description:
      "טבעות יהלומי מעבדה בשיבוץ יד, מזהב 14K או 18K. מסוליטר נקי ועד היילו ופאווה, כל דגם נבנה סביב האבן המרכזית ובחירה מדויקת של קראט, גוון זהב ומידה. לכל אבן מרכזית מצורפת תעודה גמולוגית.",
    art: "solitaire",
  },
  {
    slug: "earrings",
    name: "עגילים",
    title: "עגילי יהלום",
    description:
      "עגילי יהלום מעבדה צמודים, חישוקים ודגמי היילו בזהב אמיתי. בחרו בין נוכחות קטנה ומדויקת לבין מסגרת יהלומים שמגדילה את האור סביב האבן. כל זוג מתוכנן לענידה נוחה מהיום־יום ועד ערב חגיגי.",
    art: "studs",
  },
  {
    slug: "necklaces",
    name: "שרשראות",
    title: "שרשראות ותליוני יהלום",
    description:
      "תליוני סוליטר ושרשראות טניס משובצי יהלומי מעבדה, בקו נקי שנשאר רלוונטי לאורך זמן. בחרו תליון מרכזי ועדין ליום־יום או שורת יהלומים מלאה לרגעים שבהם התכשיט הוא מוקד המראה.",
    art: "pendant",
  },
  {
    slug: "bracelets",
    name: "צמידים",
    title: "צמידי יהלום",
    description:
      "צמידי טניס קלאסיים וצמידים עדינים עם יהלום מעבדה מרכזי. שורת היהלומים הגמישה מעניקה נוכחות רציפה על פרק היד, בעוד צמיד זהב עם אבן בודדת מתאים לשכבות ולעונדות שמעדיפות קו שקט יותר.",
    art: "tennis-bracelet",
  },
];

export const products: Product[] = [
  {
    slug: "aura-solitaire-ring",
    name: "טבעת סוליטר ״אורה״",
    subtitle: "יהלום מעבדה עגול · שיבוץ 4 שיניים",
    category: "rings",
    diamondShape: "round",
    art: "solitaire",
    priceFrom: 4900,
    carats: [
      { label: "0.70 קראט", price: 4900 },
      { label: "1.00 קראט", price: 6400 },
      { label: "1.50 קראט", price: 8900 },
      { label: "2.00 קראט", price: 11900 },
    ],
    metals: ["yellow", "white", "rose"],
    specs: { color: "E–F", clarity: "VS1", cut: "Excellent", cert: "IGI" },
    description:
      "יהלום עגול מורם בשיבוץ ארבע שיניים על חישוק זהב חלק ומעוגל. הפרופיל הנקי משאיר את האבן פתוחה לאור ונוח לענידה יומיומית.",
    gallery: [
      { src: "/images/products/v2/aura-solitaire-ring-primary.webp", alt: "טבעת אורה בזהב צהוב במבט חזיתי" },
      { src: "/images/products/v2/aura-solitaire-ring-detail.webp", alt: "פרופיל שיבוץ ארבע השיניים של טבעת אורה" },
      { src: "/images/editorial/mineral/diamond-macro.webp", alt: "תקריב מאקרו של היהלום והשיבוץ בטבעת אורה" },
    ],
    featured: true,
    bestseller: true,
  },
  {
    slug: "nova-halo-ring",
    name: "טבעת היילו ״נובה״",
    subtitle: "אבן מרכזית עגולה · היילו בשורה אחת",
    category: "rings",
    diamondShape: "round",
    art: "halo",
    priceFrom: 6400,
    carats: [
      { label: "0.70 קראט מרכזי", price: 6400 },
      { label: "1.00 קראט מרכזי", price: 7900 },
      { label: "1.50 קראט מרכזי", price: 10400 },
    ],
    metals: ["yellow", "white", "rose"],
    specs: { color: "E–F", clarity: "VS1", cut: "Excellent", cert: "IGI" },
    description:
      "יהלום עגול מוקף בשורה אחת של יהלומים קטנים על חישוק זהב מלוטש. סל ההיילו יוצר מסגרת אחידה סביב האבן ושומר על פרופיל מאוזן.",
    gallery: [
      { src: "/images/products/v2/nova-halo-ring-primary.webp", alt: "טבעת נובה בזהב ורוד במבט חזיתי" },
      { src: "/images/products/v2/nova-halo-ring-detail.webp", alt: "פרופיל סל ההיילו של טבעת נובה" },
    ],
    featured: true,
    bestseller: true,
  },
  {
    slug: "trio-three-stone-ring",
    name: "טבעת שלוש אבנים ״טריו״",
    subtitle: "עבר · הווה · עתיד",
    category: "rings",
    diamondShape: "round",
    art: "three-stone",
    priceFrom: 7800,
    carats: [
      { label: "1.00 קראט סה״כ", price: 7800 },
      { label: "1.50 קראט סה״כ", price: 10200 },
      { label: "2.00 קראט סה״כ", price: 13400 },
    ],
    metals: ["yellow", "white"],
    specs: { color: "E–F", clarity: "VS1", cut: "Excellent", cert: "IGI" },
    description:
      "שלוש אבנים, סיפור אחד: אבן מרכזית ושתי אבני צד שמלוות אותה. עיצוב קלאסי עם משמעות — עבר, הווה ועתיד — ופרופיל מאוזן שמחמיא לכל יד.",
    gallery: [
      { src: "/images/products/v4/trio-three-stone-ring-primary.webp", alt: "טבעת טריו מזהב לבן עם יהלום מרכזי ושתי אבני צד במבט חזיתי" },
      { src: "/images/products/v4/trio-three-stone-ring-detail.webp", alt: "תקריב שיבוץ שלוש האבנים והפרופיל של טבעת טריו" },
    ],
    featured: true,
  },
  {
    slug: "lumiere-pave-ring",
    name: "טבעת פאווה ״לומייר״",
    subtitle: "אבן עגולה · פאווה עדין לאורך הכתפיים",
    category: "rings",
    diamondShape: "round",
    art: "pave",
    priceFrom: 5600,
    carats: [
      { label: "0.70 קראט מרכזי", price: 5600 },
      { label: "1.00 קראט מרכזי", price: 7200 },
      { label: "1.50 קראט מרכזי", price: 9800 },
    ],
    metals: ["yellow", "white", "rose"],
    specs: { color: "E–F", clarity: "VS1", cut: "Excellent", cert: "IGI" },
    description:
      "יהלום עגול בשיבוץ ארבע שיניים, עם שורת פאווה צפופה לאורך שתי כתפי החישוק. השיבוץ הנמוך משאיר את קו הטבעת עדין ומדגיש את האבן המרכזית.",
    gallery: [
      { src: "/images/products/v2/lumiere-pave-ring-primary.webp", alt: "טבעת לומייר בזהב צהוב במבט חזיתי" },
      { src: "/images/products/v2/lumiere-pave-ring-detail.webp", alt: "פרט שיבוץ הפאווה והאבן המרכזית בטבעת לומייר" },
    ],
    bestseller: true,
  },
  {
    slug: "stella-diamond-studs",
    name: "עגילים צמודים ״סטלה״",
    subtitle: "זוג יהלומים עגולים · שיבוץ ארבע שיניים",
    category: "earrings",
    art: "studs",
    priceFrom: 2900,
    carats: [
      { label: "0.50 קראט סה״כ", price: 2900 },
      { label: "1.00 קראט סה״כ", price: 4900 },
      { label: "1.50 קראט סה״כ", price: 7400 },
      { label: "2.00 קראט סה״כ", price: 9800 },
    ],
    metals: ["yellow", "white", "rose"],
    specs: { color: "E–F", clarity: "VS1", cut: "Excellent", cert: "IGI" },
    description:
      "זוג יהלומים עגולים תואמים, כל אחד מוחזק בארבע שיניים על בסיס זהב לבן. מבנה הסל הפתוח מציג את האבן גם מהצד ושומר על פרופיל נקי באוזן.",
    gallery: [
      { src: "/images/products/v2/stella-diamond-studs-primary.webp", alt: "זוג עגילי סטלה בזהב לבן במבט קדמי" },
      { src: "/images/products/v2/stella-diamond-studs-detail.webp", alt: "פרופיל הסל והמוטות של עגילי סטלה" },
    ],
    featured: true,
    bestseller: true,
  },
  {
    slug: "glow-halo-earrings",
    name: "עגילי היילו ״גלואו״",
    subtitle: "יהלום מרכזי בהיקף יהלומים · ברק כפול",
    category: "earrings",
    art: "studs",
    priceFrom: 4200,
    carats: [
      { label: "0.60 קראט סה״כ", price: 4200 },
      { label: "1.00 קראט סה״כ", price: 6100 },
      { label: "1.60 קראט סה״כ", price: 8900 },
    ],
    metals: ["yellow", "white"],
    specs: { color: "E–F", clarity: "VS2", cut: "Excellent", cert: "IGI" },
    description:
      "כל עגיל הוא יהלום מרכזי מוקף שורת יהלומים קטנים — מראה גדול ונוצץ יותר מהמשקל בפועל. בחירה מצוינת למי שרוצה נוכחות באוזן בלי כבדות.",
    gallery: [
      { src: "/images/products/v4/glow-halo-earrings-primary.webp", alt: "זוג עגילי גלואו מזהב צהוב עם יהלום מרכזי והיילו במבט קדמי" },
      { src: "/images/products/v4/glow-halo-earrings-detail.webp", alt: "תקריב פרופיל ההיילו, המוטות והסוגרים של עגילי גלואו" },
    ],
  },
  {
    slug: "luna-diamond-hoops",
    name: "חישוקי יהלומים ״לונה״",
    subtitle: "שורת יהלומים קדמית · סגירה צירית",
    category: "earrings",
    art: "hoops",
    priceFrom: 5200,
    carats: [
      { label: "0.75 קראט סה״כ", price: 5200 },
      { label: "1.20 קראט סה״כ", price: 7300 },
      { label: "2.00 קראט סה״כ", price: 10900 },
    ],
    metals: ["yellow", "white", "rose"],
    specs: { color: "F–G", clarity: "VS2", cut: "Excellent", cert: "IGI" },
    description:
      "חישוקי זהב ורוד עם שורת יהלומים עגולים לאורך החזית וסגירה צירית רציפה. הקוטר הבינוני שומר על נוכחות ברורה בלי להכביד על קו האוזן.",
    gallery: [
      { src: "/images/products/v2/luna-diamond-hoops-primary.webp", alt: "חישוקי לונה בזהב ורוד במבט קדמי" },
      { src: "/images/products/v2/luna-diamond-hoops-detail.webp", alt: "פרט הסגירה הצירית ושורת היהלומים בחישוקי לונה" },
    ],
    bestseller: true,
  },
  {
    slug: "riviera-tennis-necklace",
    name: "שרשרת טניס ״ריביירה״",
    subtitle: "שורת יהלומים רציפה · שיבוץ ארבע שיניים",
    category: "necklaces",
    art: "tennis-necklace",
    priceFrom: 16900,
    carats: [
      { label: "5.00 קראט סה״כ", price: 16900 },
      { label: "8.00 קראט סה״כ", price: 24900 },
      { label: "11.00 קראט סה״כ", price: 33900 },
    ],
    metals: ["yellow", "white"],
    specs: { color: "F–G", clarity: "VS2", cut: "Excellent", cert: "IGI" },
    description:
      "שורה רציפה של יהלומים עגולים בשיבוץ ארבע שיניים ובחיבור גמיש בין החוליות. סוגר קופסה עם מנגנון בטיחות משלים את המבנה האחיד סביב הצוואר.",
    gallery: [
      { src: "/images/products/v4/riviera-tennis-necklace-primary.webp", alt: "שרשרת ריביירה מזהב לבן במבט על מלא" },
      { src: "/images/products/v4/riviera-tennis-necklace-detail.webp", alt: "תקריב סוגר הקופסה ושורת היהלומים בשרשרת ריביירה" },
    ],
    featured: true,
    bestseller: true,
  },
  {
    slug: "claire-solitaire-pendant",
    name: "תליון סוליטר ״קלייר״",
    subtitle: "יהלום בודד על שרשרת עדינה",
    category: "necklaces",
    art: "pendant",
    priceFrom: 2400,
    carats: [
      { label: "0.30 קראט", price: 2400 },
      { label: "0.50 קראט", price: 3400 },
      { label: "1.00 קראט", price: 5900 },
    ],
    metals: ["yellow", "white", "rose"],
    specs: { color: "E–F", clarity: "VS1", cut: "Excellent", cert: "IGI" },
    description:
      "יהלום מעבדה אחד, בדיוק במרכז. תליון הסוליטר הוא המתנה הקלאסית ביותר שיש — עדין מספיק ליום־יום, משמעותי מספיק לרגעים הגדולים.",
    gallery: [
      { src: "/images/products/v4/claire-solitaire-pendant-primary.webp", alt: "תליון קלייר מזהב צהוב ויהלום עגול במבט על" },
      { src: "/images/products/v4/claire-solitaire-pendant-detail.webp", alt: "תקריב ארבע השיניים, הסל והחיבור לשרשרת בתליון קלייר" },
    ],
    featured: true,
    bestseller: true,
  },
  {
    slug: "drop-bezel-necklace",
    name: "שרשרת ״דרופ״",
    subtitle: "יהלום בשיבוץ בצל · מינימליזם נקי",
    category: "necklaces",
    art: "bezel-pendant",
    priceFrom: 2900,
    carats: [
      { label: "0.40 קראט", price: 2900 },
      { label: "0.70 קראט", price: 4400 },
      { label: "1.00 קראט", price: 6200 },
    ],
    metals: ["yellow", "rose"],
    specs: { color: "F–G", clarity: "VS2", cut: "Excellent", cert: "IGI" },
    description:
      "היהלום עטוף במסגרת זהב מלאה — שיבוץ בצל (Bezel) שנותן מראה מודרני, נקי ועמיד במיוחד. השרשרת של מי שאוהבת שקט עיצובי.",
    gallery: [
      { src: "/images/products/v4/drop-bezel-necklace-primary.webp", alt: "שרשרת דרופ מזהב ורוד עם יהלום בשיבוץ בזל במבט על" },
      { src: "/images/products/v4/drop-bezel-necklace-detail.webp", alt: "תקריב מסגרת הבזל והחיבור לשרשרת בתליון דרופ" },
    ],
  },
  {
    slug: "icon-tennis-bracelet",
    name: "צמיד טניס ״אייקון״",
    subtitle: "שורת יהלומים רציפה · סוגר בטיחות כפול",
    category: "bracelets",
    art: "tennis-bracelet",
    priceFrom: 8900,
    carats: [
      { label: "3.00 קראט סה״כ", price: 8900 },
      { label: "5.00 קראט סה״כ", price: 13900 },
      { label: "7.00 קראט סה״כ", price: 18900 },
    ],
    metals: ["yellow", "white", "rose"],
    specs: { color: "F–G", clarity: "VS2", cut: "Excellent", cert: "IGI" },
    description:
      "שורת יהלומים עגולים מחוברת בחוליות גמישות ומסתיימת בסוגר קופסה עם אבטחה כפולה. בתי האבן הפתוחים שומרים על קו אחיד ומאפשרים לאור לעבור דרך כל יהלום.",
    gallery: [
      { src: "/images/products/v4/icon-tennis-bracelet-primary.webp", alt: "צמיד טניס אייקון מזהב לבן במבט מלא" },
      { src: "/images/products/v4/icon-tennis-bracelet-detail.webp", alt: "תקריב הסוגר הכפול והחוליות בצמיד אייקון" },
    ],
    featured: true,
    bestseller: true,
  },
  {
    slug: "one-diamond-bangle",
    name: "צמיד ״וואן״",
    subtitle: "חישוק זהב עם יהלום בודד",
    category: "bracelets",
    art: "bangle",
    priceFrom: 2900,
    carats: [
      { label: "0.30 קראט", price: 2900 },
      { label: "0.50 קראט", price: 3900 },
      { label: "1.00 קראט", price: 6400 },
    ],
    metals: ["yellow", "white", "rose"],
    specs: { color: "F–G", clarity: "VS2", cut: "Excellent", cert: "IGI" },
    description:
      "חישוק זהב חלק ונקי, ובמרכזו יהלום מעבדה אחד בשיבוץ בצל. הצמיד שעונדים ולא מורידים — לבד או בשכבות עם שעון וצמידים נוספים.",
    gallery: [
      { src: "/images/products/v4/one-diamond-bangle-primary.webp", alt: "צמיד וואן מזהב צהוב עם יהלום יחיד בשיבוץ בזל" },
      { src: "/images/products/v4/one-diamond-bangle-detail.webp", alt: "תקריב היהלום ומסגרת הבזל בצמיד וואן" },
    ],
    bestseller: true,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function productsByCategory(slug: CategorySlug): Product[] {
  return products.filter((p) => p.category === slug);
}

export function relatedProducts(product: Product, count = 4): Product[] {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  );
  const others = products.filter(
    (p) => p.category !== product.category && p.slug !== product.slug
  );
  return [...sameCategory, ...others].slice(0, count);
}
