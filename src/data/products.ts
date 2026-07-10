export type Metal = "yellow" | "white" | "rose";
export type CategorySlug = "rings" | "earrings" | "necklaces" | "bracelets";
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

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  category: CategorySlug;
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
  featured?: boolean;
  bestseller?: boolean;
}

export function productImage(product: Pick<Product, "slug">): string {
  return `/images/products/${product.slug}.webp`;
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
      "מסוליטר קלאסי ועד היילו נוצץ — טבעות יהלומי מעבדה בשיבוץ יד, בזהב 14K או 18K, עם תעודה גמולוגית לכל אבן מרכזית.",
    art: "solitaire",
  },
  {
    slug: "earrings",
    name: "עגילים",
    title: "עגילי יהלום",
    description:
      "עגילים צמודים, היילו וחישוקים משובצים — נקודת האור הקטנה שמשלימה כל הופעה, מהיום־יום ועד ערב חגיגי.",
    art: "studs",
  },
  {
    slug: "necklaces",
    name: "שרשראות",
    title: "שרשראות ותליוני יהלום",
    description:
      "תליון סוליטר עדין או שרשרת טניס מלאה — תכשיטי צוואר בקו נקי שמלווים אתכן שנים קדימה.",
    art: "pendant",
  },
  {
    slug: "bracelets",
    name: "צמידים",
    title: "צמידי יהלום",
    description:
      "צמידי טניס קלאסיים וצמידים עדינים עם יהלום בודד — פיסת נצנוץ שנועדה להישאר על היד.",
    art: "tennis-bracelet",
  },
];

export const products: Product[] = [
  {
    slug: "aura-solitaire-ring",
    name: "טבעת סוליטר ״אורה״",
    subtitle: "יהלום מעבדה עגול · שיבוץ 4 שיניים",
    category: "rings",
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
      "הסוליטר הקלאסי בגרסה המדויקת ביותר שלו: יהלום מעבדה עגול בליטוש Excellent, מורם על ראש עדין בארבע שיניים שמכניס מקסימום אור לאבן. חישוק דק ומעוגל שנעים לענוד כל יום — והאבן עושה את כל העבודה.",
    featured: true,
    bestseller: true,
  },
  {
    slug: "nova-halo-ring",
    name: "טבעת היילו ״נובה״",
    subtitle: "אבן מרכזית מוקפת יהלומים · נוכחות מקסימלית",
    category: "rings",
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
      "עיטור היילו — עיגול יהלומים קטנים סביב האבן המרכזית — גורם לאבן להיראות גדולה בכשליש ומגביר את הנצנוץ מכל זווית. הבחירה של מי שרוצה נוכחות, בלי לוותר על עדינות הקו.",
    featured: true,
    bestseller: true,
  },
  {
    slug: "trio-three-stone-ring",
    name: "טבעת שלוש אבנים ״טריו״",
    subtitle: "עבר · הווה · עתיד",
    category: "rings",
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
    featured: true,
  },
  {
    slug: "lumiere-pave-ring",
    name: "טבעת פאווה ״לומייר״",
    subtitle: "חישוק משובץ יהלומים · אור לאורך כל הדרך",
    category: "rings",
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
      "אבן מרכזית על חישוק משובץ יהלומים קטנים בשיבוץ פאווה צפוף. הטבעת נוצצת מכל כיוון, גם כשהיד בתנועה — עיצוב עשיר שנשאר עדין.",
    bestseller: true,
  },
  {
    slug: "stella-diamond-studs",
    name: "עגילים צמודים ״סטלה״",
    subtitle: "זוג יהלומי מעבדה עגולים · קלאסיקה יומיומית",
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
      "העגיל הראשון שכל אחת צריכה: זוג יהלומי מעבדה עגולים בשיבוץ שיניים עדין, על סוגר בורג נוח ובטוח. מהבוקר במשרד ועד ערב חתונה — הם פשוט תמיד נכונים.",
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
  },
  {
    slug: "luna-diamond-hoops",
    name: "חישוקי יהלומים ״לונה״",
    subtitle: "חישוק קלאסי משובץ · תנועה ואור",
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
      "חישוק זהב בקוטר מדויק — לא קטן מדי, לא דרמטי מדי — משובץ יהלומי מעבדה לכל אורך החזית. זז עם התנועה שלך ותופס אור בכל צעד.",
    bestseller: true,
  },
  {
    slug: "riviera-tennis-necklace",
    name: "שרשרת טניס ״ריביירה״",
    subtitle: "שורת יהלומים רציפה · הצהרה שקטה",
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
      "שורה רציפה של יהלומי מעבדה עגולים, משובצים אחד־אחד בשיבוץ ידני. פריט שעד לא מזמן היה שמור למעטים — והיום, בזכות יהלומי מעבדה, אפשרי באמת. הפריט הנחשק ביותר שלנו.",
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
  },
  {
    slug: "icon-tennis-bracelet",
    name: "צמיד טניס ״אייקון״",
    subtitle: "הקלאסיקה המוחלטת · יהלום אחרי יהלום",
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
      "צמיד הטניס הוא אחד הפריטים הבודדים שאף פעם לא יוצאים מהאופנה. שורת יהלומי מעבדה זהים, סוגר בטיחות כפול, ונצנוץ שרואים מהצד השני של החדר.",
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
