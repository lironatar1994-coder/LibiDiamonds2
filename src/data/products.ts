import { assetPath } from "@/lib/site";
import { expansionProducts } from "@/data/catalog/expansion";
import { ringExpansionProducts } from "@/data/catalog/ring-expansion";
import { diamondDimensions } from "@/data/diamond-dimensions";
import { tryOnEntryForSlug, type TryOnRenderMode } from "@/data/try-on-manifest";
import {
  braceletTryOnEntryForSlug,
  type BraceletTryOnRenderMode,
} from "@/data/bracelet-try-on-manifest";
import {
  earringTryOnEntryForSlug,
  type EarringTryOnRenderMode,
} from "@/data/earring-try-on-manifest";

export type Metal = "yellow" | "white" | "rose";
export type CategorySlug = "rings" | "earrings" | "necklaces" | "bracelets";
export type CaratScope = "center" | "single" | "pair" | "total";
export type CatalogStyle =
  | "solitaire"
  | "halo"
  | "multi-stone"
  | "band"
  | "studs"
  | "hoops"
  | "drops"
  | "pendant"
  | "tennis"
  | "station"
  | "bangle";
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
  value: string;
  price: number;
}

export interface ProductGalleryImage {
  src: string;
  alt: string;
  view?: "primary" | "angle" | "profile" | "detail";
  legacy?: boolean;
  objectPosition?: string;
}

export interface ProductHighlight {
  title: string;
  detail: string;
}

export interface ProductDimension {
  label: string;
  value: string;
}

export interface TryOnAssetPair {
  head?: string;
  overlay?: string;
}

export interface TryOnLayeredAssetPair {
  setting?: string;
  front?: string;
  rear?: string;
}

export interface RingTryOnConfig {
  version: 3;
  target: "finger";
  enabled: boolean;
  renderMode: TryOnRenderMode;
  scaleModel: "center-stone" | "setting-footprint" | "band-width";
  shape: DiamondShape;
  referenceCarat: string;
  referenceWidthMm: number;
  defaultRingSize?: number;
  assetStoneRatio?: number;
  assetsByMetal: Partial<Record<Metal, TryOnAssetPair>>;
  layeredAssetsByMetal: Partial<Record<Metal, TryOnLayeredAssetPair>>;
}

export interface BraceletTryOnConfig {
  version: 1;
  target: "wrist";
  enabled: boolean;
  renderMode: BraceletTryOnRenderMode;
  referenceCarat: string;
  referenceWidthMm: number;
  clearanceRatio: number;
  assetWidthRatio: number;
  assetsByMetal: Partial<Record<Metal, TryOnAssetPair>>;
  layeredAssetsByMetal: Partial<Record<Metal, TryOnLayeredAssetPair>>;
}

export interface EarringTryOnConfig {
  version: 1;
  target: "ear";
  enabled: boolean;
  renderMode: EarringTryOnRenderMode;
  shape: DiamondShape;
  referenceCarat: string;
  referenceWidthMm: number;
  referenceHeightMm: number;
  anchorY: number;
  layeredAssetsByMetal: Partial<Record<Metal, TryOnLayeredAssetPair>>;
}

export type TryOnConfig = RingTryOnConfig | BraceletTryOnConfig | EarringTryOnConfig;

export interface ProductSpinAsset {
  basePath: string;
  frameCount: 24;
  posterFrame: number;
  alt: string;
}

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  category: CategorySlug;
  diamondShape?: DiamondShape;
  art: ArtType;
  style?: CatalogStyle;
  priceFrom: number;
  caratScope: CaratScope;
  carats: CaratOption[];
  metals: Metal[];
  ringSizes?: number[];
  defaultMetal?: Metal;
  specs: {
    color: string;
    clarity: string;
    cut: string;
    cert: string;
  };
  description: string;
  highlights?: ProductHighlight[];
  dimensions?: ProductDimension[];
  gallery?: ProductGalleryImage[];
  galleryByMetal?: Partial<Record<Metal, ProductGalleryImage[]>>;
  spinByMetal?: Partial<Record<Metal, ProductSpinAsset>>;
  tryOn?: TryOnConfig;
  featured?: boolean;
  bestseller?: boolean;
}

