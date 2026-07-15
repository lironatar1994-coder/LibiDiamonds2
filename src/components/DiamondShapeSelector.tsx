import Image from "next/image";
import type { DiamondShape } from "@/data/products";

export interface DiamondShapeOption {
  name: string;
  type: DiamondShape;
  image: string;
}

const SHAPE_IMAGE_SCALE: Partial<Record<DiamondShape, string>> = {
  round: "scale-[0.94]",
  oval: "scale-[0.98]",
  emerald: "scale-[0.98]",
  cushion: "scale-[0.96]",
  pear: "scale-[0.98]",
  princess: "scale-[0.96]",
};

export default function DiamondShapeSelector({ shapes }: { shapes: readonly DiamondShapeOption[] }) {
  return (
    <div className="mt-7 grid grid-cols-3 gap-x-4 gap-y-7 sm:mt-9 sm:gap-x-8 sm:gap-y-9 lg:mt-11 lg:grid-cols-6 lg:gap-8">
      {shapes.map((shape) => (
        <figure key={shape.type} className="flex flex-col items-center justify-center px-1 text-center">
          <span className="shape-stone-field relative h-[84px] w-[84px] min-[390px]:h-[90px] min-[390px]:w-[90px] sm:h-[116px] sm:w-[116px] lg:h-[128px] lg:w-[128px]">
            <Image
              src={shape.image}
              alt={`יהלום בחיתוך ${shape.name}`}
              fill
              sizes="(min-width: 1024px) 128px, (min-width: 640px) 116px, (min-width: 390px) 90px, 84px"
              className={`mix-blend-darken object-contain p-[2%] ${SHAPE_IMAGE_SCALE[shape.type] ?? "scale-100"}`}
            />
          </span>
          <figcaption className="mt-2.5 font-display text-base text-ink sm:mt-3 sm:text-xl">
            {shape.name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
