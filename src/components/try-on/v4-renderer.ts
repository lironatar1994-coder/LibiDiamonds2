import type { Metal, RingTryOnV4Config } from "@/data/products";
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
  options: { alpha?: number; shadow?: boolean; filter?: string; composite?: GlobalCompositeOperation } = {},
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

export function drawLayeredRingV4(
  context: CanvasRenderingContext2D,
  pristineFrame: HTMLCanvasElement,
  assets: RingTryOnV4Assets,
  pose: RingPose,
  section: FingerSection,
  metal: Metal,
  config: RingTryOnV4Config,
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
    drawPerspectiveLayer(context, assets.setting, pose, settingCanvasWidth, config.assetCenterYRatio, {
      shadow: true,
      filter,
    });
  }

  const highlightAlpha = clamp(0.055 + glintStrength * 0.24, 0.055, 0.295);
  drawPerspectiveLayer(context, assets.highlight, pose, shankCanvasWidth, config.assetCenterYRatio, {
    alpha: highlightAlpha,
    composite: "screen",
    filter: `brightness(${1.04 + glintStrength * 0.18}) contrast(1.08)`,
  });
}