export function productSpin(
  product: Pick<Product, "spinByMetal">,
  metal: Metal,
): ProductSpinAsset | undefined {
  return product.spinByMetal?.[metal];
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

const extendedStudioMetalBySlug: Partial<Record<string, Metal>> = {
  "aura-solitaire-ring": "yellow",
  "lumiere-pave-ring": "yellow",
  "stella-diamond-studs": "white",
  "riviera-tennis-necklace": "white",
  "icon-tennis-bracelet": "white",
};

function productMetalGallery(product: CatalogProduct, metal: Extract<Metal, "yellow" | "white">) {
  const base = metalGallery(product.slug, product.name, metal);
  if (extendedStudioMetalBySlug[product.slug] !== metal) return base;

  return [
    base[0],
    {
      src: `/images/products/v2/${product.slug}-detail.webp`,
      alt: `${product.name} - מבט פרופיל בסטודיו`,
      view: "profile" as const,
    },
    base[1],
    {
      src: `/images/products/v2/${product.slug}-primary.webp`,
      alt: `${product.name} - מבט חזיתי בסטודיו`,
      view: "angle" as const,
    },
  ];
}

const highlightsByArt: Record<ArtType, ProductHighlight[]> = {
  solitaire: [
    { title: "שיבוץ פתוח לאור", detail: "השיניים מחזיקות את האבן בלי להסתיר את קווי המתאר שלה." },
    { title: "חישוק נקי", detail: "הפרופיל המאופק משאיר את היהלום כנקודת המוקד." },
  ],
  halo: [
    { title: "מסגרת היילו אחידה", detail: "שורת יהלומים צפופה מקיפה את האבן המרכזית בקו רציף." },
    { title: "פרופיל מאוזן", detail: "הסל מחבר בין ההיילו לחישוק בלי להכביד על המבנה." },
  ],
  "three-stone": [
    { title: "שלוש אבנים בקו אחד", detail: "אבני הצד מלוות את האבן המרכזית ושומרות על סימטריה." },
    { title: "מעבר מדורג", detail: "הפרופורציות יורדות בעדינות מהמרכז אל כתפי הטבעת." },
  ],
  pave: [
    { title: "פאווה לאורך הכתפיים", detail: "אבנים קטנות משובצות בצפיפות משני צדי האבן המרכזית." },
    { title: "קו חישוק עדין", detail: "השיבוץ נשאר נמוך כדי לשמור על מראה קל ונקי." },
  ],
  studs: [
    { title: "זוג שנבחר יחד", detail: "האבנים מותאמות זו לזו במידות, בגוון ובניקיון." },
    { title: "סל פתוח", detail: "המבנה מציג את האבן גם מהצד ושומר על פרופיל מדויק." },
  ],
  hoops: [
    { title: "שורת אור קדמית", detail: "היהלומים ממוקמים בחזית החישוק ונשארים גלויים במבט ישר." },
    { title: "סגירה משולבת", detail: "הציר והנעילה נטמעים בקו החישוק במקום לקטוע אותו." },
  ],
  "tennis-necklace": [
    { title: "רצף יהלומים גמיש", detail: "החוליות נעות זו לצד זו כדי שהשרשרת תשב בקו אחיד." },
    { title: "סוגר מאובטח", detail: "סוגר קופסה עם מנגנון נוסף משתלב בשורת היהלומים." },
  ],
  pendant: [
    { title: "אבן מרכזית פתוחה", detail: "הסל חושף את צדי היהלום ושומר עליו במרכז השרשרת." },
    { title: "חיבור מאוזן", detail: "לולאת החיבור מאפשרת לתליון להתיישר בזמן ענידה." },
  ],
  "bezel-pendant": [
    { title: "מסגרת בזל מלאה", detail: "שפת זהב דקה מקיפה את האבן ויוצרת קצה חלק." },
    { title: "חיבור צדדי", detail: "השרשרת מתחברת משני הצדדים ושומרת את האבן בכיוון הנכון." },
  ],
  "tennis-bracelet": [
    { title: "חוליות גמישות", detail: "כל בית אבן נע באופן עצמאי כדי לעקוב אחר קו פרק היד." },
    { title: "נעילה כפולה", detail: "סוגר קופסה ומנגנון אבטחה שומרים על רצף נקי וסגור." },
  ],
  bangle: [
    { title: "מבנה קשיח ומדויק", detail: "הצמיד שומר על הצורה שלו ומציג את האבן בחזית." },
    { title: "גימור פנימי חלק", detail: "החלק הפנימי מלוטש כדי לשמור על מגע נקי בזמן ענידה." },
  ],
};

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

export type CatalogProduct = Omit<Product, "caratScope"> & { caratScope?: CaratScope };

type NewCatalogProduct = Omit<CatalogProduct, "metals" | "specs"> & {
  specs?: Product["specs"];
};

function newCatalogProduct(product: NewCatalogProduct): CatalogProduct {
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

const catalogProducts: CatalogProduct[] = [
  {
    slug: "aura-solitaire-ring",
    name: "טבעת סוליטר ״אורה״",
    subtitle: "יהלום מעבדה עגול · שיבוץ 4 שיניים",
    category: "rings",
    diamondShape: "round",
    art: "solitaire",
    priceFrom: 4900,
    carats: [
      { value: "0.70", price: 4900 },
      { value: "1.00", price: 6400 },
      { value: "1.50", price: 8900 },
      { value: "2.00", price: 11900 },
    ],
    metals: ["yellow", "white", "rose"],
    specs: { color: "E–F", clarity: "VS1", cut: "Excellent", cert: "IGI" },
    description:
      "יהלום עגול מורם בשיבוץ ארבע שיניים על חישוק זהב חלק ומעוגל — עיצוב קלאסי שנוח לענידה יומיומית.",
    dimensions: [
      { label: "רוחב החישוק", value: "כ־1.8 מ״מ" },
      { label: "פרופיל", value: "מורם" },
    ],
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
      { value: "0.70", price: 6400 },
      { value: "1.00", price: 7900 },
      { value: "1.50", price: 10400 },
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
      { value: "1.00", price: 7800 },
      { value: "1.50", price: 10200 },
      { value: "2.00", price: 13400 },
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
      { value: "0.70", price: 5600 },
      { value: "1.00", price: 7200 },
      { value: "1.50", price: 9800 },
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
      { value: "0.50", price: 2900 },
      { value: "1.00", price: 4900 },
      { value: "1.50", price: 7400 },
      { value: "2.00", price: 9800 },
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
      { value: "0.60", price: 4200 },
      { value: "1.00", price: 6100 },
      { value: "1.60", price: 8900 },
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
      { value: "0.75", price: 5200 },
      { value: "1.20", price: 7300 },
      { value: "2.00", price: 10900 },
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
      { value: "5.00", price: 16900 },
      { value: "8.00", price: 24900 },
      { value: "11.00", price: 33900 },
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
      { value: "0.30", price: 2400 },
      { value: "0.50", price: 3400 },
      { value: "1.00", price: 5900 },
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
      { value: "0.40", price: 2900 },
      { value: "0.70", price: 4400 },
      { value: "1.00", price: 6200 },
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
      { value: "3.00", price: 8900 },
      { value: "5.00", price: 13900 },
      { value: "7.00", price: 18900 },
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
      { value: "0.30", price: 2900 },
      { value: "0.50", price: 3900 },
      { value: "1.00", price: 6400 },
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
      { value: "1.00", price: 6900 },
      { value: "1.50", price: 9400 },
      { value: "2.00", price: 12400 },
      { value: "3.00", price: 17400 },
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
      { value: "1.00", price: 6800 },
      { value: "1.50", price: 9300 },
      { value: "2.00", price: 12300 },
      { value: "3.00", price: 17200 },
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
      { value: "1.00", price: 6600 },
      { value: "1.50", price: 9100 },
      { value: "2.00", price: 12100 },
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
      { value: "1.00", price: 7600 },
      { value: "1.50", price: 10200 },
      { value: "2.00", price: 13600 },
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
      { value: "1.00", price: 6500 },
      { value: "1.50", price: 8900 },
      { value: "2.00", price: 11900 },
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
      { value: "1.00", price: 6600 },
      { value: "1.50", price: 9200 },
      { value: "2.00", price: 12300 },
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
      { value: "1.00", price: 6200 },
      { value: "1.50", price: 8500 },
      { value: "2.00", price: 11300 },
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
      { value: "1.00", price: 7300 },
      { value: "1.50", price: 9900 },
      { value: "2.00", price: 13200 },
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
      { value: "0.70", price: 5000 },
      { value: "1.00", price: 6500 },
      { value: "1.50", price: 9000 },
      { value: "2.00", price: 12000 },
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
      { value: "0.70", price: 5900 },
      { value: "1.00", price: 7500 },
      { value: "1.50", price: 10100 },
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
      { value: "0.20", price: 3200 },
      { value: "0.35", price: 4200 },
      { value: "0.50", price: 5600 },
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
      { value: "0.45", price: 4500 },
      { value: "0.70", price: 6200 },
      { value: "1.00", price: 7900 },
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
      { value: "0.50", price: 3400 },
      { value: "1.00", price: 5800 },
      { value: "1.50", price: 8600 },
      { value: "2.00", price: 11200 },
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
      { value: "0.50", price: 3200 },
      { value: "1.00", price: 5200 },
      { value: "1.50", price: 7900 },
      { value: "2.00", price: 10400 },
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
      { value: "0.20", price: 3600 },
      { value: "0.35", price: 4900 },
      { value: "0.50", price: 6800 },
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
      { value: "1.00", price: 6200 },
      { value: "1.50", price: 8900 },
      { value: "2.50", price: 12900 },
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
      { value: "5.00", price: 17900 },
      { value: "8.00", price: 26900 },
      { value: "12.00", price: 35900 },
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
      { value: "1.00", price: 5900 },
      { value: "1.50", price: 8500 },
      { value: "2.50", price: 11900 },
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
      { value: "0.50", price: 3900 },
      { value: "0.80", price: 5900 },
      { value: "1.20", price: 8500 },
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
      { value: "0.50", price: 3600 },
      { value: "0.80", price: 5600 },
      { value: "1.20", price: 8200 },
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
      { value: "2.00", price: 6900 },
      { value: "3.00", price: 9900 },
      { value: "5.00", price: 13900 },
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
      { value: "4.00", price: 14900 },
      { value: "6.00", price: 20900 },
      { value: "9.00", price: 28900 },
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
      { value: "3.00", price: 9900 },
      { value: "5.00", price: 14900 },
      { value: "8.00", price: 20900 },
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
      { value: "0.50", price: 5200 },
      { value: "0.80", price: 7600 },
      { value: "1.20", price: 10900 },
    ],
    description:
      "צמיד קשיח סגור ששתי זרועותיו מצטלבות פעם אחת בחזית; אחת מלוטשת והשנייה משובצת יהלומי פאווה. הציר והנעילה מוסתרים בחלק האחורי.",
  }),
  ...expansionProducts,
  ...ringExpansionProducts,
];

