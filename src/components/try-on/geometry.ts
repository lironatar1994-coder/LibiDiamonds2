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
  depthTilt: number;
}

export interface FingerContourSample {
  axisOffset: number;
  left: number;
  right: number;
}

export interface FingerSection {
  width: number;
  centerX: number;
  centerY: number;
  centerOffset: number;
  confidence: number;
  contour: FingerContourSample[];
}

export interface FingerSectionMeasurement {
  widthRatio: number;
  centerOffsetRatio: number;
  confidence: number;
  contour: FingerContourSample[];
}

export interface RingPoseOptions {
  section?: FingerSectionMeasurement | null;
  worldHand?: HandPoint[] | null;
  handedness?: "Left" | "Right" | null;
}

export type RingVisualScaleModel = "center-stone" | "setting-footprint" | "band-width";

export interface RingVisualDimensionsOptions {
  fingerWidth: number;
  referenceWidthMm: number;
  ringInnerDiameterMm: number;
  caratScale: number;
  scaleModel: RingVisualScaleModel;
  ringSizeSelected: boolean;
  pixelsPerMm?: number | null;
  manualScale?: number;
}

export interface RingVisualDimensions {
  settingWidth: number;
  shankWidth: number;
}

const AUTO_RING_SIZE = 14;
const AUTO_RING_INNER_DIAMETER_MM = (AUTO_RING_SIZE + 40) / Math.PI;
// V3 setting masters reserve a consistent transparent margin around jewelry.
const SETTING_ASSET_CONTENT_WIDTH_RATIO = 0.84;

/**
 * Converts real jewelry dimensions into a stable on-finger composition.
 * Finger width is the uncalibrated ruler; card calibration replaces it with
 * pixels-per-millimeter. Explicit ring size affects the shank only, while
 * explicit carat affects the setting only.
 */
