import Image from "next/image";
import type { DiamondShape } from "@/data/products";

export interface DiamondShapeOption {
  name: string;
  type: DiamondShape;
  image: string;
}

const SHAPE_IMAGE_SCALE: Partial<Record<DiamondShape, string>> = {
  round: "scale-100",
  oval: "scale-[0.94]",
  emerald: "scale-[0.9]",
  cushion: "scale-[0.96]",
  pear: "scale-[0.9]",
  princess: "scale-[0.96]",
};

export default function DiamondShapeSelector({ shapes }: { shapes: readonly DiamondShapeOption[] }) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-5 sm:mt-8 sm:gap-x-8 sm:gap-y-6 lg:mt-9 lg:grid-cols-6 lg:gap-8">
      {shapes.map((shape) => (
        <figure key={shape.type} className="flex flex-col items-center justify-center px-1 text-center">
          <span className="shape-stone-field relative h-[86px] w-[86px] sm:h-[108px] sm:w-[108px] lg:h-[118px] lg:w-[118px]">
            <Image
              src={shape.image}
              alt={`יהלום בחיתוך ${shape.name}`}
              fill
              sizes="(min-width: 1024px) 118px, (min-width: 640px) 108px, 86px"
              className={`shape-stone-image object-contain ${SHAPE_IMAGE_SCALE[shape.type] ?? "scale-100"}`}
            />
          </span>
          <figcaption className="mt-2.5 font-display text-base text-ink sm:text-xl">
            {shape.name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
