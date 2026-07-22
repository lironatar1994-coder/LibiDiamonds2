import type { DiamondShape, Metal, RingTryOnV4Config } from "@/data/products";
import type { FingerSection, RingPose } from "./geometry";

export interface RingTryOnV4Assets {
  setting?: HTMLImageElement;
  front: HTMLImageElement;
  rear: HTMLImageElement;
  highlight: HTMLImageElement;
}

export interface RingTryOnV4Dimensions {
  settingWidth: number;
  shankWidth: number;
  stoneWidth: number;
}

interface LocalLighting {
  luminance: number;
  warmth: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function traceFingerSection(context: CanvasRenderingContext2D, pose: RingPose, section: FingerSection) {
  const normalX = -pose.axisY;
  const normalY = pose.axisX;
  const samples = section.contour.length >= 4
    ? section.contour
    : [-0.28, -0.14, 0, 0.14, 0.28].map((axisOffset) => ({
        axisOffset,
        left: pose.fingerWidth / 2,
        right: pose.fingerWidth / 2,
      }));
  const first = samples[0];
  const last = samples[samples.length - 1];
  const extended = [
    { ...first, axisOffset: Math.min(-0.38, first.axisOffset - 0.12) },
    ...samples,
    { ...last, axisOffset: Math.max(0.38, last.axisOffset + 0.12) },
  ];
  const point = (sample: typeof extended[number], side: "left" | "right") => {
    const distance = side === "left" ? -sample.left : sample.right;
    return {
      x: pose.x + pose.axisX * pose.axisLength * sample.axisOffset + normalX * distance,
      y: pose.y + pose.axisY * pose.axisLength * sample.axisOffset + normalY * distance,
    };
  };
  const left = extended.map((sample) => point(sample, "left"));
  const right = extended.map((sample) => point(sample, "right")).reverse();
  context.beginPath();
  context.moveTo(left[0].x, left[0].y);
  for (const value of left.slice(1)) context.lineTo(value.x, value.y);
  for (const value of right) context.lineTo(value.x, value.y);
  context.closePath();
}

function sampleLocalLighting(
  pristineFrame: HTMLCanvasElement,
  pose: RingPose,
): LocalLighting {
  const context = pristineFrame.getContext("2d", { willReadFrequently: true });
  if (!context) return { luminance: 0.64, warmth: 0 };
  const radius = Math.max(4, Math.round(pose.fingerWidth * 0.46));
  const x = clamp(Math.round(pose.x - radius), 0, pristineFrame.width - 1);
  const y = clamp(Math.round(pose.y - radius), 0, pristineFrame.height - 1);
  const width = Math.max(1, Math.min(radius * 2, pristineFrame.width - x));
  const height = Math.max(1, Math.min(radius * 2, pristineFrame.height - y));
  try {
    const data = context.getImageData(x, y, width, height).data;
    let luminance = 0;
    let warmth = 0;
    let count = 0;
    for (let offset = 0; offset < data.length; offset += 16) {
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      luminance += (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
      warmth += (red - blue) / 255;
      count += 1;
    }
    return count ? { luminance: luminance / count, warmth: warmth / count } : { luminance: 0.64, warmth: 0 };
  } catch {
    return { luminance: 0.64, warmth: 0 };
  }
}

function drawPerspectiveLayer(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  pose: RingPose,
  canvasWidth: number,
  centerYRatio: number,
  options: {
    alpha?: number;
    shadow?: boolean;
    filter?: string;
    composite?: GlobalCompositeOperation;
    centerCutout?: { width: number; height: number };
  } = {},
) {
  const canvasHeight = canvasWidth * (image.height / image.width);
  const segments = 10;
  const sourceHeight = image.height / segments;
  const destinationHeight = canvasHeight / segments;

  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.rotation);
  context.transform(1, 0, pose.skew * 0.72, 1, 0, 0);
  context.globalAlpha = options.alpha ?? 1;
  context.globalCompositeOperation = options.composite ?? "source-over";
  context.filter = options.filter ?? "none";
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  if (options.centerCutout) {
    context.beginPath();
    context.rect(-canvasWidth, -canvasHeight, canvasWidth * 2, canvasHeight * 2);
    context.ellipse(0, 0, options.centerCutout.width / 2, options.centerCutout.height / 2, 0, 0, Math.PI * 2);
    context.clip("evenodd");
  }
  if (options.shadow) {
    context.shadowColor = "rgba(20,14,8,0.22)";
    context.shadowBlur = Math.max(1.2, pose.fingerWidth * 0.08);
    context.shadowOffsetY = Math.max(0.7, pose.fingerWidth * 0.028);
  }

  for (let index = 0; index < segments; index += 1) {
    const normalizedY = (index + 0.5) / segments;
    const perspectiveTaper = clamp(1 + pose.depthTilt * (normalizedY - centerYRatio) * 0.38, 0.82, 1.18);
    const width = canvasWidth * perspectiveTaper;
    const y = (index / segments - centerYRatio) * canvasHeight * pose.perspectiveScale;
    context.drawImage(
      image,
      0,
      index * sourceHeight,
      image.width,
      Math.ceil(sourceHeight + 1),
      -width / 2,
      y,
      width,
      destinationHeight * pose.perspectiveScale + 1,
    );
  }
  context.restore();
}

const HEAD_CROP_WIDTH_RATIO = 0.38;
// The scalable mask hugs the center stone and four prongs. The wider crop is
// retained only as source padding; ring shoulders outside this mask stay fixed.
const HEAD_MASK_WIDTH_RATIO = 0.335;
const HEAD_STONE_CONTENT_RATIO = 0.74;

function drawIndependentHead(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  pose: RingPose,
  centerYRatio: number,
  stoneWidth: number,
  filter: string,
) {
  const sourceWidth = image.width * HEAD_CROP_WIDTH_RATIO;
  const sourceHeight = image.height * HEAD_CROP_WIDTH_RATIO;
  const sourceX = image.width * 0.5 - sourceWidth / 2;
  const sourceY = image.height * centerYRatio - sourceHeight / 2;
  const destinationWidth = stoneWidth / HEAD_STONE_CONTENT_RATIO;
  const destinationHeight = destinationWidth * (sourceHeight / sourceWidth);

  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.rotation);
  context.transform(1, 0, pose.skew * 0.72, pose.perspectiveScale, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  const maskDiameter = destinationWidth * HEAD_MASK_WIDTH_RATIO / HEAD_CROP_WIDTH_RATIO;
  context.beginPath();
  context.ellipse(0, 0, maskDiameter / 2, maskDiameter / 2, 0, 0, Math.PI * 2);
  context.clip();
  context.filter = filter;
  context.shadowColor = "rgba(18,12,7,0.2)";
  context.shadowBlur = Math.max(1.2, pose.fingerWidth * 0.075);
  context.shadowOffsetY = Math.max(0.7, pose.fingerWidth * 0.026);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -destinationWidth / 2,
    -destinationHeight / 2,
    destinationWidth,
    destinationHeight,
  );
  context.restore();
}

