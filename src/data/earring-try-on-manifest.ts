export type EarringTryOnRenderMode = "stud" | "halo-stud" | "huggie" | "hoop";

export interface EarringTryOnCrop {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface EarringTryOnManifestEntry {
  slug: string;
  renderMode: EarringTryOnRenderMode;
  referenceCarat: string;
  referenceWidthMm: number;
  referenceHeightMm: number;
  anchorY: number;
  crop: EarringTryOnCrop;
  frontSide?: "left" | "right";
  faceMask?: { cx: number; cy: number; rx: number; ry: number };
}

export const earringTryOnManifest: EarringTryOnManifestEntry[] = [
  {
    slug: "stella-diamond-studs",
    renderMode: "stud",
    referenceCarat: "1.00",
    referenceWidthMm: 5.1,
    referenceHeightMm: 5.1,
    anchorY: 0.5,
    crop: { left: 785, top: 600, width: 410, height: 430 },
    faceMask: { cx: 165, cy: 255, rx: 150, ry: 165 },
  },
  {
    slug: "glow-halo-earrings",
    renderMode: "halo-stud",
    referenceCarat: "1.00",
    referenceWidthMm: 8.2,
    referenceHeightMm: 8.2,
    anchorY: 0.5,
    crop: { left: 800, top: 520, width: 520, height: 520 },
  },
  {
    slug: "aria-oval-studs",
    renderMode: "stud",
    referenceCarat: "1.00",
    referenceWidthMm: 4.7,
    referenceHeightMm: 6.5,
    anchorY: 0.5,
    crop: { left: 815, top: 455, width: 500, height: 670 },
    faceMask: { cx: 205, cy: 335, rx: 185, ry: 310 },
  },
  {
    slug: "orbit-bezel-studs",
    renderMode: "stud",
    referenceCarat: "1.00",
    referenceWidthMm: 5.9,
    referenceHeightMm: 5.9,
    anchorY: 0.5,
    crop: { left: 805, top: 545, width: 520, height: 520 },
    faceMask: { cx: 215, cy: 260, rx: 185, ry: 185 },
  },
  {
    slug: "petite-diamond-huggies",
    renderMode: "huggie",
    referenceCarat: "0.35",
    referenceWidthMm: 11.5,
    referenceHeightMm: 12,
    anchorY: 0.16,
    crop: { left: 800, top: 360, width: 560, height: 850 },
    frontSide: "left",
  },
  {
    slug: "luna-diamond-hoops",
    renderMode: "hoop",
    referenceCarat: "1.20",
    referenceWidthMm: 20,
    referenceHeightMm: 22,
    anchorY: 0.14,
    crop: { left: 820, top: 250, width: 650, height: 1120 },
    frontSide: "right",
  },
  {
    slug: "inside-out-diamond-hoops",
    renderMode: "hoop",
    referenceCarat: "1.50",
    referenceWidthMm: 25,
    referenceHeightMm: 28,
    anchorY: 0.13,
    crop: { left: 800, top: 220, width: 690, height: 1190 },
    frontSide: "left",
  },
];

const entriesBySlug = new Map(earringTryOnManifest.map((entry) => [entry.slug, entry]));

export function earringTryOnEntryForSlug(slug: string): EarringTryOnManifestEntry | undefined {
  return entriesBySlug.get(slug);
}
