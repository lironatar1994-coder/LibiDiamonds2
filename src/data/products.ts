import { assetPath } from "@/lib/site";

export type Metal = "yellow" | "white" | "rose";
export type CategorySlug = "rings" | "earrings" | "necklaces" | "bracelets";
export type DiamondShape =
  | "round"
  | "oval"
  | "emerald"
  | "cushion"
  | "pear"
  | "princess"
  | "marquise"
  | "radiant"
  | "asscher";
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
  view?: "primary" | "detail";
  legacy?: boolean;
  objectPosition?: string;
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
  defaultMetal?: Metal;
  specs: {
    color: string;
    clarity: string;
    cut: string;
    cert: string;
  };
  description: string;
  gallery?: ProductGalleryImage[];
  galleryByMetal?: Partial<Record<Metal, ProductGalleryImage[]>>;
  featured?: boolean;
  bestseller?: boolean;
}

export function productImages(
  product: Pick<Product, "slug" | "name" | "gallery" | "galleryByMetal" | "defaultMetal" | "metals">,
  metal?: Metal,
): ProductGalleryImage[] {
  const selectedMetal = metal ?? product.defaultMetal ?? product.metals[0];
  const metalGallery = selectedMetal ? product.galleryByMetal?.[selectedMetal] : undefined;
  const images = metalGallery?.length
    ? metalGallery
    : product.gallery?.length
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
  product: Pick<Product, "slug" | "name" | "gallery" | "galleryByMetal" | "defaultMetal" | "metals">,
  metal?: Metal,
): string {
  return productImages(product, metal)[0].src;
}

