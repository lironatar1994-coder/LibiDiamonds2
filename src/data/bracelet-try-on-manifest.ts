export type BraceletTryOnRenderMode = "tennis-loop" | "station-loop" | "rigid-bangle";

export interface BraceletTryOnManifestEntry {
  slug: string;
  renderMode: BraceletTryOnRenderMode;
  clearanceRatio: number;
  assetWidthRatio: number;
}

const tennis = [
  "icon-tennis-bracelet",
  "fine-two-prong-tennis-bracelet",
  "emerald-bezel-tennis-bracelet",
  "crescendo-graduated-tennis-bracelet",
  "orbit-round-bezel-tennis-bracelet",
  "elara-oval-tennis-bracelet",
  "architect-baguette-tennis-bracelet",
  "duo-double-row-tennis-bracelet",
];

export const braceletTryOnManifest: BraceletTryOnManifestEntry[] = [
  ...tennis.map((slug) => ({
    slug,
    renderMode: "tennis-loop" as const,
    clearanceRatio: 1.1,
    assetWidthRatio: 0.9,
  })),
  {
    slug: "constellation-station-bracelet",
    renderMode: "station-loop",
    clearanceRatio: 1.1,
    assetWidthRatio: 0.9,
  },
  {
    slug: "one-diamond-bangle",
    renderMode: "rigid-bangle",
    clearanceRatio: 1.14,
    assetWidthRatio: 0.9,
  },
  {
    slug: "crossline-diamond-bangle",
    renderMode: "rigid-bangle",
    clearanceRatio: 1.14,
    assetWidthRatio: 0.9,
  },
];

const entriesBySlug = new Map(braceletTryOnManifest.map((entry) => [entry.slug, entry]));

export function braceletTryOnEntryForSlug(slug: string): BraceletTryOnManifestEntry | undefined {
  return entriesBySlug.get(slug);
}
