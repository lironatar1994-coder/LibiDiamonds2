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
      className={`relative block h-[6.5rem] w-[6.5rem] rounded-full border transition-[border-color,box-shadow] duration-300 motion-reduce:transition-none sm:h-[8.25rem] sm:w-[8.25rem] ${
        active
          ? "border-gilt shadow-[0_0_0_1px_rgba(181,146,75,0.2),0_12px_24px_rgba(7,24,36,0.18)]"
          : "border-[#cbd8df] shadow-[0_10px_22px_rgba(17,41,56,0.14)] group-hover:border-[#aebfc9]"
      } group-focus-visible:border-gilt group-focus-visible:shadow-[0_0_0_1px_rgba(181,146,75,0.25),0_12px_24px_rgba(7,24,36,0.18)]`}
      aria-hidden="true"
    >
      <span
        className="absolute inset-[3px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_34%_24%,#1b3b51_0%,#102b3d_43%,#071824_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-10px_24px_rgba(0,7,13,0.26)]"
      />
      <span className="absolute inset-[5px] rounded-full border border-white/10 shadow-[inset_7px_8px_16px_rgba(255,255,255,0.06)]" />
      <span
        className={`absolute -inset-1 z-10 transition-transform duration-500 ease-out motion-reduce:transition-none ${
          active ? "scale-[1.025]" : "scale-100"
        }`}
      >
        <Image
          src={assetPath(ringAssets[style])}
          alt=""
          fill
          priority
          sizes="(min-width: 640px) 132px, 104px"
          className={`object-contain drop-shadow-[0_8px_7px_rgba(0,7,13,0.48)] ${ringScale[style]}`}
        />
      </span>
      <span className="pointer-events-none absolute inset-[2px] z-20 rounded-full border-t border-white/45 opacity-80" />
    </span>
  );
}
