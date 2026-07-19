import type { DiamondShape } from "@/data/products";

export interface DiamondDimensionsMm {
  width: number;
  length: number;
}

const oneCaratDimensions: Record<DiamondShape, DiamondDimensionsMm> = {
  round: { width: 6.5, length: 6.5 },
  oval: { width: 5.8, length: 8 },
  emerald: { width: 5, length: 7 },
  cushion: { width: 6.2, length: 6.2 },
  pear: { width: 5.8, length: 8.5 },
  princess: { width: 5.5, length: 5.5 },
  marquise: { width: 5, length: 10 },
  radiant: { width: 5.5, length: 7 },
  asscher: { width: 5.5, length: 5.5 },
};

export function diamondDimensions(shape: DiamondShape, caratValue: string | number): DiamondDimensionsMm {
  const carat = Math.max(0.1, Number(caratValue) || 1);
  const scale = Math.cbrt(carat);
  const reference = oneCaratDimensions[shape];
  return {
    width: reference.width * scale,
    length: reference.length * scale,
  };
}
