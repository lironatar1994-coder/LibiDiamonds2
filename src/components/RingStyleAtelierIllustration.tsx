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
  solitaire: "scale-[1.32]",
  halo: "scale-[1.24]",
  "multi-stone": "scale-[1.18]",
  band: "scale-[1.22]",
};

export default function RingStyleAtelierIllustration({
  style,
  active,
}: {
  style: RingAtelierStyle;
  active: boolean;
}) {
  return (
    <span
      className={`relative block h-[6.5rem] w-[6.5rem] transition-transform duration-500 ease-out motion-reduce:transition-none sm:h-[8.25rem] sm:w-[8.25rem] ${
        active ? "scale-[1.035]" : "scale-100 group-hover:scale-[1.025]"
      }`}
      aria-hidden="true"
    >
      <span className="absolute -inset-1">
        <Image
          src={assetPath(ringAssets[style])}
          alt=""
          fill
          priority
          sizes="(min-width: 640px) 132px, 104px"
          className={`object-contain drop-shadow-[0_10px_9px_rgba(22,35,43,0.2)] ${ringScale[style]}`}
        />
      </span>
    </span>
  );
}