const caratScopeBySlug: Record<string, CaratScope> = {
  "aura-solitaire-ring": "center",
  "nova-halo-ring": "center",
  "trio-three-stone-ring": "total",
  "lumiere-pave-ring": "center",
  "stella-diamond-studs": "pair",
  "glow-halo-earrings": "pair",
  "luna-diamond-hoops": "pair",
  "riviera-tennis-necklace": "total",
  "claire-solitaire-pendant": "single",
  "drop-bezel-necklace": "single",
  "icon-tennis-bracelet": "total",
  "one-diamond-bangle": "single",
  "elara-oval-hidden-halo-ring": "center",
  "atelier-emerald-cathedral-ring": "center",
  "marais-marquise-solitaire-ring": "center",
  "celeste-radiant-pave-ring": "center",
  "velour-cushion-solitaire-ring": "center",
  "seren-pear-solitaire-ring": "center",
  "axis-princess-solitaire-ring": "center",
  "deco-asscher-bezel-ring": "center",
  "heritage-six-prong-ring": "center",
  "ribbon-twist-pave-ring": "center",
  "contour-diamond-band": "total",
  "mosaic-baguette-band": "total",
  "aria-oval-studs": "pair",
  "orbit-bezel-studs": "pair",
  "petite-diamond-huggies": "pair",
  "inside-out-diamond-hoops": "pair",
  "cascade-graduated-tennis-necklace": "total",
  "constellation-station-necklace": "total",
  "east-west-oval-pendant": "single",
  "pear-solitaire-pendant": "single",
  "fine-two-prong-tennis-bracelet": "total",
  "emerald-bezel-tennis-bracelet": "total",
  "crescendo-graduated-tennis-bracelet": "total",
  "crossline-diamond-bangle": "total",
};

