import Image from "next/image";
import type { CatalogStyle } from "@/data/products";
import { assetPath } from "@/lib/site";

export type RingAtelierStyle = Extract<CatalogStyle, "solitaire" | "halo" | "multi-stone" | "band">;

const ringAssets: Record<RingAtelierStyle, string> = {
  solitaire: "/images/products/catalog/aura-solitaire-ring-white-primary.webp",
  halo: "/images/products/catalog/nova-halo-ring-white-primary.webp",
  "multi-stone": "/images/products/catalog/trio-three-stone-ring-white-primary.webp",
  band: "/images/products/catalog/etoile-shared-prong-eternity-ring-white-primary.webp",
};

const ringScale: Record<RingAtelierStyle, string> = {
  solitaire: "scale-[1.68]",
  halo: "scale-[1.64]",
  "multi-stone": "scale-[1.56]",
  band: "scale-[1.54]",
};

export default function RingStyleAtelierIllustration({
  style,
  active,
}: {
  style: RingAtelierStyle;
  active: boolean;
}) {
  return (
    <span className="relative block h-full w-full" aria-hidden="true">
      <span
        className={`absolute inset-x-[12%] bottom-[12%] h-[22%] rounded-[50%] bg-black/30 blur-md transition-opacity duration-300 ${
          active ? "opacity-80" : "opacity-55"
        }`}
      />
      <Image
        src={assetPath(ringAssets[style])}
        alt=""
        fill
        sizes="(min-width: 640px) 220px, 46vw"
        className={`object-contain drop-shadow-[0_8px_8px_rgba(0,8,14,0.48)] transition-[transform,filter,opacity] duration-500 ${
          ringScale[style]
        } ${
          active
            ? "opacity-100 drop-shadow-[0_9px_10px_rgba(0,7,13,0.62)]"
            : "opacity-[0.88] saturate-[0.88] group-hover:opacity-100 group-hover:saturate-100"
        }`}
      />
    </span>
  );
}