export function calculateRingVisualDimensions(
  options: RingVisualDimensionsOptions,
): RingVisualDimensions {
  const fingerWidth = Math.max(1, options.fingerWidth);
  const manualScale = clamp(options.manualScale ?? 1, 0.55, 1.8);
  const caratScale = options.scaleModel === "center-stone"
    ? clamp(options.caratScale, 0.72, 1.42)
    : options.scaleModel === "setting-footprint"
      ? clamp(0.78 + options.caratScale * 0.22, 0.84, 1.2)
      : 1;
  const sizeScale = options.ringSizeSelected
    ? clamp(options.ringInnerDiameterMm / AUTO_RING_INNER_DIAMETER_MM, 0.86, 1.16)
    : 1;

  const calibrated = options.pixelsPerMm && options.pixelsPerMm > 0
    ? options.pixelsPerMm
    : null;
  const physicalSettingWidth = calibrated
    ? options.referenceWidthMm * caratScale * calibrated / SETTING_ASSET_CONTENT_WIDTH_RATIO
    : fingerWidth
      * (options.referenceWidthMm / AUTO_RING_INNER_DIAMETER_MM)
      * caratScale
      / SETTING_ASSET_CONTENT_WIDTH_RATIO;
  const calibratedShankWidth = calibrated && options.ringSizeSelected
    ? options.ringInnerDiameterMm * calibrated
    : fingerWidth * 1.08 * sizeScale;

  const settingBounds = options.scaleModel === "band-width"
    ? [0.98, 1.3]
    : options.scaleModel === "setting-footprint"
      ? [0.52, 1.24]
      : [0.4, 1.1];

  return {
    settingWidth: clamp(
      physicalSettingWidth,
      fingerWidth * settingBounds[0],
      fingerWidth * settingBounds[1],
    ) * manualScale,
    shankWidth: clamp(
      calibratedShankWidth,
      fingerWidth * 0.94,
      fingerWidth * 1.22,
    ) * manualScale,
  };
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

export function choosePrimaryHandIndex(hands: HandPoint[][]): number {
  if (!hands.length) return -1;
  let bestIndex = 0;
  let bestScore = -1;
  hands.forEach((hand, index) => {
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
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  });
  return bestIndex;
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

export function calculateRingPose(hand: HandPoint[], options: RingPoseOptions = {}): RingPose | null {
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
  const measuredWidthRatio = options.section?.confidence && options.section.confidence >= 0.42
    ? options.section.widthRatio
    : null;
  const widthRatio = measuredWidthRatio === null
    ? fallbackWidth / axisLength
    : clamp(measuredWidthRatio, 0.34, 0.78);
  const fingerWidth = axisLength * widthRatio;

  // Move the ring toward the PIP joint by a proportional amount. This stays
  // stable across near/far photos instead of relying on a fixed pixel offset.
  const positionRatio = clamp(0.73 + (widthRatio - 0.5) * 0.06, 0.69, 0.77);
  const normalX = -axisY;
  const normalY = axisX;
  const centerOffset = options.section?.confidence && options.section.confidence >= 0.42
    ? clamp(options.section.centerOffsetRatio, -0.16, 0.16) * axisLength
    : 0;
  const x = ringMcp.x + (ringPip.x - ringMcp.x) * positionRatio + normalX * centerOffset;
  const y = ringMcp.y + (ringPip.y - ringMcp.y) * positionRatio + normalY * centerOffset;
  const depthDelta = (ringPip.z ?? 0) - (ringMcp.z ?? 0);
  const imageDepthSlope = clamp(depthDelta / axisLength, -0.6, 0.6);
  const worldMcp = options.worldHand?.[13];
  const worldPip = options.worldHand?.[14];
  const worldLength = worldMcp && worldPip
    ? Math.hypot(worldPip.x - worldMcp.x, worldPip.y - worldMcp.y, (worldPip.z ?? 0) - (worldMcp.z ?? 0))
    : 0;
  const worldDepthSlope = worldMcp && worldPip && worldLength > 0.0001
    ? clamp(((worldPip.z ?? 0) - (worldMcp.z ?? 0)) / worldLength, -0.9, 0.9)
    : imageDepthSlope;
  const depthSlope = imageDepthSlope * 0.35 + worldDepthSlope * 0.65;
  const handednessSign = options.handedness === "Left" ? -1 : 1;

  return {
    x,
    y,
    width: fingerWidth,
    fingerWidth,
    axisLength,
    axisX,
    axisY,
    rotation: Math.atan2(ringPip.y - ringMcp.y, ringPip.x - ringMcp.x) + Math.PI / 2,
    perspectiveScale: clamp(1 - Math.abs(depthSlope) * 0.32, 0.76, 1),
    skew: clamp(depthSlope * 0.22 * handednessSign, -0.18, 0.18),
    depthTilt: depthSlope,
  };
}

export function calculateWristPose(hand: HandPoint[], options: RingPoseOptions = {}): RingPose | null {
  if (hand.length < 18) return null;

  const wrist = hand[0];
  const palmPoints = [hand[5], hand[9], hand[13], hand[17]];
  const palmCenter = palmPoints.reduce(
    (sum, point) => ({ x: sum.x + point.x / palmPoints.length, y: sum.y + point.y / palmPoints.length }),
    { x: 0, y: 0 },
  );
  const palmLength = distance(wrist, palmCenter);
  const palmWidth = distance(hand[5], hand[17]);
  if (!Number.isFinite(palmLength) || !Number.isFinite(palmWidth) || palmLength < 8 || palmWidth < 8) {
    return null;
  }

  const palmwardX = (palmCenter.x - wrist.x) / palmLength;
  const palmwardY = (palmCenter.y - wrist.y) / palmLength;
  const fallbackWidth = clamp(palmWidth * 0.7, palmLength * 0.52, palmLength * 0.82);
  const axisLength = Math.max(palmLength, fallbackWidth / 0.72);
  const measuredWidthRatio = options.section?.confidence && options.section.confidence >= 0.42
    ? options.section.widthRatio
    : null;
  const widthRatio = measuredWidthRatio === null
    ? fallbackWidth / axisLength
    : clamp(measuredWidthRatio, 0.5, 0.82);
  const wristWidth = axisLength * widthRatio;
  const normalX = -palmwardY;
  const normalY = palmwardX;
  const centerOffset = options.section?.confidence && options.section.confidence >= 0.42
    ? clamp(options.section.centerOffsetRatio, -0.18, 0.18) * axisLength
    : 0;

  // Continue away from the palm so the bracelet sits just below the wrist crease.
  const positionRatio = 0.13;
  const x = wrist.x - palmwardX * palmLength * positionRatio + normalX * centerOffset;
  const y = wrist.y - palmwardY * palmLength * positionRatio + normalY * centerOffset;
  const imageDepthSlope = clamp(((palmCenter.z ?? 0) - (wrist.z ?? 0)) / palmLength, -0.7, 0.7);
  const worldWrist = options.worldHand?.[0];
  const worldPalmPoints = options.worldHand
    ? [options.worldHand[5], options.worldHand[9], options.worldHand[13], options.worldHand[17]]
    : [];
  const worldPalm = worldPalmPoints.length
    ? worldPalmPoints.reduce(
        (sum, point) => ({
          x: sum.x + point.x / worldPalmPoints.length,
          y: sum.y + point.y / worldPalmPoints.length,
          z: (sum.z ?? 0) + (point.z ?? 0) / worldPalmPoints.length,
        }),
        { x: 0, y: 0, z: 0 },
      )
    : null;
  const worldLength = worldWrist && worldPalm
    ? Math.hypot(worldPalm.x - worldWrist.x, worldPalm.y - worldWrist.y, (worldPalm.z ?? 0) - (worldWrist.z ?? 0))
    : 0;
  const worldDepthSlope = worldWrist && worldPalm && worldLength > 0.0001
    ? clamp(((worldPalm.z ?? 0) - (worldWrist.z ?? 0)) / worldLength, -0.9, 0.9)
    : imageDepthSlope;
  const depthSlope = imageDepthSlope * 0.35 + worldDepthSlope * 0.65;
  const handednessSign = options.handedness === "Left" ? -1 : 1;

  return {
    x,
    y,
    width: wristWidth,
    fingerWidth: wristWidth,
    axisLength,
    axisX: palmwardX,
    axisY: palmwardY,
    rotation: Math.atan2(palmwardY, palmwardX) + Math.PI / 2,
    perspectiveScale: clamp(1 - Math.abs(depthSlope) * 0.22, 0.8, 1),
    skew: clamp(depthSlope * 0.18 * handednessSign, -0.15, 0.15),
    depthTilt: depthSlope,
  };
}

/**
 * Creates a wrist pose from two user-selected wrist edges. This is the
 * deterministic fallback for photos where the wrist is visible but the full
 * hand is outside the frame and landmark detection cannot initialize.
 */
export function calculateManualWristPose(edgeA: HandPoint, edgeB: HandPoint): RingPose | null {
  const wristWidth = distance(edgeA, edgeB);
  if (!Number.isFinite(wristWidth) || wristWidth < 12) return null;

  const edgeX = (edgeB.x - edgeA.x) / wristWidth;
  const edgeY = (edgeB.y - edgeA.y) / wristWidth;
  const axisX = -edgeY;
  const axisY = edgeX;

  return {
    x: (edgeA.x + edgeB.x) / 2,
    y: (edgeA.y + edgeB.y) / 2,
    width: wristWidth,
    fingerWidth: wristWidth,
    axisLength: wristWidth / 0.72,
    axisX,
    axisY,
    rotation: Math.atan2(edgeY, edgeX),
    perspectiveScale: 1,
    skew: 0,
    depthTilt: 0,
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
export function estimateLocalFingerSection(
  context: CanvasRenderingContext2D,
  pose: RingPose,
): FingerSection | null {
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

  const scanBoundary = (axisOffset: number, direction: -1 | 1): number | null => {
    const minDistance = expectedWidth * 0.3;
    const maxDistance = Math.min(searchRadius, expectedWidth * 1.05);
    let previous = reference;
    let misses = 0;
    for (let distanceFromCenter = 2; distanceFromCenter <= maxDistance; distanceFromCenter += 1) {
      const color = sample(
        pose.x + pose.axisX * pose.axisLength * axisOffset + normalX * distanceFromCenter * direction,
        pose.y + pose.axisY * pose.axisLength * axisOffset + normalY * distanceFromCenter * direction,
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

  const contour: FingerContourSample[] = [];
  for (const axisOffset of [-0.16, 0, 0.16]) {
    const left = scanBoundary(axisOffset, -1);
    const right = scanBoundary(axisOffset, 1);
    if (left !== null && right !== null) contour.push({ axisOffset, left, right });
  }
  if (contour.length < 2) return null;
  const centerSample = contour.find((sample) => sample.axisOffset === 0) ?? contour[Math.floor(contour.length / 2)];
  const measuredWidth = centerSample.left + centerSample.right;
  const widthToAxis = measuredWidth / pose.axisLength;
  const widthToFallback = measuredWidth / expectedWidth;
  if (widthToAxis < 0.32 || widthToAxis > 0.84 || widthToFallback < 0.7 || widthToFallback > 1.55) {
    return null;
  }

  const smoothedWidth = measuredWidth * 0.78 + expectedWidth * 0.22;
  const centerOffset = (centerSample.right - centerSample.left) / 2;
  const centerX = pose.x + normalX * centerOffset;
  const centerY = pose.y + normalY * centerOffset;
  const widthConsistency = 1 - clamp(
    Math.max(...contour.map((sample) => Math.abs(sample.left + sample.right - measuredWidth))) / measuredWidth,
    0,
    1,
  );
  const confidence = clamp(0.38 + contour.length * 0.16 + widthConsistency * 0.14, 0, 0.98);

  return {
    width: smoothedWidth,
    centerX,
    centerY,
    centerOffset,
    confidence,
    contour,
  };
}

export function estimateLocalWristSection(
  context: CanvasRenderingContext2D,
  pose: RingPose,
): FingerSection | null {
  // Wrist and finger sections share the same local edge scan. Wrist poses keep
  // their width-to-axis ratio inside the scanner's validated range.
  return estimateLocalFingerSection(context, pose);
}

export function fingerSectionMeasurement(section: FingerSection, axisLength: number): FingerSectionMeasurement {
  return {
    widthRatio: section.width / axisLength,
    centerOffsetRatio: section.centerOffset / axisLength,
    confidence: section.confidence,
    contour: section.contour.map((sample) => ({
      axisOffset: sample.axisOffset,
      left: sample.left / axisLength,
      right: sample.right / axisLength,
    })),
  };
}

export function fingerSectionForPose(pose: RingPose, measurement?: FingerSectionMeasurement | null): FingerSection {
  const normalX = -pose.axisY;
  const normalY = pose.axisX;
  const fallbackHalf = pose.fingerWidth / 2;
  const contour = measurement?.confidence && measurement.confidence >= 0.42
    ? measurement.contour.map((sample) => ({
        axisOffset: sample.axisOffset,
        left: sample.left * pose.axisLength,
        right: sample.right * pose.axisLength,
      }))
    : [-0.18, 0, 0.18].map((axisOffset) => ({ axisOffset, left: fallbackHalf, right: fallbackHalf }));
  const centerOffset = measurement?.confidence && measurement.confidence >= 0.42
    ? measurement.centerOffsetRatio * pose.axisLength
    : 0;
  return {
    width: measurement?.confidence && measurement.confidence >= 0.42
      ? measurement.widthRatio * pose.axisLength
      : pose.fingerWidth,
    centerX: pose.x + normalX * centerOffset,
    centerY: pose.y + normalY * centerOffset,
    centerOffset,
    confidence: measurement?.confidence ?? 0,
    contour,
  };
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
    depthTilt: previous.depthTilt + (next.depthTilt - previous.depthTilt) * amount,
  };
}