function productCaratScope(slug: string): CaratScope {
  const scope = caratScopeBySlug[slug];
  if (!scope) throw new Error(`Missing carat scope for product: ${slug}`);
  return scope;
}

function productTryOnConfig(product: CatalogProduct, style: CatalogStyle): TryOnConfig | undefined {
  if (product.category === "earrings") {
    const earringEntry = earringTryOnEntryForSlug(product.slug);
    if (!earringEntry) return undefined;
    const layeredAsset = (metal: "yellow" | "white"): TryOnLayeredAssetPair => ({
      front: `/try-on/v1/earrings/${product.slug}/${metal}-front.webp`,
      rear: earringEntry.renderMode === "huggie" || earringEntry.renderMode === "hoop"
        ? `/try-on/v1/earrings/${product.slug}/${metal}-rear.webp`
        : undefined,
    });
    return {
      version: 1,
      target: "ear",
      enabled: true,
      renderMode: earringEntry.renderMode,
      shape: product.diamondShape ?? "round",
      referenceCarat: earringEntry.referenceCarat,
      referenceWidthMm: earringEntry.referenceWidthMm,
      referenceHeightMm: earringEntry.referenceHeightMm,
      anchorY: earringEntry.anchorY,
      layeredAssetsByMetal: {
        yellow: layeredAsset("yellow"),
        white: layeredAsset("white"),
      },
    };
  }

  if (product.category === "bracelets") {
    const braceletEntry = braceletTryOnEntryForSlug(product.slug);
    if (!braceletEntry) return undefined;
    const referenceCarat = product.carats[0]?.value ?? "1.00";
    const layeredAsset = (metal: "yellow" | "white"): TryOnLayeredAssetPair => ({
      front: `/try-on/v1/bracelets/${product.slug}/${metal}-front.webp`,
      rear: `/try-on/v1/bracelets/${product.slug}/${metal}-rear.webp`,
    });
    return {
      version: 1,
      target: "wrist",
      enabled: true,
      renderMode: braceletEntry.renderMode,
      referenceCarat,
      referenceWidthMm: 17.5,
      clearanceRatio: braceletEntry.clearanceRatio,
      assetWidthRatio: braceletEntry.assetWidthRatio,
      assetsByMetal: {},
      layeredAssetsByMetal: {
        yellow: layeredAsset("yellow"),
        white: layeredAsset("white"),
      },
    };
  }

  const entry = tryOnEntryForSlug(product.slug);
  if (!entry || product.category !== "rings") return undefined;

  const shape = product.diamondShape ?? "round";
  const referenceCarat = product.carats.reduce((closest, option) => (
    Math.abs(Number(option.value) - 1) < Math.abs(Number(closest.value) - 1) ? option : closest
  ), product.carats[0]).value;
  const caratScope = product.caratScope ?? productCaratScope(product.slug);
  const isBand = entry.renderMode === "band-overlay";
  const scaleModel: RingTryOnConfig["scaleModel"] = isBand
    ? "band-width"
    : caratScope === "total"
      ? "setting-footprint"
      : "center-stone";
  const centerCarat = scaleModel === "setting-footprint"
    ? Math.max(0.2, Number(referenceCarat) * 0.55)
    : Number(referenceCarat);
  const stone = diamondDimensions(shape, centerCarat);
  const stoneWidth = product.slug.includes("east-west") ? stone.length : stone.width;
  const referenceWidthMm = isBand
    ? 17.5
    : product.art === "three-stone"
      ? stoneWidth * 2.35
      : product.art === "halo"
        ? stoneWidth + 3.2
        : product.art === "pave"
          ? stoneWidth + 5
          : Math.max(9.5, stoneWidth + (style === "solitaire" ? 4 : 5));
  const fileKind = entry.renderMode === "generated-band" ? "head" : "overlay";
  const asset = (metal: "yellow" | "white"): TryOnAssetPair => ({
    [fileKind]: `/try-on/v2/rings/${product.slug}/${metal}-${fileKind}.webp`,
  });
  const layeredAsset = (metal: "yellow" | "white"): TryOnLayeredAssetPair => ({
    setting: isBand ? undefined : `/try-on/v3/rings/${product.slug}/${metal}-setting.webp`,
    front: entry.renderMode === "generated-band" ? undefined : `/try-on/v3/rings/${product.slug}/${metal}-front.webp`,
    rear: entry.renderMode === "generated-band" ? undefined : `/try-on/v3/rings/${product.slug}/${metal}-rear.webp`,
  });

  return {
    version: 3,
    target: "finger",
    enabled: true,
    renderMode: entry.renderMode,
    scaleModel,
    shape,
    referenceCarat,
    referenceWidthMm,
    defaultRingSize: 14,
    assetStoneRatio: entry.renderMode === "generated-band" ? 0.68 : undefined,
    assetsByMetal: {
      yellow: asset("yellow"),
      white: asset("white"),
    },
    layeredAssetsByMetal: {
      yellow: layeredAsset("yellow"),
      white: layeredAsset("white"),
    },
  };
}

export const products: Product[] = catalogProducts.map((product) => {
  const defaultMetal: Metal = product.category === "rings" ? "yellow" : "white";
  const styleByArt: Record<ArtType, CatalogStyle> = {
    solitaire: "solitaire",
    halo: "halo",
    "three-stone": "multi-stone",
    pave: product.category === "rings" ? "band" : "tennis",
    studs: "studs",
    hoops: "hoops",
    "tennis-necklace": "tennis",
    pendant: "pendant",
    "bezel-pendant": "pendant",
    "tennis-bracelet": "tennis",
    bangle: "bangle",
  };
  const resolvedStyle = product.style ?? styleByArt[product.art];
  return {
    ...product,
    caratScope: product.caratScope ?? productCaratScope(product.slug),
    style: resolvedStyle,
    highlights: product.highlights ?? highlightsByArt[product.art],
    metals: ["yellow", "white"],
    defaultMetal,
    galleryByMetal: {
      yellow: productMetalGallery(product, "yellow"),
      white: productMetalGallery(product, "white"),
    },
    tryOn: productTryOnConfig(product, resolvedStyle),
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
