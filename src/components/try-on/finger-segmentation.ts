import type { FingerSectionMeasurement, RingPose } from "./geometry";

export interface FingerMaskData {
  data: Float32Array;
  width: number;
  height: number;
  quality: number;
}

const OFFSETS = [-0.24, -0.16, -0.08, 0, 0.08, 0.16, 0.24];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Converts the on-device object mask into the small contour representation the
 * ring renderer needs. All distances are measured in source-image pixels so
 * the result can be reused after the photo is mapped into a responsive canvas.
 */
export function fingerSectionMeasurementFromMask(
  mask: FingerMaskData,
  pose: RingPose,
  sourceWidth: number,
  sourceHeight: number,
): FingerSectionMeasurement | null {
  if (!mask.width || !mask.height || mask.data.length < mask.width * mask.height) return null;

  const normalX = -pose.axisY;
  const normalY = pose.axisX;
  const sample = (sourceX: number, sourceY: number): number => {
    const x = Math.round(clamp(sourceX / sourceWidth, 0, 1) * (mask.width - 1));
    const y = Math.round(clamp(sourceY / sourceHeight, 0, 1) * (mask.height - 1));
    return mask.data[y * mask.width + x] ?? 0;
  };

  const scanBoundary = (axisOffset: number, direction: -1 | 1): number | null => {
    const minDistance = pose.fingerWidth * 0.28;
    const maxDistance = pose.fingerWidth * 1.08;
    let misses = 0;
    for (let distance = 1; distance <= maxDistance; distance += 1) {
      const confidence = sample(
        pose.x + pose.axisX * pose.axisLength * axisOffset + normalX * distance * direction,
        pose.y + pose.axisY * pose.axisLength * axisOffset + normalY * distance * direction,
      );
      const outside = distance > minDistance && confidence < 0.46;
      misses = outside ? misses + 1 : 0;
      if (misses >= 2) return distance - 1;
    }
    return null;
  };

  const contour = OFFSETS.flatMap((axisOffset) => {
    const left = scanBoundary(axisOffset, -1);
    const right = scanBoundary(axisOffset, 1);
    return left === null || right === null ? [] : [{ axisOffset, left, right }];
  });
  if (contour.length < 4) return null;

  const center = contour.find((entry) => entry.axisOffset === 0) ?? contour[Math.floor(contour.length / 2)];
  const measuredWidth = center.left + center.right;
  const widthRatio = measuredWidth / pose.axisLength;
  const fallbackRatio = measuredWidth / pose.fingerWidth;
  if (widthRatio < 0.3 || widthRatio > 0.86 || fallbackRatio < 0.65 || fallbackRatio > 1.55) return null;

  const widths = contour.map((entry) => entry.left + entry.right);
  const maximumDeviation = Math.max(...widths.map((width) => Math.abs(width - measuredWidth))) / measuredWidth;
  const consistency = 1 - clamp(maximumDeviation, 0, 1);
  const confidence = clamp(mask.quality * 0.48 + consistency * 0.3 + contour.length / OFFSETS.length * 0.22, 0, 0.98);

  return {
    widthRatio,
    centerOffsetRatio: (center.right - center.left) / 2 / pose.axisLength,
    confidence,
    contour: contour.map((entry) => ({
      axisOffset: entry.axisOffset,
      left: entry.left / pose.axisLength,
      right: entry.right / pose.axisLength,
    })),
  };
}
