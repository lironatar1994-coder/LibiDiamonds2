export interface HandPoint {
  x: number;
  y: number;
  z?: number;
}

export interface RingPose {
  x: number;
  y: number;
  width: number;
  fingerWidth: number;
  axisLength: number;
  axisX: number;
  axisY: number;
  rotation: number;
  perspectiveScale: number;
  skew: number;
}

export interface DrawTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  mirrored: boolean;
}

function distance(a: HandPoint, b: HandPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function choosePrimaryHand(hands: HandPoint[][]): HandPoint[] | null {
  if (!hands.length) return null;

  return hands.reduce((best, hand) => {
    const bounds = hand.reduce(
      (box, point) => ({
        minX: Math.min(box.minX, point.x),
        maxX: Math.max(box.maxX, point.x),
        minY: Math.min(box.minY, point.y),
        maxY: Math.max(box.maxY, point.y),
      }),
      { minX: 1, maxX: 0, minY: 1, maxY: 0 },
    );
    const area = Math.max(0, bounds.maxX - bounds.minX) * Math.max(0, bounds.maxY - bounds.minY);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const centrality = 1 - Math.min(1, Math.hypot(centerX - 0.5, centerY - 0.5));
    const score = area * (0.75 + centrality * 0.25);
    return score > best.score ? { hand, score } : best;
  }, { hand: hands[0], score: -1 }).hand;
}

export function coverTransform(
  sourceWidth: number,
  sourceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  mirrored: boolean,
): DrawTransform {
  const scale = Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  return {
    scale,
    offsetX: (canvasWidth - sourceWidth * scale) / 2,
    offsetY: (canvasHeight - sourceHeight * scale) / 2,
    mirrored,
  };
}

export function mapLandmarks(
  hand: HandPoint[],
  transform: DrawTransform,
  sourceWidth: number,
  sourceHeight: number,
): HandPoint[] {
  return hand.map((point) => ({
    x: transform.offsetX + (transform.mirrored ? 1 - point.x : point.x) * sourceWidth * transform.scale,
    y: transform.offsetY + point.y * sourceHeight * transform.scale,
    z: point.z === undefined ? undefined : point.z * sourceWidth * transform.scale,
  }));
}

export function calculateRingPose(hand: HandPoint[], measuredWidthRatio?: number | null): RingPose | null {
  if (hand.length < 18) return null;

  const middleMcp = hand[9];
  const ringMcp = hand[13];
  const ringPip = hand[14];
  const pinkyMcp = hand[17];
  const axisLength = distance(ringMcp, ringPip);
  const neighborGap = (distance(middleMcp, ringMcp) + distance(ringMcp, pinkyMcp)) / 2;

  if (!Number.isFinite(axisLength) || !Number.isFinite(neighborGap) || axisLength < 4 || neighborGap < 4) {
    return null;
  }

  const axisX = (ringPip.x - ringMcp.x) / axisLength;
  const axisY = (ringPip.y - ringMcp.y) / axisLength;
  const boneEstimate = axisLength * 0.5;
  const neighborEstimate = neighborGap * 0.76;
  const fallbackWidth = clamp(
    boneEstimate * 0.68 + neighborEstimate * 0.32,
    axisLength * 0.36,
    axisLength * 0.72,
  );
  const widthRatio = measuredWidthRatio === undefined || measuredWidthRatio === null
    ? fallbackWidth / axisLength
    : clamp(measuredWidthRatio, 0.34, 0.78);
  const fingerWidth = axisLength * widthRatio;

  // The setting belongs on the proximal phalanx, clear of the webbing. A small
  // width-aware adjustment is more stable than a single landmark percentage.
  const positionRatio = clamp(0.65 + (widthRatio - 0.5) * 0.08, 0.62, 0.69);
  const x = ringMcp.x + (ringPip.x - ringMcp.x) * positionRatio;
  const y = ringMcp.y + (ringPip.y - ringMcp.y) * positionRatio;
  const depthDelta = (ringPip.z ?? 0) - (ringMcp.z ?? 0);
  const depthSlope = clamp(depthDelta / axisLength, -0.6, 0.6);

  return {
    x,
    y,
    width: fingerWidth,
    fingerWidth,
    axisLength,
    axisX,
    axisY,
    rotation: Math.atan2(ringPip.y - ringMcp.y, ringPip.x - ringMcp.x) + Math.PI / 2,
    perspectiveScale: clamp(1 - Math.abs(depthSlope) * 0.42, 0.8, 1),
    skew: clamp(depthSlope * 0.3, -0.16, 0.16),
  };
}

interface PixelColor {
  r: number;
  g: number;
  b: number;
}

function colorDistance(a: PixelColor, b: PixelColor): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
}

/**
 * Estimates the ring finger width from the pixels around the detected finger.
 * It samples one narrow cross-section only, so it stays inexpensive enough for
 * on-device video and falls back to landmark geometry whenever the edge is not
 * trustworthy.
 */