function drawDiamondOptics(
  context: CanvasRenderingContext2D,
  pose: RingPose,
  shape: DiamondShape,
  stoneWidth: number,
  glintStrength: number,
) {
  if (shape !== "round" || stoneWidth < 4) return;
  const radius = stoneWidth * 0.48;
  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.rotation);
  context.transform(1, 0, pose.skew * 0.72, pose.perspectiveScale, 0, 0);
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.clip();
  context.globalCompositeOperation = "screen";

  const facetAlpha = 0.035 + glintStrength * 0.08;
  for (let index = 0; index < 12; index += 1) {
    const start = index * Math.PI / 6 - Math.PI / 12;
    const end = start + Math.PI / 6;
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, start, end);
    context.closePath();
    context.fillStyle = index % 3 === 0
      ? `rgba(202,226,255,${facetAlpha})`
      : index % 3 === 1
        ? `rgba(255,238,205,${facetAlpha * 0.82})`
        : `rgba(255,255,255,${facetAlpha * 0.58})`;
    context.fill();
  }

  const table = context.createRadialGradient(-radius * 0.18, -radius * 0.2, 0, 0, 0, radius);
  table.addColorStop(0, `rgba(255,255,255,${0.12 + glintStrength * 0.16})`);
  table.addColorStop(0.34, "rgba(255,255,255,0.015)");
  table.addColorStop(1, "rgba(180,210,255,0.04)");
  context.fillStyle = table;
  context.fillRect(-radius, -radius, radius * 2, radius * 2);

  if (glintStrength > 0.03) {
    const travel = 1 - glintStrength;
    const glintX = -radius * 0.64 + travel * radius * 1.05;
    const glintY = -radius * 0.42 + travel * radius * 0.28;
    const glow = context.createRadialGradient(glintX, glintY, 0, glintX, glintY, radius * 0.32);
    glow.addColorStop(0, `rgba(255,255,255,${0.9 * glintStrength})`);
    glow.addColorStop(0.2, `rgba(220,238,255,${0.42 * glintStrength})`);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = glow;
    context.fillRect(-radius, -radius, radius * 2, radius * 2);
    context.strokeStyle = `rgba(255,255,255,${0.78 * glintStrength})`;
    context.lineWidth = Math.max(0.55, stoneWidth * 0.018);
    context.beginPath();
    context.moveTo(glintX - radius * 0.24, glintY);
    context.lineTo(glintX + radius * 0.24, glintY);
    context.moveTo(glintX, glintY - radius * 0.24);
    context.lineTo(glintX, glintY + radius * 0.24);
    context.stroke();
  }
  context.restore();
}

