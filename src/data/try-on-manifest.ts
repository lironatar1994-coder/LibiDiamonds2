export type TryOnRenderMode = "generated-band" | "setting-overlay" | "band-overlay";

export interface TryOnManifestEntry {
  slug: string;
  renderMode: TryOnRenderMode;
  assetAnchor?: "top" | "bottom";
  assetCrop?: "setting" | "band" | "side-strip";
}

const bandSlugs = new Set([
  "contour-diamond-band",
  "mosaic-baguette-band",
  "etoile-shared-prong-eternity-ring",
  "ellipse-oval-eternity-band",
  "romy-emerald-half-eternity-band",
  "circa-round-bezel-eternity-band",
  "quint-five-stone-ring",
  "cadre-channel-diamond-band",
]);

const topAnchorSlugs = new Set([
  "elara-oval-hidden-halo-ring",
  "atelier-emerald-cathedral-ring",
  "celeste-radiant-pave-ring",
  "axis-princess-solitaire-ring",
  "heritage-six-prong-ring",
  "sienna-oval-pave-ring",
  "verona-round-bezel-ring",
  "elan-east-west-marquise-ring",
  "solis-round-hidden-halo-ring",
  "elise-french-pave-cathedral-ring",
  "vesper-knife-edge-solitaire-ring",
  "aveline-scalloped-pave-ring",
  "arco-split-shank-ring",
  "delphine-double-halo-ring",
  "orelia-oval-halo-ring",
  "coda-east-west-oval-wide-ring",
  "fleur-pear-halo-ring",
  "amelie-cushion-halo-ring",
  "forme-radiant-bezel-ring",
  "talia-emerald-baguette-three-stone-ring",
  "calista-cushion-trapezoid-three-stone-ring",
  "amara-vintage-milgrain-ring",
  "mira-bezel-toi-et-moi-ring",
  "quint-five-stone-ring",
]);

export const tryOnManifest: TryOnManifestEntry[] = [
  "aura-solitaire-ring",
  "nova-halo-ring",
  "trio-three-stone-ring",
  "lumiere-pave-ring",
  "elara-oval-hidden-halo-ring",
  "atelier-emerald-cathedral-ring",
  "marais-marquise-solitaire-ring",
  "celeste-radiant-pave-ring",
  "velour-cushion-solitaire-ring",
  "seren-pear-solitaire-ring",
  "axis-princess-solitaire-ring",
  "deco-asscher-bezel-ring",
  "heritage-six-prong-ring",
  "ribbon-twist-pave-ring",
  "contour-diamond-band",
  "mosaic-baguette-band",
  "sienna-oval-pave-ring",
  "verona-round-bezel-ring",
  "duet-toi-et-moi-ring",
  "lumi-emerald-halo-ring",
  "noa-radiant-solitaire-ring",
  "elan-east-west-marquise-ring",
  "vela-oval-three-stone-ring",
  "etoile-shared-prong-eternity-ring",
  "solis-round-hidden-halo-ring",
  "elise-french-pave-cathedral-ring",
  "vesper-knife-edge-solitaire-ring",
  "aveline-scalloped-pave-ring",
  "arco-split-shank-ring",
  "delphine-double-halo-ring",
  "orelia-oval-halo-ring",
  "lune-oval-bezel-ring",
  "coda-east-west-oval-wide-ring",
  "fleur-pear-halo-ring",
  "amelie-cushion-halo-ring",
  "forme-radiant-bezel-ring",
  "riva-emerald-bezel-ring",
  "talia-emerald-baguette-three-stone-ring",
  "nessa-oval-pear-three-stone-ring",
  "calista-cushion-trapezoid-three-stone-ring",
  "odette-oval-ballerina-ring",
  "amara-vintage-milgrain-ring",
  "mira-bezel-toi-et-moi-ring",
  "ligne-east-west-emerald-half-bezel-ring",
  "ellipse-oval-eternity-band",
  "romy-emerald-half-eternity-band",
  "circa-round-bezel-eternity-band",
  "quint-five-stone-ring",
  "cadre-channel-diamond-band",
].map((slug) => ({
  slug,
  renderMode: slug === "aura-solitaire-ring"
    ? "generated-band"
    : bandSlugs.has(slug)
      ? "band-overlay"
      : "setting-overlay",
  assetAnchor: topAnchorSlugs.has(slug) ? "top" : "bottom",
  assetCrop: slug === "cadre-channel-diamond-band"
    ? "side-strip"
    : bandSlugs.has(slug)
      ? "band"
      : "setting",
}));

const entriesBySlug = new Map(tryOnManifest.map((entry) => [entry.slug, entry]));

export function tryOnEntryForSlug(slug: string): TryOnManifestEntry | undefined {
  return entriesBySlug.get(slug);
}