export function estimateLocalFingerWidth(
  context: CanvasRenderingContext2D,
  pose: RingPose,
): number | null {
  const expectedWidth = pose.fingerWidth;
  const searchRadius = Math.ceil(Math.min(pose.axisLength * 0.72, expectedWidth * 1.25));
  const cropX = Math.max(0, Math.floor(pose.x - searchRadius - 4));
  const cropY = Math.max(0, Math.floor(pose.y - searchRadius - 4));
  const cropRight = Math.min(context.canvas.width, Math.ceil(pose.x + searchRadius + 4));
  const cropBottom = Math.min(context.canvas.height, Math.ceil(pose.y + searchRadius + 4));
  const cropWidth = cropRight - cropX;
  const cropHeight = cropBottom - cropY;
  if (cropWidth < 8 || cropHeight < 8) return null;

  let imageData: ImageData;
  try {
    imageData = context.getImageData(cropX, cropY, cropWidth, cropHeight);
  } catch {
    return null;
  }

  const sample = (canvasX: number, canvasY: number, radius = 1): PixelColor | null => {
    const centerX = Math.round(canvasX - cropX);
    const centerY = Math.round(canvasY - cropY);
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let y = centerY - radius; y <= centerY + radius; y += 1) {
      if (y < 0 || y >= cropHeight) continue;
      for (let x = centerX - radius; x <= centerX + radius; x += 1) {
        if (x < 0 || x >= cropWidth) continue;
        const offset = (y * cropWidth + x) * 4;
        r += imageData.data[offset];
        g += imageData.data[offset + 1];
        b += imageData.data[offset + 2];
        count += 1;
      }
    }
    return count ? { r: r / count, g: g / count, b: b / count } : null;
  };

  const normalX = -pose.axisY;
  const normalY = pose.axisX;
  const referenceSamples: PixelColor[] = [];
  for (const axisOffset of [-0.1, 0, 0.1]) {
    for (const normalOffset of [-0.06, 0, 0.06]) {
      const color = sample(
        pose.x + pose.axisX * pose.axisLength * axisOffset + normalX * expectedWidth * normalOffset,
        pose.y + pose.axisY * pose.axisLength * axisOffset + normalY * expectedWidth * normalOffset,
        1,
      );
      if (color) referenceSamples.push(color);
    }
  }
  if (!referenceSamples.length) return null;

  const reference = referenceSamples.reduce(
    (sum, color) => ({ r: sum.r + color.r, g: sum.g + color.g, b: sum.b + color.b }),
    { r: 0, g: 0, b: 0 },
  );
  reference.r /= referenceSamples.length;
  reference.g /= referenceSamples.length;
  reference.b /= referenceSamples.length;

  const scanBoundary = (direction: -1 | 1): number | null => {
    const minDistance = expectedWidth * 0.3;
    const maxDistance = Math.min(searchRadius, expectedWidth * 1.05);
    let previous = reference;
    let misses = 0;
    for (let distanceFromCenter = 2; distanceFromCenter <= maxDistance; distanceFromCenter += 1) {
      const color = sample(
        pose.x + normalX * distanceFromCenter * direction,
        pose.y + normalY * distanceFromCenter * direction,
        1,
      );
      if (!color) return null;
      const fromSkin = colorDistance(color, reference);
      const localEdge = colorDistance(color, previous);
      const outside = distanceFromCenter > minDistance && (fromSkin > 46 || (fromSkin > 27 && localEdge > 24));
      misses = outside ? misses + 1 : 0;
      if (misses >= 2) return distanceFromCenter - 1;
      previous = color;
    }
    return null;
  };

  const left = scanBoundary(-1);
  const right = scanBoundary(1);
  if (left === null || right === null) return null;
  const measuredWidth = left + right;
  const widthToAxis = measuredWidth / pose.axisLength;
  const widthToFallback = measuredWidth / expectedWidth;
  if (widthToAxis < 0.32 || widthToAxis > 0.84 || widthToFallback < 0.7 || widthToFallback > 1.55) {
    return null;
  }

  return measuredWidth * 0.74 + expectedWidth * 0.26;
}

function interpolateAngle(from: number, to: number, amount: number): number {
  let delta = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta * amount;
}

export function smoothPose(previous: RingPose | null, next: RingPose, amount = 0.34): RingPose {
  if (!previous) return next;
  return {
    x: previous.x + (next.x - previous.x) * amount,
    y: previous.y + (next.y - previous.y) * amount,
    width: previous.width + (next.width - previous.width) * amount,
    fingerWidth: previous.fingerWidth + (next.fingerWidth - previous.fingerWidth) * amount,
    axisLength: previous.axisLength + (next.axisLength - previous.axisLength) * amount,
    axisX: previous.axisX + (next.axisX - previous.axisX) * amount,
    axisY: previous.axisY + (next.axisY - previous.axisY) * amount,
    rotation: interpolateAngle(previous.rotation, next.rotation, amount),
    perspectiveScale: previous.perspectiveScale + (next.perspectiveScale - previous.perspectiveScale) * amount,
    skew: previous.skew + (next.skew - previous.skew) * amount,
  };
}