export function metalGallery(
  slug: string,
  productName: string,
  metal: Extract<Metal, "yellow" | "white">,
): ProductGalleryImage[] {
  const metalLabel = metal === "yellow" ? "זהב צהוב" : "זהב לבן";
  return [
    {
      src: `/images/products/catalog/${slug}-${metal}-primary.webp`,
      alt: `${productName} ב${metalLabel} - מבט ראשי`,
      view: "primary",
    },
    {
      src: `/images/products/catalog/${slug}-${metal}-detail.webp`,
      alt: `${productName} ב${metalLabel} - תקריב פרטים`,
      view: "detail",
    },
  ];
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

type NewCatalogProduct = Omit<Product, "metals" | "specs"> & {
  specs?: Product["specs"];
};

function newCatalogProduct(product: NewCatalogProduct): Product {
  return {
    ...product,
    metals: ["yellow", "white"],
    specs: product.specs ?? {
      color: "E–F",
      clarity: "VS1–VS2",
      cut: "Excellent",
      cert: "IGI",
    },
  };
}

const catalogProducts: Product[] = [
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
      { src: "/images/products/catalog/aura-solitaire-ring-primary.webp", alt: "טבעת אורה בזהב צהוב במבט חזיתי", view: "primary", legacy: true },
      { src: "/images/products/catalog/aura-solitaire-ring-detail.webp", alt: "פרופיל שיבוץ ארבע השיניים של טבעת אורה", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/nova-halo-ring-primary.webp", alt: "טבעת נובה בזהב ורוד במבט חזיתי", view: "primary", legacy: true },
      { src: "/images/products/catalog/nova-halo-ring-detail.webp", alt: "פרופיל סל ההיילו של טבעת נובה", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/trio-three-stone-ring-primary.webp", alt: "טבעת טריו מזהב לבן עם יהלום מרכזי ושתי אבני צד במבט חזיתי", view: "primary", legacy: true },
      { src: "/images/products/catalog/trio-three-stone-ring-detail.webp", alt: "תקריב שיבוץ שלוש האבנים והפרופיל של טבעת טריו", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/lumiere-pave-ring-primary.webp", alt: "טבעת לומייר בזהב צהוב במבט חזיתי", view: "primary", legacy: true },
      { src: "/images/products/catalog/lumiere-pave-ring-detail.webp", alt: "פרט שיבוץ הפאווה והאבן המרכזית בטבעת לומייר", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/stella-diamond-studs-primary.webp", alt: "זוג עגילי סטלה בזהב לבן במבט קדמי", view: "primary", legacy: true },
      { src: "/images/products/catalog/stella-diamond-studs-detail.webp", alt: "פרופיל הסל והמוטות של עגילי סטלה", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/glow-halo-earrings-primary.webp", alt: "זוג עגילי גלואו מזהב צהוב עם יהלום מרכזי והיילו במבט קדמי", view: "primary", legacy: true },
      { src: "/images/products/catalog/glow-halo-earrings-detail.webp", alt: "תקריב פרופיל ההיילו, המוטות והסוגרים של עגילי גלואו", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/luna-diamond-hoops-primary.webp", alt: "חישוקי לונה בזהב ורוד במבט קדמי", view: "primary", legacy: true },
      { src: "/images/products/catalog/luna-diamond-hoops-detail.webp", alt: "פרט הסגירה הצירית ושורת היהלומים בחישוקי לונה", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/riviera-tennis-necklace-primary.webp", alt: "שרשרת ריביירה מזהב לבן במבט על מלא", view: "primary", legacy: true },
      { src: "/images/products/catalog/riviera-tennis-necklace-detail.webp", alt: "תקריב סוגר הקופסה ושורת היהלומים בשרשרת ריביירה", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/claire-solitaire-pendant-primary.webp", alt: "תליון קלייר מזהב צהוב ויהלום עגול במבט על", view: "primary", legacy: true },
      { src: "/images/products/catalog/claire-solitaire-pendant-detail.webp", alt: "תקריב ארבע השיניים, הסל והחיבור לשרשרת בתליון קלייר", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/drop-bezel-necklace-primary.webp", alt: "שרשרת דרופ מזהב ורוד עם יהלום בשיבוץ בזל במבט על", view: "primary", legacy: true },
      { src: "/images/products/catalog/drop-bezel-necklace-detail.webp", alt: "תקריב מסגרת הבזל והחיבור לשרשרת בתליון דרופ", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/icon-tennis-bracelet-primary.webp", alt: "צמיד טניס אייקון מזהב לבן במבט מלא", view: "primary", legacy: true },
      { src: "/images/products/catalog/icon-tennis-bracelet-detail.webp", alt: "תקריב הסוגר הכפול והחוליות בצמיד אייקון", view: "detail", legacy: true },
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
      { src: "/images/products/catalog/one-diamond-bangle-primary.webp", alt: "צמיד וואן מזהב צהוב עם יהלום יחיד בשיבוץ בזל", view: "primary", legacy: true },
      { src: "/images/products/catalog/one-diamond-bangle-detail.webp", alt: "תקריב היהלום ומסגרת הבזל בצמיד וואן", view: "detail", legacy: true },
    ],
    bestseller: true,
  },
  newCatalogProduct({
    slug: "elara-oval-hidden-halo-ring",
    name: "טבעת אובל ״אלרה״",
    subtitle: "אובל מוארך · היילו נסתר מתחת לאבן",
    category: "rings",
    diamondShape: "oval",
    art: "solitaire",
    priceFrom: 6900,
    carats: [
      { label: "1.00 קראט", price: 6900 },
      { label: "1.50 קראט", price: 9400 },
      { label: "2.00 קראט", price: 12400 },
      { label: "3.00 קראט", price: 17400 },
    ],
    description:
      "יהלום אובל מורם בסל עדין, עם שורת יהלומים נסתרת שמופיעה רק במבט מן הצד. החישוק נשאר חלק בחלקו האחורי ונוח להתאמת טבעת נישואין.",
    featured: true,
    bestseller: true,
  }),
  newCatalogProduct({
    slug: "atelier-emerald-cathedral-ring",
    name: "טבעת אמרלד ״אטלייה״",
    subtitle: "חיתוך מדרגות · כתפי Cathedral",
    category: "rings",
    diamondShape: "emerald",
    art: "solitaire",
    priceFrom: 6800,
    carats: [
      { label: "1.00 קראט", price: 6800 },
      { label: "1.50 קראט", price: 9300 },
      { label: "2.00 קראט", price: 12300 },
      { label: "3.00 קראט", price: 17200 },
    ],
    description:
      "יהלום אמרלד מלבני עם פינות מוגנות, על כתפיים שעולות בהדרגה אל הסל. הפרופיל האדריכלי מדגיש את קווי המדרגות ושומר על בסיס יציב.",
    featured: true,
    bestseller: true,
  }),
  newCatalogProduct({
    slug: "marais-marquise-solitaire-ring",
    name: "טבעת מרקיזה ״מארה״",
    subtitle: "מרקיזה מוארכת · שש נקודות אחיזה",
    category: "rings",
    diamondShape: "marquise",
    art: "solitaire",
    priceFrom: 6600,
    carats: [
      { label: "1.00 קראט", price: 6600 },
      { label: "1.50 קראט", price: 9100 },
      { label: "2.00 קראט", price: 12100 },
    ],
    description:
      "חיתוך מרקיזה מוצב לאורך האצבע, עם שיניים ייעודיות שמגינות על שני הקצוות המחודדים. חישוק מעוגל ונקי משאיר את הצללית המוארכת במרכז.",
    bestseller: true,
  }),
  newCatalogProduct({
    slug: "celeste-radiant-pave-ring",
    name: "טבעת רדיאנט ״סלסט״",
    subtitle: "רדיאנט מלבני · פאווה והיילו נסתר",
    category: "rings",
    diamondShape: "radiant",
    art: "pave",
    priceFrom: 7600,
    carats: [
      { label: "1.00 קראט מרכזי", price: 7600 },
      { label: "1.50 קראט מרכזי", price: 10200 },
      { label: "2.00 קראט מרכזי", price: 13600 },
    ],
    description:
      "יהלום רדיאנט מלבני בסל ארבע שיניים, עם היילו נסתר ושורת פאווה לאורך הכתפיים. פינות האבן נשארות מוגנות והחישוק מתכנס בעדינות אל המרכז.",
    featured: true,
  }),
  newCatalogProduct({
    slug: "velour-cushion-solitaire-ring",
    name: "טבעת קושן ״ולור״",
    subtitle: "קושן מרובע רך · סל ארבע שיניים",
    category: "rings",
    diamondShape: "cushion",
    art: "solitaire",
    priceFrom: 6500,
    carats: [
      { label: "1.00 קראט", price: 6500 },
      { label: "1.50 קראט", price: 8900 },
      { label: "2.00 קראט", price: 11900 },
    ],
    description:
      "יהלום קושן עם פינות מעוגלות בסל פתוח וקומפקטי. החישוק החלק פוגש את האבן בקו נקי ומאפשר לענוד לצדה טבעת נוספת ללא עומס חזותי.",
  }),
  newCatalogProduct({
    slug: "seren-pear-solitaire-ring",
    name: "טבעת טיפה ״סרן״",
    subtitle: "חיתוך טיפה · קצה מוגן",
    category: "rings",
    diamondShape: "pear",
    art: "solitaire",
    priceFrom: 6600,
    carats: [
      { label: "1.00 קראט", price: 6600 },
      { label: "1.50 קראט", price: 9200 },
      { label: "2.00 קראט", price: 12300 },
    ],
    description:
      "יהלום טיפה מוצב לאורך האצבע, עם שן V שמגינה על הקצה ושתי שיניים תומכות בצד הרחב. הסל נמוך יחסית כדי לשמור על פרופיל מאוזן.",
  }),
  newCatalogProduct({
    slug: "axis-princess-solitaire-ring",
    name: "טבעת פרינסס ״אקסיס״",
    subtitle: "חיתוך מרובע · ארבע פינות מוגנות",
    category: "rings",
    diamondShape: "princess",
    art: "solitaire",
    priceFrom: 6200,
    carats: [
      { label: "1.00 קראט", price: 6200 },
      { label: "1.50 קראט", price: 8500 },
      { label: "2.00 קראט", price: 11300 },
    ],
    description:
      "יהלום פרינסס מרובע במסגרת ארבע שיניים שמכסות את הפינות הרגישות. חישוק שטוח-מעוגל ממשיך את הגיאומטריה מבלי להתחרות בברק של האבן.",
  }),
  newCatalogProduct({
    slug: "deco-asscher-bezel-ring",
    name: "טבעת אשר ״דקו״",
    subtitle: "חיתוך אשר · שיבוץ בזל לרוחב",
    category: "rings",
    diamondShape: "asscher",
    art: "solitaire",
    priceFrom: 7300,
    carats: [
      { label: "1.00 קראט", price: 7300 },
      { label: "1.50 קראט", price: 9900 },
      { label: "2.00 קראט", price: 13200 },
    ],
    description:
      "יהלום אשר מרובע מוצב לרוחב בתוך מסגרת בזל דקה. השיבוץ עוטף את ההיקף, מדגיש את מבנה המדרגות ומייצר פרופיל נמוך וחלק.",
  }),
  newCatalogProduct({
    slug: "heritage-six-prong-ring",
    name: "טבעת שש שיניים ״הריטג׳״",
    subtitle: "יהלום עגול · סל שש שיניים",
    category: "rings",
    diamondShape: "round",
    art: "solitaire",
    priceFrom: 5000,
    carats: [
      { label: "0.70 קראט", price: 5000 },
      { label: "1.00 קראט", price: 6500 },
      { label: "1.50 קראט", price: 9000 },
      { label: "2.00 קראט", price: 12000 },
    ],
    description:
      "סוליטר עגול בשיבוץ שש שיניים שמחלק את התמיכה באופן סימטרי סביב האבן. החישוק מתחדד מעט ליד הסל ומשאיר את קו המתאר של היהלום ברור.",
    bestseller: true,
  }),
  newCatalogProduct({
    slug: "ribbon-twist-pave-ring",
    name: "טבעת טוויסט ״ריבון״",
    subtitle: "שתי כתפיים נשזרות · פאווה בצד אחד",
    category: "rings",
    diamondShape: "round",
    art: "pave",
    priceFrom: 5900,
    carats: [
      { label: "0.70 קראט מרכזי", price: 5900 },
      { label: "1.00 קראט מרכזי", price: 7500 },
      { label: "1.50 קראט מרכזי", price: 10100 },
    ],
    description:
      "שתי כתפיים נשזרות מתחת ליהלום המרכזי; האחת חלקה והשנייה משובצת פאווה. החיבור נשמר סימטרי מאחור כדי שהטבעת תשב ישר על האצבע.",
  }),
  newCatalogProduct({
    slug: "contour-diamond-band",
    name: "טבעת קונטור ״ליין״",
    subtitle: "קשת עדינה · שורת יהלומים",
    category: "rings",
    diamondShape: "round",
    art: "pave",
    priceFrom: 3200,
    carats: [
      { label: "0.20 קראט סה״כ", price: 3200 },
      { label: "0.35 קראט סה״כ", price: 4200 },
      { label: "0.50 קראט סה״כ", price: 5600 },
    ],
    description:
      "טבעת נישואין בקשת רכה שנועדה להיצמד לסל של טבעת אירוסין. היהלומים משובצים בחצי הקדמי והחלק האחורי נשאר חלק להתאמת מידה.",
  }),
  newCatalogProduct({
    slug: "mosaic-baguette-band",
    name: "טבעת בגט ״מוזאיק״",
    subtitle: "בגט ועגול לסירוגין · חצי איטרניטי",
    category: "rings",
    diamondShape: "emerald",
    art: "pave",
    priceFrom: 4500,
    carats: [
      { label: "0.45 קראט סה״כ", price: 4500 },
      { label: "0.70 קראט סה״כ", price: 6200 },
      { label: "1.00 קראט סה״כ", price: 7900 },
    ],
    description:
      "יהלומי בגט ויהלומים עגולים מסודרים לסירוגין לאורך חצי החישוק. מסגרות דקות מפרידות בין החיתוכים ושומרות על קו אחיד לאורך הטבעת.",
  }),
  newCatalogProduct({
    slug: "aria-oval-studs",
    name: "עגילי אובל ״אריה״",
    subtitle: "זוג יהלומים אובליים · ארבע שיניים",
    category: "earrings",
    diamondShape: "oval",
    art: "studs",
    priceFrom: 3400,
    carats: [
      { label: "0.50 קראט סה״כ", price: 3400 },
      { label: "1.00 קראט סה״כ", price: 5800 },
      { label: "1.50 קראט סה״כ", price: 8600 },
      { label: "2.00 קראט סה״כ", price: 11200 },
    ],
    description:
      "שני יהלומי אובל תואמים בסלי ארבע שיניים, עם מוט ישר וסוגר פרפר. הכיוון האנכי מאריך את הצללית ושומר על מרחק נקי מתנוך האוזן.",
    bestseller: true,
  }),
  newCatalogProduct({
    slug: "orbit-bezel-studs",
    name: "עגילי בזל ״אורביט״",
    subtitle: "יהלומים עגולים · מסגרת מלאה",
    category: "earrings",
    diamondShape: "round",
    art: "studs",
    priceFrom: 3200,
    carats: [
      { label: "0.50 קראט סה״כ", price: 3200 },
      { label: "1.00 קראט סה״כ", price: 5200 },
      { label: "1.50 קראט סה״כ", price: 7900 },
      { label: "2.00 קראט סה״כ", price: 10400 },
    ],
    description:
      "כל יהלום מוקף מסגרת בזל דקה שמגינה על ההיקף ויוצרת קצה חלק. הגב פתוח לאור ומתחבר למוט ישר עם סוגר פרפר.",
  }),
  newCatalogProduct({
    slug: "petite-diamond-huggies",
    name: "חישוקי האגי ״פטיט״",
    subtitle: "חישוק קטן · שורת פאווה קדמית",
    category: "earrings",
    art: "hoops",
    priceFrom: 3600,
    carats: [
      { label: "0.20 קראט סה״כ", price: 3600 },
      { label: "0.35 קראט סה״כ", price: 4900 },
      { label: "0.50 קראט סה״כ", price: 6800 },
    ],
    description:
      "חישוקים קטנים שיושבים קרוב לתנוך, עם שורת יהלומים בחזית וסגירת קליק משולבת. החלק הפנימי מלוטש כדי לשמור על מגע חלק.",
    bestseller: true,
  }),
  newCatalogProduct({
    slug: "inside-out-diamond-hoops",
    name: "חישוקי Inside-Out ״קונטור״",
    subtitle: "יהלומים בחזית ובחלק הפנימי האחורי",
    category: "earrings",
    art: "hoops",
    priceFrom: 6200,
    carats: [
      { label: "1.00 קראט סה״כ", price: 6200 },
      { label: "1.50 קראט סה״כ", price: 8900 },
      { label: "2.50 קראט סה״כ", price: 12900 },
    ],
    description:
      "יהלומים משובצים בחלק החיצוני הקדמי ובחלק הפנימי האחורי של כל חישוק, כך שנוצרת שורת אור רציפה במבט חזיתי. הסגירה הצירית נטמעת בפרופיל.",
  }),
  newCatalogProduct({
    slug: "cascade-graduated-tennis-necklace",
    name: "שרשרת טניס מדורגת ״קסקייד״",
    subtitle: "יהלומים גדלים בהדרגה אל המרכז",
    category: "necklaces",
    art: "tennis-necklace",
    priceFrom: 17900,
    carats: [
      { label: "5.00 קראט סה״כ", price: 17900 },
      { label: "8.00 קראט סה״כ", price: 26900 },
      { label: "12.00 קראט סה״כ", price: 35900 },
    ],
    description:
      "שורת יהלומים עגולים שגדלים בהדרגה משני הצדדים אל מרכז השרשרת. החוליות גמישות והסוגר הוא סוגר קופסה עם אבטחה נוספת.",
    featured: true,
    bestseller: true,
  }),
  newCatalogProduct({
    slug: "constellation-station-necklace",
    name: "שרשרת יהלומים ״קונסטליישן״",
    subtitle: "יהלומי בזל במרווחים קבועים",
    category: "necklaces",
    art: "bezel-pendant",
    priceFrom: 5900,
    carats: [
      { label: "1.00 קראט סה״כ", price: 5900 },
      { label: "1.50 קראט סה״כ", price: 8500 },
      { label: "2.50 קראט סה״כ", price: 11900 },
    ],
    description:
      "יהלומים עגולים בשיבוץ בזל משולבים לאורך שרשרת עדינה במרווחים מדודים. כל בית אבן מחובר משני צדדיו כדי לשמור על כיוון יציב.",
  }),
  newCatalogProduct({
    slug: "east-west-oval-pendant",
    name: "תליון אובל ״איסט־ווסט״",
    subtitle: "אובל לרוחב · שיבוץ בזל",
    category: "necklaces",
    diamondShape: "oval",
    art: "bezel-pendant",
    priceFrom: 3900,
    carats: [
      { label: "0.50 קראט", price: 3900 },
      { label: "0.80 קראט", price: 5900 },
      { label: "1.20 קראט", price: 8500 },
    ],
    description:
      "יהלום אובל מוצב לרוחב בתוך מסגרת בזל דקה, עם חיבור נסתר לשרשרת משני צדי הבית. המבנה שומר את התליון ישר ומפחית סיבוב בזמן ענידה.",
  }),
  newCatalogProduct({
    slug: "pear-solitaire-pendant",
    name: "תליון טיפה ״סול״",
    subtitle: "יהלום טיפה · סל שלוש שיניים",
    category: "necklaces",
    diamondShape: "pear",
    art: "pendant",
    priceFrom: 3600,
    carats: [
      { label: "0.50 קראט", price: 3600 },
      { label: "0.80 קראט", price: 5600 },
      { label: "1.20 קראט", price: 8200 },
    ],
    description:
      "יהלום טיפה בסל שלוש שיניים, עם הגנה מלאה לקצה המחודד ולולאת חיבור קטנה מעל האבן. השרשרת עוברת בחופשיות ומאפשרת לתליון להתיישר במרכז.",
  }),
  newCatalogProduct({
    slug: "fine-two-prong-tennis-bracelet",
    name: "צמיד טניס ״פיין״",
    subtitle: "שיבוץ ארבע שיניים פתוח · קו יהלומים קל",
    category: "bracelets",
    art: "tennis-bracelet",
    priceFrom: 6900,
    carats: [
      { label: "2.00 קראט סה״כ", price: 6900 },
      { label: "3.00 קראט סה״כ", price: 9900 },
      { label: "5.00 קראט סה״כ", price: 13900 },
    ],
    description:
      "כל יהלום מוחזק בארבע שיניים דקות שמותירות את צדי האבן פתוחים לאור. החוליות גמישות והצמיד נסגר בסוגר קופסה עם לשונית בטיחות.",
    featured: true,
    bestseller: true,
  }),
  newCatalogProduct({
    slug: "emerald-bezel-tennis-bracelet",
    name: "צמיד אמרלד ״מסגרת״",
    subtitle: "אבני אמרלד לרוחב · בזל מלא",
    category: "bracelets",
    art: "tennis-bracelet",
    priceFrom: 14900,
    carats: [
      { label: "4.00 קראט סה״כ", price: 14900 },
      { label: "6.00 קראט סה״כ", price: 20900 },
      { label: "9.00 קראט סה״כ", price: 28900 },
    ],
    description:
      "יהלומי אמרלד מוצבים לרוחב בתוך מסגרות בזל מחוברות. החיבורים מוסתרים בין הבתים כדי לשמור על רצף מלבני וסיבוב חופשי סביב פרק היד.",
  }),
  newCatalogProduct({
    slug: "crescendo-graduated-tennis-bracelet",
    name: "צמיד טניס מדורג ״קרשנדו״",
    subtitle: "יהלומים גדלים בהדרגה אל המרכז",
    category: "bracelets",
    art: "tennis-bracelet",
    priceFrom: 9900,
    carats: [
      { label: "3.00 קראט סה״כ", price: 9900 },
      { label: "5.00 קראט סה״כ", price: 14900 },
      { label: "8.00 קראט סה״כ", price: 20900 },
    ],
    description:
      "יהלומים עגולים מדורגים בגודל משני צדי הצמיד אל אבן מרכזית גדולה יותר. החוליות נשארות גמישות והסוגר נטמע בקו השיבוץ.",
  }),
  newCatalogProduct({
    slug: "crossline-diamond-bangle",
    name: "צמיד קרוס ״קרוסליין״",
    subtitle: "שתי זרועות מצטלבות · פאווה בחזית",
    category: "bracelets",
    art: "bangle",
    priceFrom: 5200,
    carats: [
      { label: "0.50 קראט סה״כ", price: 5200 },
      { label: "0.80 קראט סה״כ", price: 7600 },
      { label: "1.20 קראט סה״כ", price: 10900 },
    ],
    description:
      "צמיד קשיח סגור ששתי זרועותיו מצטלבות פעם אחת בחזית; אחת מלוטשת והשנייה משובצת יהלומי פאווה. הציר והנעילה מוסתרים בחלק האחורי.",
  }),
];

export const products: Product[] = catalogProducts.map((product) => {
  const defaultMetal: Metal = product.category === "rings" ? "yellow" : "white";
  return {
    ...product,
    metals: ["yellow", "white"],
    defaultMetal,
    galleryByMetal: {
      yellow: metalGallery(product.slug, product.name, "yellow"),
      white: metalGallery(product.slug, product.name, "white"),
    },
  };
});

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
