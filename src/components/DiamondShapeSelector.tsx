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
    <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-4 sm:mt-7 sm:gap-x-6 sm:gap-y-6 lg:mt-8 lg:grid-cols-6 lg:gap-6">
      {shapes.map((shape) => (
        <figure key={shape.type} className="flex flex-col items-center justify-center px-1 text-center">
          <span className="shape-stone-field relative h-[88px] w-[88px] min-[390px]:h-[92px] min-[390px]:w-[92px] sm:h-[120px] sm:w-[120px] lg:h-[132px] lg:w-[132px]">
            <Image
              src={shape.image}
              alt={`יהלום בחיתוך ${shape.name}`}
              fill
              sizes="(min-width: 1024px) 132px, (min-width: 640px) 120px, (min-width: 390px) 92px, 88px"
              className={`mix-blend-darken object-contain p-[2%] ${SHAPE_IMAGE_SCALE[shape.type] ?? "scale-100"}`}
            />
          </span>
          <figcaption className="mt-2 font-display text-base text-ink sm:mt-3 sm:text-xl">
            {shape.name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