export function drawLayeredRingV4(
  context: CanvasRenderingContext2D,
  pristineFrame: HTMLCanvasElement,
  assets: RingTryOnV4Assets,
  pose: RingPose,
  section: FingerSection,
  metal: Metal,
  config: RingTryOnV4Config,
  shape: DiamondShape,
  dimensions: RingTryOnV4Dimensions,
  glintStrength: number,
) {
  const lighting = sampleLocalLighting(pristineFrame, pose);
  const shankCanvasWidth = dimensions.shankWidth / config.assetContentWidthRatio;
  const settingCanvasWidth = dimensions.settingWidth / config.settingContentWidthRatio;
  const adaptiveBrightness = clamp(0.82 + lighting.luminance * 0.3, 0.86, 1.06);
  const contrast = metal === "white" ? 1.16 : 1.08;
  const saturation = metal === "white"
    ? clamp(0.86 + Math.abs(lighting.warmth) * 0.22, 0.86, 1.02)
    : clamp(0.98 + lighting.warmth * 0.18, 0.9, 1.08);
  const filter = `brightness(${adaptiveBrightness}) contrast(${contrast}) saturate(${saturation})`;

  drawPerspectiveLayer(context, assets.rear, pose, shankCanvasWidth, config.assetCenterYRatio, {
    alpha: 0.96,
    filter,
  });

  context.save();
  traceFingerSection(context, pose, section);
  context.clip();
  context.drawImage(pristineFrame, 0, 0);
  context.restore();

  drawPerspectiveLayer(context, assets.front, pose, shankCanvasWidth, config.assetCenterYRatio, {
    shadow: true,
    filter,
  });

  if (assets.setting) {
    context.save();
    context.translate(pose.x, pose.y);
    context.rotate(pose.rotation);
    context.globalCompositeOperation = "multiply";
    context.fillStyle = `rgba(35,24,14,${clamp(0.045 + (1 - lighting.luminance) * 0.055, 0.04, 0.1)})`;
    context.filter = `blur(${Math.max(0.9, pose.fingerWidth * 0.032)}px)`;
    context.beginPath();
    context.ellipse(0, pose.fingerWidth * 0.075, settingCanvasWidth * 0.24, pose.fingerWidth * 0.075, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
    const independentHead = config.renderProfile === "solitaire";
    drawPerspectiveLayer(context, assets.setting, pose, settingCanvasWidth, config.assetCenterYRatio, {
      shadow: true,
      filter,
      centerCutout: independentHead
        ? { width: settingCanvasWidth * HEAD_MASK_WIDTH_RATIO, height: settingCanvasWidth * HEAD_MASK_WIDTH_RATIO }
        : undefined,
    });
    if (independentHead) {
      drawIndependentHead(context, assets.setting, pose, config.assetCenterYRatio, dimensions.stoneWidth, filter);
      drawDiamondOptics(context, pose, shape, dimensions.stoneWidth, glintStrength);
    }
  }

  const highlightAlpha = clamp(0.055 + glintStrength * 0.24, 0.055, 0.295);
  drawPerspectiveLayer(context, assets.highlight, pose, shankCanvasWidth, config.assetCenterYRatio, {
    alpha: highlightAlpha,
    composite: "screen",
    filter: `brightness(${1.04 + glintStrength * 0.18}) contrast(1.08)`,
    centerCutout: config.renderProfile === "solitaire"
      ? { width: settingCanvasWidth * HEAD_MASK_WIDTH_RATIO, height: settingCanvasWidth * HEAD_MASK_WIDTH_RATIO }
      : undefined,
  });
}
