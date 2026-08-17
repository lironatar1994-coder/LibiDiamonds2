"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import type { HandLandmarker, InteractiveSegmenter } from "@mediapipe/tasks-vision";
import { assetPath } from "@/lib/site";
import {
  metalNames,
  type BraceletTryOnConfig,
  type Metal,
  type RingTryOnConfig,
} from "@/data/products";
import { diamondDimensions } from "@/data/diamond-dimensions";
import {
  calculateRingPose,
  calculateStoneVisualWidth,
  calculateRingVisualDimensions,
  calculateManualRingPose,
  calculateManualWristPose,
  calculateWristPose,
  choosePrimaryHandIndex,
  assessHandScale,
  coverTransform,
  estimateLocalFingerSection,
  estimateLocalWristSection,
  fingerSectionForPose,
  fingerSectionMeasurement,
  mapLandmarks,
  smoothPose,
  type FingerSection,
  type FingerSectionMeasurement,
  type HandPoint,
  type RingPose,
} from "./geometry";
import { fingerSectionMeasurementFromMask } from "./finger-segmentation";
import { drawLayeredRingV4, type RingTryOnV4Assets } from "./v4-renderer";

type Mode = "live" | "photo";
type CameraState = "idle" | "starting" | "active" | "error";
type ModelState = "loading" | "ready" | "error";

interface TryOnDialogProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  metal: Metal;
  caratValue: string;
  caratSelected: boolean;
  ringSize: number | "unsure";
  config: RingTryOnConfig | BraceletTryOnConfig;
  caratOptions?: Array<{ value: string }>;
  onCaratChange?: (value: string) => void;
}

interface CalibrationPoint {
  x: number;
  y: number;
}

interface RingRenderMetrics {
  stoneDiameterMm: number;
  ringInnerDiameterMm: number;
  assetStoneRatio: number;
  pixelsPerMm: number | null;
}

interface RingOverlayMetrics {
  renderMode: RingTryOnConfig["renderMode"];
  scaleModel: RingTryOnConfig["scaleModel"];
  referenceWidthMm: number;
  ringInnerDiameterMm: number;
  caratScale: number;
  pixelsPerMm: number | null;
}

interface LayeredTryOnAssets {
  setting?: HTMLImageElement;
  front?: HTMLImageElement;
  rear?: HTMLImageElement;
}

interface HandTrackingSample {
  landmarks: HandPoint[];
  worldLandmarks: HandPoint[] | null;
  handedness: "Left" | "Right" | null;
}

interface PointerGesture {
  mode: "drag" | "pinch";
  originOffset: { x: number; y: number };
  originScale: number;
  originRotation: number;
  originDistance: number;
  originAngle: number;
  originMidpoint: { x: number; y: number };
}

function ToolIcon({ name, className = "h-5 w-5" }: { name: "camera" | "switch" | "freeze" | "reset" | "upload" | "close" | "calibrate" | "rotate" | "move"; className?: string }) {
  if (name === "close") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>;
  }
  if (name === "upload") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (name === "switch") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden><path d="M7 7h10l-2.5-2.5M17 17H7l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 7a7 7 0 0 1 1 3.6M5 17a7 7 0 0 1-1-3.6" strokeLinecap="round" /></svg>;
  }
  if (name === "freeze") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden><circle cx="12" cy="12" r="8" /><path d="M9.5 9v6M14.5 9v6" strokeLinecap="round" /></svg>;
  }
  if (name === "reset") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden><path d="M5 8V4m0 0h4M5 4l3 3a7 7 0 1 1-1.4 8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (name === "calibrate") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden><rect x="3.5" y="6" width="17" height="12" rx="1" /><path d="M7 15v3M10 13v5M13 15v3M16 13v5" /></svg>;
  }
  if (name === "rotate") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden><path d="M5.5 9A7 7 0 1 1 6.8 17" strokeLinecap="round" /><path d="M5.5 4v5h5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (name === "move") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden><path d="M12 3v18M3 12h18M12 3 9.5 5.5M12 3l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden><path d="M4 8.5h3l1.4-2h7.2l1.4 2h3v10H4z" strokeLinejoin="round" /><circle cx="12" cy="13.5" r="3.2" /></svg>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}

function drawMedia(
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  mirrored: boolean,
) {
  const transform = coverTransform(sourceWidth, sourceHeight, canvasWidth, canvasHeight, mirrored);
  context.save();
  if (mirrored) {
    context.translate(canvasWidth, 0);
    context.scale(-1, 1);
  }
  context.drawImage(
    source,
    transform.offsetX,
    transform.offsetY,
    sourceWidth * transform.scale,
    sourceHeight * transform.scale,
  );
  context.restore();
  return transform;
}

function displayPoseToSource(
  pose: RingPose,
  transform: ReturnType<typeof coverTransform>,
  canvasWidth: number,
): RingPose {
  const sourceRotation = transform.mirrored ? Math.PI - pose.rotation : pose.rotation;
  const displayX = transform.mirrored ? canvasWidth - pose.x : pose.x;
  return {
    ...pose,
    x: (displayX - transform.offsetX) / transform.scale,
    y: (pose.y - transform.offsetY) / transform.scale,
    width: pose.width / transform.scale,
    fingerWidth: pose.fingerWidth / transform.scale,
    axisLength: pose.axisLength / transform.scale,
    axisX: -Math.sin(sourceRotation),
    axisY: Math.cos(sourceRotation),
    rotation: sourceRotation,
  };
}

function sourcePoseToDisplay(
  pose: RingPose,
  transform: ReturnType<typeof coverTransform>,
  canvasWidth: number,
): RingPose {
  const sourceX = transform.offsetX + pose.x * transform.scale;
  const displayRotation = transform.mirrored ? Math.PI - pose.rotation : pose.rotation;
  return {
    ...pose,
    x: transform.mirrored ? canvasWidth - sourceX : sourceX,
    y: transform.offsetY + pose.y * transform.scale,
    width: pose.width * transform.scale,
    fingerWidth: pose.fingerWidth * transform.scale,
    axisLength: pose.axisLength * transform.scale,
    axisX: -Math.sin(displayRotation),
    axisY: Math.cos(displayRotation),
    rotation: displayRotation,
  };
}

function drawRingSetting(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  pose: RingPose,
  metal: Metal,
  metrics: RingRenderMetrics,
) {
  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.rotation);
  context.transform(1, 0, pose.skew, pose.perspectiveScale, 0, 0);

  const fingerWidth = pose.fingerWidth;
  const bandGradient = context.createLinearGradient(-fingerWidth * 0.58, 0, fingerWidth * 0.58, 0);
  if (metal === "white") {
    bandGradient.addColorStop(0, "rgba(143,148,148,0)");
    bandGradient.addColorStop(0.1, "#8f9494");
    bandGradient.addColorStop(0.24, "#f7f8f7");
    bandGradient.addColorStop(0.5, "#c5c9c8");
    bandGradient.addColorStop(0.76, "#ffffff");
    bandGradient.addColorStop(0.9, "#858a89");
    bandGradient.addColorStop(1, "rgba(133,138,137,0)");
  } else {
    bandGradient.addColorStop(0, "rgba(142,95,22,0)");
    bandGradient.addColorStop(0.1, "#8e5f16");
    bandGradient.addColorStop(0.24, "#f5d77b");
    bandGradient.addColorStop(0.5, "#b97a20");
    bandGradient.addColorStop(0.76, "#ffe59a");
    bandGradient.addColorStop(0.9, "#8b5912");
    bandGradient.addColorStop(1, "rgba(139,89,18,0)");
  }

  context.save();
  context.fillStyle = "rgba(18, 14, 9, 0.09)";
  context.shadowColor = "rgba(18, 14, 9, 0.24)";
  context.shadowBlur = Math.max(1, fingerWidth * 0.12);
  context.beginPath();
  context.ellipse(0, fingerWidth * 0.045, fingerWidth * 0.25, fingerWidth * 0.085, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.shadowColor = "rgba(15, 12, 8, 0.2)";
  context.shadowBlur = Math.max(1, pose.fingerWidth * 0.1);
  context.shadowOffsetY = Math.max(1, pose.fingerWidth * 0.035);

  context.beginPath();
  context.moveTo(-fingerWidth * 0.56, fingerWidth * 0.055);
  context.bezierCurveTo(
    -fingerWidth * 0.34,
    -fingerWidth * 0.015,
    fingerWidth * 0.34,
    -fingerWidth * 0.015,
    fingerWidth * 0.56,
    fingerWidth * 0.055,
  );
  context.lineCap = "round";
  context.lineWidth = Math.max(2, fingerWidth * 0.105);
  context.strokeStyle = bandGradient;
  context.stroke();

  context.shadowColor = "transparent";
  const highlightGradient = context.createLinearGradient(-fingerWidth * 0.46, 0, fingerWidth * 0.46, 0);
  highlightGradient.addColorStop(0, "rgba(255,255,255,0)");
  highlightGradient.addColorStop(0.18, metal === "white" ? "rgba(255,255,255,0.82)" : "rgba(255,239,181,0.82)");
  highlightGradient.addColorStop(0.82, metal === "white" ? "rgba(255,255,255,0.82)" : "rgba(255,239,181,0.82)");
  highlightGradient.addColorStop(1, "rgba(255,255,255,0)");
  context.beginPath();
  context.moveTo(-fingerWidth * 0.46, fingerWidth * 0.035);
  context.bezierCurveTo(
    -fingerWidth * 0.25,
    -fingerWidth * 0.02,
    fingerWidth * 0.25,
    -fingerWidth * 0.02,
    fingerWidth * 0.46,
    fingerWidth * 0.035,
  );
  context.lineWidth = Math.max(0.7, fingerWidth * 0.018);
  context.strokeStyle = highlightGradient;
  context.stroke();

  const relativeStoneSize = fingerWidth * (metrics.stoneDiameterMm / metrics.ringInnerDiameterMm);
  const calibratedStoneSize = metrics.pixelsPerMm === null
    ? relativeStoneSize
    : metrics.stoneDiameterMm * metrics.pixelsPerMm;
  const stoneSize = clamp(calibratedStoneSize, fingerWidth * 0.24, fingerWidth * 0.56);
  const headSize = stoneSize / metrics.assetStoneRatio;
  context.shadowColor = "rgba(15, 12, 8, 0.18)";
  context.shadowBlur = Math.max(1, fingerWidth * 0.075);
  context.shadowOffsetY = Math.max(0.5, fingerWidth * 0.025);
  context.filter = "brightness(0.94) saturate(0.92)";
  context.drawImage(image, -headSize / 2, -headSize * 0.54, headSize, headSize);
  context.restore();
}

function drawRingOverlay(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  pose: RingPose,
  metrics: RingOverlayMetrics,
) {
  const { settingWidth: overlayWidth } = calculateRingVisualDimensions({
    fingerWidth: pose.fingerWidth,
    referenceWidthMm: metrics.referenceWidthMm,
    ringInnerDiameterMm: metrics.ringInnerDiameterMm,
    caratScale: metrics.caratScale,
    scaleModel: metrics.scaleModel,
    ringSizeSelected: false,
    pixelsPerMm: metrics.pixelsPerMm,
  });
  const isBand = metrics.renderMode === "band-overlay";
  const overlayHeight = overlayWidth * (image.height / image.width);

  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.rotation);
  context.transform(1, 0, pose.skew, pose.perspectiveScale, 0, 0);
  context.shadowColor = "rgba(15, 12, 8, 0.16)";
  context.shadowBlur = Math.max(1, pose.fingerWidth * 0.06);
  context.shadowOffsetY = Math.max(0.5, pose.fingerWidth * 0.02);
  context.filter = "brightness(0.96) saturate(0.94)";
  context.drawImage(
    image,
    -overlayWidth / 2,
    -overlayHeight * (isBand ? 0.46 : 0.54),
    overlayWidth,
    overlayHeight,
  );
  context.restore();
}

function traceFingerSection(
  context: CanvasRenderingContext2D,
  pose: RingPose,
  section: FingerSection,
) {
  const normalX = -pose.axisY;
  const normalY = pose.axisX;
  const samples = section.contour.length >= 2
    ? section.contour
    : [-0.28, 0, 0.28].map((axisOffset) => ({
        axisOffset,
        left: pose.fingerWidth / 2,
        right: pose.fingerWidth / 2,
      }));
  const extended = [
    { ...samples[0], axisOffset: Math.min(-0.32, samples[0].axisOffset - 0.12) },
    ...samples,
    { ...samples[samples.length - 1], axisOffset: Math.max(0.32, samples[samples.length - 1].axisOffset + 0.12) },
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

function redrawFingerOverRear(
  context: CanvasRenderingContext2D,
  pristineFrame: HTMLCanvasElement,
  pose: RingPose,
  section: FingerSection,
) {
  context.save();
  traceFingerSection(context, pose, section);
  context.clip();
  context.drawImage(pristineFrame, 0, 0);
  context.restore();
}

function drawLayer(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  pose: RingPose,
  width: number,
  options: { alpha?: number; shadow?: boolean; sideOnly?: boolean } = {},
) {
  const height = width * (image.height / image.width);
  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.rotation);
  context.transform(1, 0, pose.skew, pose.perspectiveScale, 0, 0);
  if (options.sideOnly) {
    context.beginPath();
    context.rect(-width, -height, width - pose.fingerWidth * 0.28, height * 2);
    context.rect(pose.fingerWidth * 0.28, -height, width, height * 2);
    context.clip();
  }
  context.globalAlpha = options.alpha ?? 1;
  if (options.shadow) {
    context.shadowColor = "rgba(18,14,9,0.16)";
    context.shadowBlur = Math.max(1, pose.fingerWidth * 0.07);
    context.shadowOffsetY = Math.max(0.5, pose.fingerWidth * 0.025);
  }
  context.filter = `brightness(${clamp(0.97 - Math.abs(pose.depthTilt) * 0.04, 0.9, 0.98)}) saturate(0.96)`;
  context.drawImage(image, -width / 2, -height / 2, width, height);
  context.restore();
}

function drawGeneratedBandLayer(
  context: CanvasRenderingContext2D,
  pose: RingPose,
  metal: Metal,
  width: number,
  layer: "rear" | "front",
) {
  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.rotation);
  context.transform(1, 0, pose.skew, pose.perspectiveScale, 0, 0);
  const gradient = context.createLinearGradient(-width / 2, 0, width / 2, 0);
  if (metal === "white") {
    gradient.addColorStop(0, "rgba(125,131,131,0)");
    gradient.addColorStop(0.12, "#8f9494");
    gradient.addColorStop(0.34, "#f7f8f7");
    gradient.addColorStop(0.66, "#d3d6d5");
    gradient.addColorStop(0.88, "#858a89");
    gradient.addColorStop(1, "rgba(125,131,131,0)");
  } else {
    gradient.addColorStop(0, "rgba(139,89,18,0)");
    gradient.addColorStop(0.12, "#8e5f16");
    gradient.addColorStop(0.34, "#f5d77b");
    gradient.addColorStop(0.66, "#d6a442");
    gradient.addColorStop(0.88, "#8b5912");
    gradient.addColorStop(1, "rgba(139,89,18,0)");
  }
  context.strokeStyle = gradient;
  context.lineWidth = Math.max(2, pose.fingerWidth * 0.1);
  context.lineCap = "round";
  context.shadowColor = layer === "front" ? "rgba(16,12,8,0.18)" : "rgba(16,12,8,0.1)";
  context.shadowBlur = Math.max(1, pose.fingerWidth * (layer === "front" ? 0.06 : 0.03));
  context.beginPath();
  if (layer === "rear") {
    context.ellipse(0, pose.fingerWidth * 0.02, width * 0.47, pose.fingerWidth * 0.2, 0, Math.PI, Math.PI * 2);
  } else {
    context.moveTo(-width * 0.48, pose.fingerWidth * 0.03);
    context.quadraticCurveTo(-width * 0.34, -pose.fingerWidth * 0.02, -pose.fingerWidth * 0.28, 0);
    context.moveTo(pose.fingerWidth * 0.28, 0);
    context.quadraticCurveTo(width * 0.34, -pose.fingerWidth * 0.02, width * 0.48, pose.fingerWidth * 0.03);
  }
  context.stroke();
  context.restore();
}

function drawLayeredRing(
  context: CanvasRenderingContext2D,
  pristineFrame: HTMLCanvasElement,
  assets: LayeredTryOnAssets,
  fallbackAsset: HTMLImageElement,
  pose: RingPose,
  section: FingerSection,
  metal: Metal,
  metrics: RingOverlayMetrics & { ringSizeSelected: boolean; manualScale: number },
) {
  const { shankWidth, settingWidth } = calculateRingVisualDimensions({
    fingerWidth: pose.fingerWidth,
    referenceWidthMm: metrics.referenceWidthMm,
    ringInnerDiameterMm: metrics.ringInnerDiameterMm,
    caratScale: metrics.caratScale,
    scaleModel: metrics.scaleModel,
    ringSizeSelected: metrics.ringSizeSelected,
    pixelsPerMm: metrics.pixelsPerMm,
    manualScale: metrics.manualScale,
  });

  // Product masters use different camera angles, so independently cropped
  // front/rear arcs do not align reliably on a photographed finger. V3 keeps
  // the exact product setting, while one continuous generated shank provides
  // the physical wrap and is occluded by the measured finger contour.
  drawGeneratedBandLayer(context, pose, metal, shankWidth, "rear");
  redrawFingerOverRear(context, pristineFrame, pose, section);
  drawGeneratedBandLayer(context, pose, metal, shankWidth, "front");
  const topAsset = assets.setting ?? fallbackAsset;
  const topWidth = settingWidth;
  drawLayer(context, topAsset, pose, topWidth, { shadow: true });

  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.rotation);
  context.globalCompositeOperation = "multiply";
  context.fillStyle = "rgba(32,23,14,0.055)";
  context.filter = `blur(${Math.max(0.8, pose.fingerWidth * 0.035)}px)`;
  context.beginPath();
  context.ellipse(0, pose.fingerWidth * 0.08, topWidth * 0.22, pose.fingerWidth * 0.075, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawLayeredBracelet(
  context: CanvasRenderingContext2D,
  pristineFrame: HTMLCanvasElement,
  assets: LayeredTryOnAssets,
  pose: RingPose,
  section: FingerSection,
  config: BraceletTryOnConfig,
  manualScale: number,
) {
  if (!assets.front || !assets.rear) return;
  const width = pose.fingerWidth * config.clearanceRatio / config.assetWidthRatio * manualScale;

  drawLayer(context, assets.rear, pose, width, { alpha: 0.96 });
  redrawFingerOverRear(context, pristineFrame, pose, section);
  drawLayer(context, assets.front, pose, width, { shadow: true });

  context.save();
  context.translate(pose.x, pose.y);
  context.rotate(pose.rotation);
  context.transform(1, 0, pose.skew, pose.perspectiveScale, 0, 0);
  context.globalCompositeOperation = "multiply";
  context.fillStyle = config.renderMode === "rigid-bangle"
    ? "rgba(30,23,17,0.075)"
    : "rgba(30,23,17,0.055)";
  context.filter = `blur(${Math.max(1, pose.fingerWidth * 0.025)}px)`;
  context.beginPath();
  context.ellipse(0, pose.fingerWidth * 0.18, width * 0.36, pose.fingerWidth * 0.07, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawCalibrationOverlay(
  context: CanvasRenderingContext2D,
  points: CalibrationPoint[],
  active: boolean,
) {
  if (!points.length) return;
  context.save();
  context.lineWidth = Math.max(2, context.canvas.width / 360);
  context.strokeStyle = "rgba(247,246,242,0.96)";
  context.fillStyle = "#a88f60";
  context.shadowColor = "rgba(0,0,0,0.32)";
  context.shadowBlur = 8;
  if (points.length === 2) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    context.lineTo(points[1].x, points[1].y);
    context.stroke();
  } else if (active) {
    context.setLineDash([8, 7]);
    context.beginPath();
    context.arc(points[0].x, points[0].y, 18, 0, Math.PI * 2);
    context.stroke();
  }
  context.setLineDash([]);
  for (const point of points) {
    context.beginPath();
    context.arc(point.x, point.y, 6, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  context.restore();
}

function drawWristPlacementOverlay(
  context: CanvasRenderingContext2D,
  points: CalibrationPoint[],
  active: boolean,
) {
  if (!active || !points.length) return;
  context.save();
  context.lineWidth = Math.max(2, context.canvas.width / 360);
  context.strokeStyle = "rgba(247,246,242,0.96)";
  context.fillStyle = "#c9b78e";
  context.shadowColor = "rgba(0,0,0,0.35)";
  context.shadowBlur = 8;
  if (points.length === 2) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    context.lineTo(points[1].x, points[1].y);
    context.stroke();
  }
  for (const point of points) {
    context.beginPath();
    context.arc(point.x, point.y, 7, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  context.restore();
}

export default function TryOnDialog({
  open,
  onClose,
  productName,
  metal,
  caratValue,
  caratSelected,
  ringSize,
  config,
  caratOptions = [],
  onCaratChange,
}: TryOnDialogProps) {
  const defaultManualScale = config.target === "finger" ? 1.18 : 1;
  const [mode, setMode] = useState<Mode>("photo");
  const [modelState, setModelState] = useState<ModelState>("loading");
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [frozen, setFrozen] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [trackingVisible, setTrackingVisible] = useState(false);
  const [trackingNotice, setTrackingNotice] = useState<"far" | "uncertain" | null>(null);
  const [previewCaratValue, setPreviewCaratValue] = useState(caratValue);
  const [previewCaratSelected, setPreviewCaratSelected] = useState(caratSelected);
  const [manualScale, setManualScale] = useState(defaultManualScale);
  const [manualRotation, setManualRotation] = useState(0);
  const [manualOffset, setManualOffset] = useState({ x: 0, y: 0 });
  const [calibrationActive, setCalibrationActive] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
  const [wristPlacementActive, setWristPlacementActive] = useState(false);
  const [wristPlacementPoints, setWristPlacementPoints] = useState<CalibrationPoint[]>([]);
  const [ringPlacementActive, setRingPlacementActive] = useState(false);
  const [ringPlacementPoints, setRingPlacementPoints] = useState<CalibrationPoint[]>([]);
  const [segmentationState, setSegmentationState] = useState<"idle" | "loading" | "ready" | "fallback">("idle");

  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const photoUrlRef = useRef<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const segmenterRef = useRef<InteractiveSegmenter | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const roiAnalysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const framePendingRef = useRef(false);
  const lastDetectionTimestampRef = useRef(0);
  const latestHandRef = useRef<HandTrackingSample | null>(null);
  const latestFingerSectionRef = useRef<FingerSectionMeasurement | null>(null);
  const lastHandAtRef = useRef(0);
  const smoothedPoseRef = useRef<RingPose | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastDetectionRequestRef = useRef(0);
  const ringAssetRef = useRef<HTMLImageElement | null>(null);
  const layeredAssetsRef = useRef<LayeredTryOnAssets | null>(null);
  const v4AssetsRef = useRef<RingTryOnV4Assets | null>(null);
  const pristineFrameRef = useRef<HTMLCanvasElement | null>(null);
  const manualWristPoseRef = useRef<RingPose | null>(null);
  const manualRingPoseRef = useRef<RingPose | null>(null);
  const draggingRef = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pointerGestureRef = useRef<PointerGesture | null>(null);
  const glintUntilRef = useRef(0);
  const poseWasVisibleRef = useRef(false);
  onCloseRef.current = onClose;

  const selectedAssets = config.assetsByMetal[metal];
  const selectedAssetSrc = selectedAssets?.head ?? selectedAssets?.overlay;
  const selectedLayeredAssets = config.layeredAssetsByMetal[metal];
  const isBracelet = config.target === "wrist";
  const ringConfig = config.target === "finger" ? config : null;
  const v4Engine = process.env.NEXT_PUBLIC_RING_TRY_ON_ENGINE;
  const v4Enabled = Boolean(ringConfig && (
    v4Engine === "v4" || (v4Engine === "v4-pilot" && ringConfig.v4.pilot)
  ));
  const selectedV4Assets = v4Enabled ? ringConfig?.v4.assetsByMetal[metal] : undefined;
  const effectiveRingSize = ringSize === "unsure" ? 14 : ringSize;
  const ringInnerDiameterMm = (effectiveRingSize + 40) / Math.PI;
  const effectiveCaratValue = previewCaratSelected ? previewCaratValue : config.referenceCarat;
  const stoneDiameterMm = ringConfig ? diamondDimensions(ringConfig.shape, effectiveCaratValue).width : 0;
  const caratScale = Math.cbrt(
    Math.max(0.1, Number(effectiveCaratValue) || 1) / Math.max(0.1, Number(config.referenceCarat) || 1),
  );
  const caratSummary = previewCaratSelected ? `${previewCaratValue} קראט` : "קראט מותאם אוטומטית";
  const ringSizeSummary = ringSize === "unsure" ? "מידה מותאמת אוטומטית" : `מידה ${ringSize}`;
  const calibratedPixelsPerMm = calibrationPoints.length === 2
    ? Math.hypot(
        calibrationPoints[1].x - calibrationPoints[0].x,
        calibrationPoints[1].y - calibrationPoints[0].y,
      ) / 85.6
    : null;
  const resetAdjustment = useCallback(() => {
    setManualScale(isBracelet ? 1 : 1.18);
    setManualRotation(0);
    setManualOffset({ x: 0, y: 0 });
    smoothedPoseRef.current = null;
    activePointersRef.current.clear();
    pointerGestureRef.current = null;
  }, [isBracelet]);

  const triggerGlint = useCallback(() => {
    glintUntilRef.current = performance.now() + 720;
  }, []);

  const stepManualScale = useCallback((direction: -1 | 1) => {
    setManualScale((value) => clamp(value + direction * 0.1, isBracelet ? 0.6 : 0.7, 2));
    triggerGlint();
  }, [isBracelet, triggerGlint]);

  const stepPreviewCarat = useCallback((direction: -1 | 1) => {
    if (!caratOptions.length) return;
    const currentNumber = Number(effectiveCaratValue);
    let currentIndex = caratOptions.reduce((bestIndex, option, index) => (
      Math.abs(Number(option.value) - currentNumber) < Math.abs(Number(caratOptions[bestIndex].value) - currentNumber)
        ? index
        : bestIndex
    ), 0);
    currentIndex = clamp(currentIndex + direction, 0, caratOptions.length - 1);
    const nextValue = caratOptions[currentIndex].value;
    setPreviewCaratValue(nextValue);
    setPreviewCaratSelected(true);
    onCaratChange?.(nextValue);
    triggerGlint();
  }, [caratOptions, effectiveCaratValue, onCaratChange, triggerGlint]);

  const resetCalibration = useCallback(() => {
    setCalibrationActive(false);
    setCalibrationPoints([]);
  }, []);

  const resetWristPlacement = useCallback(() => {
    setWristPlacementActive(false);
    setWristPlacementPoints([]);
    manualWristPoseRef.current = null;
  }, []);

  const resetRingPlacement = useCallback(() => {
    setRingPlacementActive(false);
    setRingPlacementPoints([]);
    manualRingPoseRef.current = null;
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setFrozen(false);
    setCameraState("idle");
  }, []);

  const clearPhoto = useCallback(() => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = null;
    if (photoRef.current) photoRef.current.removeAttribute("src");
    setPhotoReady(false);
    setPhotoName("");
  }, []);

  useEffect(() => {
    if (!open) return;
    setMode("photo");
    setCameraError("");
    setTrackingVisible(false);
    setCalibrationActive(false);
    setCalibrationPoints([]);
    resetWristPlacement();
    resetRingPlacement();
    setSegmentationState(v4Enabled ? "loading" : "idle");
    poseWasVisibleRef.current = false;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), a[href]"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, resetRingPlacement, resetWristPlacement, v4Enabled]);

  useEffect(() => {
    if (!open) return;
    setPreviewCaratValue(caratValue);
    setPreviewCaratSelected(caratSelected);
  }, [caratSelected, caratValue, open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setModelState("loading");
    setCameraError("");

    void (async () => {
      try {
        const {
          FilesetResolver,
          HandLandmarker: HandLandmarkerClass,
          InteractiveSegmenter: InteractiveSegmenterClass,
        } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(assetPath("/try-on/v1/wasm"));
        const options = {
          baseOptions: {
            modelAssetPath: assetPath("/try-on/v1/models/hand_landmarker.task"),
          },
          runningMode: "VIDEO" as const,
          numHands: 2,
          minHandDetectionConfidence: 0.45,
          minHandPresenceConfidence: 0.42,
          minTrackingConfidence: 0.42,
        };

        let landmarker: HandLandmarker;
        try {
          landmarker = await HandLandmarkerClass.createFromOptions(vision, {
            ...options,
            baseOptions: { ...options.baseOptions, delegate: "GPU" },
          });
        } catch {
          landmarker = await HandLandmarkerClass.createFromOptions(vision, {
            ...options,
            baseOptions: { ...options.baseOptions, delegate: "CPU" },
          });
        }

        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setModelState("ready");
        if (v4Enabled && ringConfig) {
          setSegmentationState("loading");
          try {
            const segmenterOptions = {
              baseOptions: {
                modelAssetPath: assetPath("/try-on/v4/models/magic_touch.tflite"),
              },
              outputConfidenceMasks: true,
              outputCategoryMask: false,
            };
            let segmenter: InteractiveSegmenter;
            try {
              segmenter = await InteractiveSegmenterClass.createFromOptions(vision, {
                ...segmenterOptions,
                baseOptions: { ...segmenterOptions.baseOptions, delegate: "GPU" },
              });
            } catch {
              segmenter = await InteractiveSegmenterClass.createFromOptions(vision, {
                ...segmenterOptions,
                baseOptions: { ...segmenterOptions.baseOptions, delegate: "CPU" },
              });
            }
            if (cancelled) {
              segmenter.close();
              return;
            }
            segmenterRef.current = segmenter;
            setSegmentationState("ready");
          } catch (error) {
            console.warn("Ring try-on finger segmentation is unavailable; using local contour fallback", error);
            setSegmentationState("fallback");
          }
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Ring try-on hand tracking failed to initialize", error);
        setModelState("error");
        setCameraError("לא הצלחנו לטעון את זיהוי היד במכשיר הזה.");
      }
    })();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      segmenterRef.current?.close();
      segmenterRef.current = null;
      analysisCanvasRef.current = null;
      roiAnalysisCanvasRef.current = null;
      framePendingRef.current = false;
      latestFingerSectionRef.current = null;
    };
  }, [open, ringConfig, v4Enabled]);

  useEffect(() => {
    if (!open || !selectedAssetSrc) return;
    let active = true;
    ringAssetRef.current = null;
    loadImage(assetPath(selectedAssetSrc)).then((asset) => {
      if (active) ringAssetRef.current = asset;
    }).catch(() => setCameraError("נכסי הטבעת לא נטענו. רעננו את העמוד ונסו שוב."));
    return () => { active = false; };
  }, [open, selectedAssetSrc]);

  useEffect(() => {
    if (!open || !selectedLayeredAssets) return;
    let active = true;
    layeredAssetsRef.current = null;
    // V3 composes one measured shank around the finger and only needs the
    // product-specific top. Legacy front/rear crops remain on disk as a V2
    // fallback source, but loading them here can reintroduce broken seams.
    const entries = Object.entries(selectedLayeredAssets).filter(
      (entry): entry is [keyof LayeredTryOnAssets, string] => (
        isBracelet ? entry[0] === "front" || entry[0] === "rear" : entry[0] === "setting"
      ) && Boolean(entry[1]),
    );
    Promise.all(entries.map(async ([key, src]) => [key, await loadImage(assetPath(src))] as const))
      .then((loaded) => {
        if (active) layeredAssetsRef.current = Object.fromEntries(loaded) as LayeredTryOnAssets;
      })
      .catch(() => {
        // V2 remains loaded and is used automatically if any V3 layer is unavailable.
        if (active) layeredAssetsRef.current = null;
      });
    return () => { active = false; };
  }, [isBracelet, open, selectedLayeredAssets]);

  useEffect(() => {
    if (!open || !v4Enabled || !selectedV4Assets) {
      v4AssetsRef.current = null;
      return;
    }
    let active = true;
    v4AssetsRef.current = null;
    const entries = Object.entries(selectedV4Assets).filter(
      (entry): entry is [keyof RingTryOnV4Assets, string] => Boolean(entry[1]),
    );
    Promise.all(entries.map(async ([key, src]) => [key, await loadImage(assetPath(src))] as const))
      .then((loaded) => {
        if (!active) return;
        const assets = Object.fromEntries(loaded) as Partial<RingTryOnV4Assets>;
        if (!assets.front || !assets.rear || !assets.highlight) throw new Error("Incomplete V4 ring asset set");
        v4AssetsRef.current = assets as RingTryOnV4Assets;
      })
      .catch((error) => {
        console.error("V4 ring assets failed to load", error);
        if (active) setCameraError("נכסי ההדמיה החדשים לא נטענו. רעננו את העמוד ונסו שוב.");
      });
    return () => { active = false; };
  }, [open, selectedV4Assets, v4Enabled]);

  const sendFrame = useCallback((source: HTMLVideoElement | HTMLImageElement) => {
    const landmarker = landmarkerRef.current;
    if (!landmarker || framePendingRef.current) return;
    try {
      framePendingRef.current = true;
      const sourceWidth = source instanceof HTMLVideoElement
        ? source.videoWidth
        : source.naturalWidth;
      const sourceHeight = source instanceof HTMLVideoElement
        ? source.videoHeight
        : source.naturalHeight;
      if (!sourceWidth || !sourceHeight) return;

      const analysisMaxDimension = source instanceof HTMLImageElement ? 960 : 720;
      const resizeScale = Math.min(1, analysisMaxDimension / Math.max(sourceWidth, sourceHeight));
      const analysisCanvas = analysisCanvasRef.current ?? document.createElement("canvas");
      analysisCanvasRef.current = analysisCanvas;
      const analysisWidth = Math.max(1, Math.round(sourceWidth * resizeScale));
      const analysisHeight = Math.max(1, Math.round(sourceHeight * resizeScale));
      if (analysisCanvas.width !== analysisWidth) analysisCanvas.width = analysisWidth;
      if (analysisCanvas.height !== analysisHeight) analysisCanvas.height = analysisHeight;
      const analysisContext = analysisCanvas.getContext("2d", { alpha: false });
      if (!analysisContext) return;
      analysisContext.drawImage(source, 0, 0, analysisCanvas.width, analysisCanvas.height);

      let timestamp = Math.max(performance.now(), lastDetectionTimestampRef.current + 1);
      lastDetectionTimestampRef.current = timestamp;
      let result = landmarker.detectForVideo(analysisCanvas, timestamp);
      let hands = result.landmarks.map((detectedHand) => detectedHand.map(({ x, y, z }) => ({ x, y, z })));
      let primaryIndex = choosePrimaryHandIndex(hands);
      let hand = primaryIndex >= 0 ? hands[primaryIndex] : null;

      // A distant hand has too few source pixels for stable ring-finger edges.
      // On photos, run the same on-device model a second time on an expanded
      // hand crop, then map the refined landmarks back to the original frame.
      if (hand && source instanceof HTMLImageElement) {
        const firstAssessment = assessHandScale(hand, analysisWidth, analysisHeight);
        if (firstAssessment.shouldRefine) {
          const bounds = hand.reduce(
            (box, point) => ({
              minX: Math.min(box.minX, point.x),
              maxX: Math.max(box.maxX, point.x),
              minY: Math.min(box.minY, point.y),
              maxY: Math.max(box.maxY, point.y),
            }),
            { minX: 1, maxX: 0, minY: 1, maxY: 0 },
          );
          const handWidth = Math.max(0.08, bounds.maxX - bounds.minX);
          const handHeight = Math.max(0.08, bounds.maxY - bounds.minY);
          const cropLeft = clamp(bounds.minX - handWidth * 0.28, 0, 1);
          const cropTop = clamp(bounds.minY - handHeight * 0.24, 0, 1);
          const cropRight = clamp(bounds.maxX + handWidth * 0.28, 0, 1);
          const cropBottom = clamp(bounds.maxY + handHeight * 0.24, 0, 1);
          const cropX = cropLeft * sourceWidth;
          const cropY = cropTop * sourceHeight;
          const cropWidth = Math.max(1, (cropRight - cropLeft) * sourceWidth);
          const cropHeight = Math.max(1, (cropBottom - cropTop) * sourceHeight);
          const roiScale = Math.min(1, 960 / Math.max(cropWidth, cropHeight));
          const roiCanvas = roiAnalysisCanvasRef.current ?? document.createElement("canvas");
          roiAnalysisCanvasRef.current = roiCanvas;
          roiCanvas.width = Math.max(1, Math.round(cropWidth * roiScale));
          roiCanvas.height = Math.max(1, Math.round(cropHeight * roiScale));
          const roiContext = roiCanvas.getContext("2d", { alpha: false });
          if (roiContext) {
            roiContext.imageSmoothingEnabled = true;
            roiContext.imageSmoothingQuality = "high";
            roiContext.drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, roiCanvas.width, roiCanvas.height);
            timestamp = Math.max(performance.now(), lastDetectionTimestampRef.current + 1);
            lastDetectionTimestampRef.current = timestamp;
            const refinedResult = landmarker.detectForVideo(roiCanvas, timestamp);
            const refinedHands = refinedResult.landmarks.map((detectedHand) => detectedHand.map(({ x, y, z }) => ({
              x: cropLeft + x * (cropRight - cropLeft),
              y: cropTop + y * (cropBottom - cropTop),
              z,
            })));
            const refinedIndex = choosePrimaryHandIndex(refinedHands);
            const refinedHand = refinedIndex >= 0 ? refinedHands[refinedIndex] : null;
            if (refinedHand) {
              const refinedAssessment = assessHandScale(refinedHand, analysisWidth, analysisHeight);
              if (refinedAssessment.geometryConfidence >= firstAssessment.geometryConfidence * 0.82) {
                result = refinedResult;
                hands = refinedHands;
                primaryIndex = refinedIndex;
                hand = refinedHand;
              }
            }
          }
        }
      }
      if (hand) {
        const scaleAssessment = assessHandScale(hand, analysisWidth, analysisHeight);
        const worldHand = result.worldLandmarks[primaryIndex]?.map(({ x, y, z }) => ({ x, y, z })) ?? null;
        const handednessLabel = result.handedness[primaryIndex]?.[0]?.categoryName;
        const handedness = handednessLabel === "Left" || handednessLabel === "Right" ? handednessLabel : null;
        const analysisHand = mapLandmarks(
          hand,
          { scale: 1, offsetX: 0, offsetY: 0, mirrored: false },
          analysisWidth,
          analysisHeight,
        );
        const analysisPose = isBracelet
          ? calculateWristPose(analysisHand, { worldHand, handedness })
          : calculateRingPose(analysisHand, { worldHand, handedness });
        let sectionMeasurement: FingerSectionMeasurement | null = null;
        if (analysisPose) {
          const section = isBracelet
            ? estimateLocalWristSection(analysisContext, analysisPose)
            : estimateLocalFingerSection(analysisContext, analysisPose);
          sectionMeasurement = section
            ? fingerSectionMeasurement(section, analysisPose.axisLength)
            : null;

          const segmenter = !isBracelet && v4Enabled ? segmenterRef.current : null;
          if (segmenter) {
            try {
              const segmentation = segmenter.segment(analysisCanvas, {
                keypoint: {
                  x: clamp(analysisPose.x / analysisWidth, 0, 1),
                  y: clamp(analysisPose.y / analysisHeight, 0, 1),
                },
              });
              const confidenceMask = segmentation.confidenceMasks?.[0];
              if (confidenceMask) {
                const maskMeasurement = fingerSectionMeasurementFromMask({
                  data: confidenceMask.getAsFloat32Array(),
                  width: confidenceMask.width,
                  height: confidenceMask.height,
                  quality: segmentation.qualityScores?.[0] ?? 0.78,
                }, analysisPose, analysisWidth, analysisHeight);
                confidenceMask.close();
                if (maskMeasurement && (!sectionMeasurement || maskMeasurement.confidence >= sectionMeasurement.confidence)) {
                  sectionMeasurement = maskMeasurement;
                }
              }
            } catch (error) {
              console.warn("Finger segmentation failed; using contour measurement", error);
              setSegmentationState("fallback");
            }
          }
        }
        latestFingerSectionRef.current = sectionMeasurement;
        const sectionConfidence = sectionMeasurement?.confidence ?? 0;
        const confidentPlacement = Boolean(analysisPose) && (
          !v4Enabled || isBracelet || (
            !scaleAssessment.tooFar
            && scaleAssessment.geometryConfidence >= 0.34
            && (sectionConfidence >= 0.3 || scaleAssessment.geometryConfidence >= 0.62)
          )
        );
        if (confidentPlacement) {
          setTrackingNotice(null);
          latestHandRef.current = { landmarks: hand, worldLandmarks: worldHand, handedness };
          manualWristPoseRef.current = null;
          manualRingPoseRef.current = null;
          setWristPlacementActive(false);
          setWristPlacementPoints([]);
          setRingPlacementActive(false);
          setRingPlacementPoints([]);
          lastHandAtRef.current = performance.now();
          setTrackingVisible(true);
          if (!poseWasVisibleRef.current) {
            poseWasVisibleRef.current = true;
            triggerGlint();
          }
        } else if (!manualRingPoseRef.current) {
          setTrackingNotice(scaleAssessment.tooFar ? "far" : "uncertain");
          latestHandRef.current = null;
          smoothedPoseRef.current = null;
          setTrackingVisible(false);
        }
      } else if (isBracelet || performance.now() - lastHandAtRef.current > 350) {
        setTrackingNotice("uncertain");
        latestHandRef.current = null;
        latestFingerSectionRef.current = null;
        smoothedPoseRef.current = null;
        setTrackingVisible(false);
        if (isBracelet && !manualWristPoseRef.current) {
          setWristPlacementActive(true);
          setWristPlacementPoints([]);
        }
      }
    } catch (error) {
      console.error("Ring try-on hand tracking failed", error);
      setCameraError("לא הצלחנו לקרוא את התמונה במכשיר הזה.");
    } finally {
      framePendingRef.current = false;
      lastDetectionRequestRef.current = performance.now();
    }
  }, [isBracelet, triggerGlint, v4Enabled]);

  useEffect(() => {
    if (!open || mode !== "photo" || !photoReady || modelState !== "ready" || !photoRef.current) return;
    latestHandRef.current = null;
    smoothedPoseRef.current = null;
    setTrackingVisible(false);
    sendFrame(photoRef.current);
  }, [modelState, mode, open, photoReady, sendFrame]);

  useEffect(() => {
    if (!open) return;

    const render = (now: number) => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const rect = stage.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const canvasWidth = Math.max(1, Math.round(rect.width * pixelRatio));
      const canvasHeight = Math.max(1, Math.round(rect.height * pixelRatio));
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;
      context.fillStyle = "#171817";
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      let source: HTMLVideoElement | HTMLImageElement | null = null;
      let sourceWidth = 0;
      let sourceHeight = 0;
      let mirrored = false;
      if (mode === "live" && cameraState === "active" && videoRef.current?.videoWidth) {
        source = videoRef.current;
        sourceWidth = source.videoWidth;
        sourceHeight = source.videoHeight;
        mirrored = facingMode === "user";
        if (!frozen && modelState === "ready" && now - lastDetectionRequestRef.current > 110) {
          lastDetectionRequestRef.current = now;
          sendFrame(source);
        }
      } else if (mode === "photo" && photoReady && photoRef.current?.naturalWidth) {
        source = photoRef.current;
        sourceWidth = source.naturalWidth;
        sourceHeight = source.naturalHeight;
      }

      if (source && sourceWidth && sourceHeight) {
        const pristineFrame = pristineFrameRef.current ?? document.createElement("canvas");
        pristineFrameRef.current = pristineFrame;
        if (pristineFrame.width !== canvasWidth) pristineFrame.width = canvasWidth;
        if (pristineFrame.height !== canvasHeight) pristineFrame.height = canvasHeight;
        const pristineContext = pristineFrame.getContext("2d", { alpha: false });
        if (!pristineContext) return;
        pristineContext.fillStyle = "#171817";
        pristineContext.fillRect(0, 0, canvasWidth, canvasHeight);
        const transform = drawMedia(pristineContext, source, sourceWidth, sourceHeight, canvasWidth, canvasHeight, mirrored);
        context.drawImage(pristineFrame, 0, 0);
        const sample = latestHandRef.current;
        const manualWristPose = isBracelet ? manualWristPoseRef.current : null;
        const manualRingPose = !isBracelet && manualRingPoseRef.current
          ? sourcePoseToDisplay(manualRingPoseRef.current, transform, canvasWidth)
          : null;
        const ringAsset = ringAssetRef.current;
        const layeredAssets = layeredAssetsRef.current;
        const v4Assets = v4AssetsRef.current;
        const assetsReady = isBracelet
          ? Boolean(layeredAssets?.front && layeredAssets?.rear)
          : v4Enabled
            ? Boolean(v4Assets)
            : Boolean(ringAsset);
        if ((sample || manualWristPose || manualRingPose) && assetsReady) {
          const mapped = sample
            ? mapLandmarks(sample.landmarks, transform, sourceWidth, sourceHeight)
            : null;
          const detectedPose = manualWristPose ?? manualRingPose ?? (mapped && sample
            ? isBracelet
              ? calculateWristPose(mapped, {
                  section: latestFingerSectionRef.current,
                  worldHand: sample.worldLandmarks,
                  handedness: sample.handedness,
                })
              : calculateRingPose(mapped, {
                  section: latestFingerSectionRef.current,
                  worldHand: sample.worldLandmarks,
                  handedness: sample.handedness,
                })
            : null);
          if (detectedPose) {
            const adjustedPose = {
              ...detectedPose,
              x: detectedPose.x + manualOffset.x * pixelRatio,
              y: detectedPose.y + manualOffset.y * pixelRatio,
              rotation: detectedPose.rotation + manualRotation,
            };
            const pose = smoothPose(smoothedPoseRef.current, adjustedPose, mode === "live" ? 0.32 : 0.58);
            smoothedPoseRef.current = pose;
            if (v4Enabled && ringConfig && v4Assets) {
              const dimensions = calculateRingVisualDimensions({
                fingerWidth: pose.fingerWidth,
                scaleModel: ringConfig.scaleModel,
                referenceWidthMm: ringConfig.referenceWidthMm,
                ringInnerDiameterMm,
                caratScale: ringConfig.v4.renderProfile === "solitaire" ? 1 : caratScale,
                pixelsPerMm: calibratedPixelsPerMm,
                ringSizeSelected: ringSize !== "unsure",
                manualScale,
              });
              const stoneWidth = calculateStoneVisualWidth({
                fingerWidth: pose.fingerWidth,
                stoneWidthMm: stoneDiameterMm,
                ringInnerDiameterMm,
                pixelsPerMm: calibratedPixelsPerMm,
                manualScale,
              });
              drawLayeredRingV4(
                context,
                pristineFrame,
                v4Assets,
                pose,
                fingerSectionForPose(pose, manualRingPose ? null : latestFingerSectionRef.current),
                metal,
                ringConfig.v4,
                ringConfig.shape,
                { ...dimensions, stoneWidth },
                clamp((glintUntilRef.current - now) / 720, 0, 1),
              );
            } else if (isBracelet && layeredAssets && config.target === "wrist") {
              drawLayeredBracelet(
                context,
                pristineFrame,
                layeredAssets,
                pose,
                fingerSectionForPose(pose, manualWristPose ? null : latestFingerSectionRef.current),
                config,
                manualScale,
              );
            } else if (ringConfig && ringAsset) {
              const hasLayeredAssets = ringConfig.renderMode === "band-overlay"
                ? Boolean(layeredAssets)
                : Boolean(layeredAssets?.setting);
              if (layeredAssets && hasLayeredAssets) {
                drawLayeredRing(
                  context,
                  pristineFrame,
                  layeredAssets,
                  ringAsset,
                  pose,
                  fingerSectionForPose(pose, latestFingerSectionRef.current),
                  metal,
                  {
                    renderMode: ringConfig.renderMode,
                    scaleModel: ringConfig.scaleModel,
                    referenceWidthMm: ringConfig.referenceWidthMm,
                    ringInnerDiameterMm,
                    caratScale,
                    pixelsPerMm: calibratedPixelsPerMm === null ? null : calibratedPixelsPerMm,
                    ringSizeSelected: ringSize !== "unsure",
                    manualScale,
                  },
                );
              } else if (ringConfig.renderMode === "generated-band") {
                drawRingSetting(context, ringAsset, { ...pose, width: pose.width * manualScale, fingerWidth: pose.fingerWidth * manualScale }, metal, {
                  stoneDiameterMm,
                  ringInnerDiameterMm,
                  assetStoneRatio: ringConfig.assetStoneRatio ?? 0.68,
                  pixelsPerMm: calibratedPixelsPerMm === null ? null : calibratedPixelsPerMm * manualScale,
                });
              } else {
                drawRingOverlay(context, ringAsset, { ...pose, width: pose.width * manualScale, fingerWidth: pose.fingerWidth * manualScale }, {
                  renderMode: ringConfig.renderMode,
                  scaleModel: ringConfig.scaleModel,
                  referenceWidthMm: ringConfig.referenceWidthMm,
                  ringInnerDiameterMm,
                  caratScale,
                  pixelsPerMm: calibratedPixelsPerMm === null ? null : calibratedPixelsPerMm * manualScale,
                });
              }
            }
          }
        }
        drawCalibrationOverlay(context, calibrationPoints, calibrationActive);
        drawWristPlacementOverlay(context, wristPlacementPoints, wristPlacementActive);
        drawWristPlacementOverlay(context, ringPlacementPoints, ringPlacementActive);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [
    calibratedPixelsPerMm,
    caratScale,
    calibrationActive,
    calibrationPoints,
    cameraState,
    config,
    facingMode,
    frozen,
    manualOffset,
    manualRotation,
    manualScale,
    metal,
    mode,
    modelState,
    open,
    photoReady,
    ringInnerDiameterMm,
    isBracelet,
    ringConfig,
    ringSize,
    ringPlacementActive,
    ringPlacementPoints,
    sendFrame,
    stoneDiameterMm,
    v4Enabled,
    wristPlacementActive,
    wristPlacementPoints,
  ]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      clearPhoto();
      latestHandRef.current = null;
      latestFingerSectionRef.current = null;
      smoothedPoseRef.current = null;
      resetWristPlacement();
      resetRingPlacement();
      resetAdjustment();
      resetCalibration();
    }
  }, [clearPhoto, open, resetAdjustment, resetCalibration, resetRingPlacement, resetWristPlacement, stopCamera]);

  const startCamera = useCallback(async (requestedFacing = facingMode) => {
    stopCamera();
    setCameraState("starting");
    setCameraError("");
    setTrackingNotice(null);
    resetWristPlacement();
    resetRingPlacement();
    resetAdjustment();
    resetCalibration();
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: requestedFacing },
          width: { ideal: 960 },
          height: { ideal: 1280 },
        },
      });
      streamRef.current = stream;
      if (!videoRef.current) throw new Error("video-missing");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setFacingMode(requestedFacing);
      setCameraState("active");
    } catch (error) {
      stopCamera();
      setCameraState("error");
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
      setCameraError(denied ? "הגישה למצלמה לא אושרה. אפשר לעבור לתמונה ולהעלות צילום קיים." : "לא הצלחנו להפעיל את המצלמה במכשיר הזה.");
    }
  }, [facingMode, resetAdjustment, resetCalibration, resetRingPlacement, resetWristPlacement, stopCamera]);

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    if (nextMode === "photo") stopCamera();
    setMode(nextMode);
    setCameraError("");
    latestHandRef.current = null;
    latestFingerSectionRef.current = null;
    smoothedPoseRef.current = null;
    setTrackingVisible(false);
    resetWristPlacement();
    resetRingPlacement();
    resetAdjustment();
    resetCalibration();
  };

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCameraError("בחרו קובץ תמונה מסוג JPG, PNG או WebP.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setCameraError("התמונה גדולה מדי. בחרו תמונה עד 15MB.");
      return;
    }
    clearPhoto();
    setCameraError("");
    lastHandAtRef.current = 0;
    resetWristPlacement();
    resetRingPlacement();
    resetAdjustment();
    resetCalibration();
    const url = URL.createObjectURL(file);
    photoUrlRef.current = url;
    if (!photoRef.current) return;
    photoRef.current.src = url;
    try {
      await photoRef.current.decode();
      setPhotoName(file.name);
      setPhotoReady(true);
    } catch {
      setCameraError("לא הצלחנו לפתוח את התמונה שבחרתם.");
      clearPhoto();
    }
  };

  const toggleFreeze = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (frozen) {
      await video.play();
      setFrozen(false);
      resetCalibration();
    } else {
      video.pause();
      setFrozen(true);
    }
  };

  const startCalibration = async () => {
    if (mode === "live" && cameraState === "active" && !frozen && videoRef.current) {
      videoRef.current.pause();
      setFrozen(true);
    }
    setCalibrationPoints([]);
    setCalibrationActive(true);
    draggingRef.current = null;
  };

  const startWristPlacement = useCallback(() => {
    if (!isBracelet) return;
    resetCalibration();
    latestHandRef.current = null;
    latestFingerSectionRef.current = null;
    manualWristPoseRef.current = null;
    smoothedPoseRef.current = null;
    setTrackingVisible(false);
    setWristPlacementPoints([]);
    setWristPlacementActive(true);
    draggingRef.current = null;
  }, [isBracelet, resetCalibration]);

  const startRingPlacement = useCallback(() => {
    if (isBracelet || !v4Enabled) return;
    resetCalibration();
    resetAdjustment();
    latestHandRef.current = null;
    latestFingerSectionRef.current = null;
    manualRingPoseRef.current = null;
    smoothedPoseRef.current = null;
    setTrackingVisible(false);
    setRingPlacementPoints([]);
    setRingPlacementActive(true);
    activePointersRef.current.clear();
    pointerGestureRef.current = null;
  }, [isBracelet, resetAdjustment, resetCalibration, v4Enabled]);

  const beginPointerGesture = useCallback(() => {
    const points = [...activePointersRef.current.values()];
    if (points.length >= 2) {
      const [first, second] = points;
      pointerGestureRef.current = {
        mode: "pinch",
        originOffset: manualOffset,
        originScale: manualScale,
        originRotation: manualRotation,
        originDistance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
        originAngle: Math.atan2(second.y - first.y, second.x - first.x),
        originMidpoint: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
      };
    } else if (points.length === 1) {
      pointerGestureRef.current = {
        mode: "drag",
        originOffset: manualOffset,
        originScale: manualScale,
        originRotation: manualRotation,
        originDistance: 1,
        originAngle: 0,
        originMidpoint: points[0],
      };
    } else {
      pointerGestureRef.current = null;
    }
  }, [manualOffset, manualRotation, manualScale]);

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (calibrationActive) {
      const rect = event.currentTarget.getBoundingClientRect();
      const point = {
        x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width),
        y: (event.clientY - rect.top) * (event.currentTarget.height / rect.height),
      };
      if (calibrationPoints.length === 1) {
        setCalibrationPoints([calibrationPoints[0], point]);
        setCalibrationActive(false);
      } else {
        setCalibrationPoints([point]);
      }
      return;
    }
    if (isBracelet && wristPlacementActive) {
      const rect = event.currentTarget.getBoundingClientRect();
      const point = {
        x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width),
        y: (event.clientY - rect.top) * (event.currentTarget.height / rect.height),
      };
      if (wristPlacementPoints.length === 0) {
        setWristPlacementPoints([point]);
        return;
      }
      const pose = calculateManualWristPose(wristPlacementPoints[0], point);
      if (!pose) return;
      manualWristPoseRef.current = pose;
      smoothedPoseRef.current = null;
      setWristPlacementPoints([wristPlacementPoints[0], point]);
      setWristPlacementActive(false);
      setTrackingVisible(true);
      return;
    }
    if (!isBracelet && ringPlacementActive) {
      const rect = event.currentTarget.getBoundingClientRect();
      const point = {
        x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width),
        y: (event.clientY - rect.top) * (event.currentTarget.height / rect.height),
      };
      if (ringPlacementPoints.length === 0) {
        setRingPlacementPoints([point]);
        return;
      }
      const pose = calculateManualRingPose(ringPlacementPoints[0], point);
      if (!pose) return;
      const source = mode === "photo" ? photoRef.current : videoRef.current;
      const sourceWidth = mode === "photo" ? photoRef.current?.naturalWidth : videoRef.current?.videoWidth;
      const sourceHeight = mode === "photo" ? photoRef.current?.naturalHeight : videoRef.current?.videoHeight;
      if (!source || !sourceWidth || !sourceHeight) return;
      const transform = coverTransform(
        sourceWidth,
        sourceHeight,
        event.currentTarget.width,
        event.currentTarget.height,
        mode === "live" && facingMode === "user",
      );
      manualRingPoseRef.current = displayPoseToSource(pose, transform, event.currentTarget.width);
      smoothedPoseRef.current = null;
      setRingPlacementPoints([ringPlacementPoints[0], point]);
      setRingPlacementActive(false);
      setTrackingVisible(true);
      poseWasVisibleRef.current = true;
      triggerGlint();
      return;
    }
    if (!trackingVisible) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    beginPointerGesture();
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return;
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const gesture = pointerGestureRef.current;
    const points = [...activePointersRef.current.values()];
    if (!gesture || points.length === 0) return;
    if (gesture.mode === "pinch" && points.length >= 2) {
      const [first, second] = points;
      const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
      const angle = Math.atan2(second.y - first.y, second.x - first.x);
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      setManualScale(clamp(gesture.originScale * distance / gesture.originDistance, 0.55, 1.8));
      setManualRotation(gesture.originRotation + angle - gesture.originAngle);
      setManualOffset({
        x: gesture.originOffset.x + midpoint.x - gesture.originMidpoint.x,
        y: gesture.originOffset.y + midpoint.y - gesture.originMidpoint.y,
      });
    } else if (gesture.mode === "drag") {
      setManualOffset({
        x: gesture.originOffset.x + points[0].x - gesture.originMidpoint.x,
        y: gesture.originOffset.y + points[0].y - gesture.originMidpoint.y,
      });
    }
    triggerGlint();
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.delete(event.pointerId);
    pointerGestureRef.current = null;
    if (activePointersRef.current.size > 0) beginPointerGesture();
  };

  if (!open || typeof document === "undefined") return null;

  const hasMedia = photoReady;

  return createPortal(
    <div className="fixed inset-0 z-[110] bg-black/70 sm:grid sm:place-items-center sm:p-5" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="try-on-title"
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-paper sm:h-[min(92dvh,850px)] sm:max-w-5xl sm:border sm:border-white/20 sm:shadow-2xl"
      >
        <header className="flex min-h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="try-on-title" className="font-display text-xl font-medium sm:text-2xl">
              {productName} {isBracelet ? "על פרק היד" : "על היד"}
            </h2>
            <p className="mt-0.5 truncate text-[0.7rem] tracking-[0.05em] text-stone">
              {isBracelet
                ? `${metalNames[metal]} · התאמה אוטומטית לפרק היד`
                : v4Enabled
                  ? `${metalNames[metal]} · המחשה חזותית מדויקת יותר${calibratedPixelsPerMm !== null ? " · גודל מכויל" : ""}`
                  : `${metalNames[metal]} · ${caratSummary} · ${ringSizeSummary}`}
            </p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="grid h-11 w-11 place-items-center text-ink" aria-label="סגירת ההדמיה">
            <ToolIcon name="close" />
          </button>
        </header>

        <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden bg-[#171817]">
          <video ref={videoRef} playsInline muted className="hidden" />
          <img ref={photoRef} alt={isBracelet ? "התמונה שנבחרה להדמיית הצמיד" : "התמונה שנבחרה להדמיית הטבעת"} className="hidden" />
          <canvas
            ref={canvasRef}
            className={`h-full w-full touch-none ${calibrationActive || wristPlacementActive || ringPlacementActive ? "cursor-crosshair" : trackingVisible ? "cursor-move" : ""}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            aria-label={isBracelet ? "תצוגת הצמיד על פרק היד" : "תצוגת הטבעת על היד"}
          />

          {!hasMedia && (
            <div className="absolute inset-0 grid place-items-center overflow-y-auto px-5 py-7 text-on-onyx sm:px-8">
              <div className="w-full max-w-md text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#c9b78e]/60 bg-white/5 text-[#eadab5]">
                  <ToolIcon name="camera" className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-balance font-display text-2xl font-medium sm:text-3xl">
                  {isBracelet ? "כך מזהים את פרק היד בקלות" : "כך מזהים את היד בקלות"}
                </h3>
                <ol className="mx-auto mt-5 grid max-w-sm gap-2.5 text-start text-sm leading-5 text-white/85">
                  <li className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#c9b78e] font-semibold text-[#171817]">1</span><span>{isBracelet ? "הראו את כף היד, פרק היד וחלק מהאמה" : "הניחו את גב היד על משטח בהיר"}</span></li>
                  <li className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#c9b78e] font-semibold text-[#171817]">2</span><span>{isBracelet ? "קרבו עד שפרק היד ממלא את רוב המסך" : "קרבו עד שהיד ממלאת את רוב המסך"}</span></li>
                  <li className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#c9b78e] font-semibold text-[#171817]">3</span><span>{isBracelet ? "הסירו צמידים ושמרו על תאורה טובה" : "פתחו מעט את האצבעות והסירו טבעות"}</span></li>
                </ol>
                <label className="mt-6 inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 bg-paper px-6 text-base font-semibold text-ink outline-offset-4 focus-within:outline-2 focus-within:outline-white">
                  <ToolIcon name="camera" className="h-5 w-5" /> צילום חדש
                  <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handlePhoto} />
                </label>
                <label
                  className="mt-3 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 border border-white/50 px-5 text-sm font-semibold text-on-onyx outline-offset-4 focus-within:outline-2 focus-within:outline-white"
                >
                  <ToolIcon name="upload" className="h-4 w-4" /> בחירת תמונה מהמכשיר
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhoto} />
                </label>
                {!isBracelet && v4Enabled ? <p className="mt-4 text-xs leading-5 text-white/65">אם הזיהוי לא מצליח, אפשר למקם את הטבעת ידנית בשתי נגיעות.</p> : null}
              </div>
            </div>
          )}

          {hasMedia && modelState === "loading" && !calibrationActive && (
            <div role="status" aria-live="polite" className="absolute inset-x-4 top-4 mx-auto w-fit bg-black/75 px-4 py-2.5 text-sm text-white backdrop-blur">
              מכינים את זיהוי היד...
            </div>
          )}
          {hasMedia && modelState === "ready" && !trackingVisible && !calibrationActive && !wristPlacementActive && !ringPlacementActive && (
            <div role="status" aria-live="polite" className="absolute inset-x-4 top-4 mx-auto max-w-md bg-black/80 px-4 py-3.5 text-center text-white shadow-lg backdrop-blur">
              <strong className="block text-sm font-semibold">
                {isBracelet
                  ? "הציגו את כל פרק היד"
                  : trackingNotice === "far"
                    ? "היד רחוקה מדי בתמונה"
                    : "לא הצלחנו למקם את הטבעת אוטומטית"}
              </strong>
              <span className="mt-1 block text-xs leading-5 text-white/75">
                {isBracelet
                  ? "ודאו שכף היד, פרק היד וחלק מהאמה נראים בתמונה."
                  : trackingNotice === "far"
                    ? "צלמו שוב מקרוב יותר, כך שהיד תמלא את רוב המסך."
                    : "אפשר לנסות שוב, או למקם את הטבעת בשתי נגיעות על האצבע."}
              </span>
              {v4Enabled && !isBracelet ? (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <button type="button" onClick={startRingPlacement} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#c9b78e] px-4 text-sm font-semibold text-[#171817] outline-offset-2 focus-visible:outline-2 focus-visible:outline-white">
                    <ToolIcon name="move" className="h-4 w-4" /> מיקום ידני בשתי נגיעות
                  </button>
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-white/40 px-4 text-sm font-semibold outline-offset-2 focus-within:outline-2 focus-within:outline-white">
                    <ToolIcon name="upload" className="h-4 w-4" /> תמונה אחרת
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhoto} />
                  </label>
                </div>
              ) : null}
            </div>
          )}
          {hasMedia && isBracelet && wristPlacementActive && !calibrationActive && (
            <div className="absolute inset-x-4 top-4 mx-auto max-w-sm bg-black/78 px-4 py-3 text-center text-xs leading-5 text-white backdrop-blur">
              {wristPlacementPoints.length === 0
                ? "סמנו צד אחד של פרק היד"
                : "כעת סמנו את הצד השני של פרק היד"}
            </div>
          )}
          {hasMedia && !isBracelet && ringPlacementActive && !calibrationActive && (
            <div role="status" aria-live="polite" className="absolute inset-x-4 top-4 mx-auto max-w-sm bg-black/82 px-4 py-3 text-center text-sm leading-5 text-white shadow-lg backdrop-blur">
              <strong className="block">{ringPlacementPoints.length === 0 ? "נגיעה 1 מתוך 2" : "נגיעה 2 מתוך 2"}</strong>
              <span className="mt-1 block text-xs text-white/75">{ringPlacementPoints.length === 0
                ? "נגעו בצד אחד של האצבע, במקום שבו הטבעת צריכה לשבת."
                : "עכשיו נגעו בצד השני של אותה האצבע."}</span>
            </div>
          )}
          {cameraError && (
            <div className="absolute inset-x-4 top-4 mx-auto max-w-md bg-paper px-4 py-3 text-center text-xs leading-5 text-ink shadow-lg">{cameraError}</div>
          )}
          {hasMedia && calibrationActive && (
            <div className="absolute inset-x-4 top-4 mx-auto max-w-sm bg-black/78 px-4 py-3 text-center text-xs leading-5 text-white backdrop-blur">
              {calibrationPoints.length === 0
                ? "סמנו קצה אחד של הצד הארוך בכרטיס בנק"
                : "כעת סמנו את הקצה השני של אותו הצד"}
            </div>
          )}
          {hasMedia && calibratedPixelsPerMm !== null && !calibrationActive && (
            <div className="absolute left-3 top-3 border border-[#c9b78e]/75 bg-black/58 px-2.5 py-1.5 text-[0.62rem] text-white backdrop-blur">
              כיול גודל פעיל
            </div>
          )}
          {hasMedia && v4Enabled && trackingVisible && !calibrationActive && !ringPlacementActive && (
            <div role="status" aria-live="polite" className="absolute inset-x-3 top-3 mx-auto w-fit max-w-[calc(100%-1.5rem)] bg-black/70 px-3 py-2 text-center text-xs text-white/90 backdrop-blur">
              <strong className="font-semibold text-[#eadab5]">הטבעת מוכנה.</strong>{" "}
              {manualRingPoseRef.current ? "אפשר לגרור, לצבוט ולסובב." : "אפשר לגרור אותה, או לשנות את הגדלים למטה."}
            </div>
          )}

          {hasMedia && trackingVisible && !calibrationActive && !ringPlacementActive && !wristPlacementActive && (
            <div dir="rtl" className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-black/82 text-white shadow-[0_-10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md">
              <div className={`mx-auto grid w-full max-w-2xl divide-x divide-x-reverse divide-white/15 ${v4Enabled && !isBracelet && caratOptions.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                <div className="px-3 py-2.5 text-center">
                  <span className="block text-xs font-semibold text-[#eadab5]">{isBracelet ? "גודל הצמיד" : "גודל הטבעת"}</span>
                  <div className="mt-1.5 grid grid-cols-[3rem_1fr_3rem] items-center">
                    <button type="button" onClick={() => stepManualScale(-1)} className="grid h-12 place-items-center border border-white/25 bg-white/5 text-2xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-white" aria-label={isBracelet ? "הקטנת הצמיד" : "הקטנת הטבעת"}>−</button>
                    <strong className="font-display text-base font-medium tabular-nums">{Math.round(manualScale * 100)}%</strong>
                    <button type="button" onClick={() => stepManualScale(1)} className="grid h-12 place-items-center border border-white/25 bg-white/5 text-2xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-white" aria-label={isBracelet ? "הגדלת הצמיד" : "הגדלת הטבעת"}>+</button>
                  </div>
                </div>

                {v4Enabled && !isBracelet && caratOptions.length > 1 ? (
                  <div className="px-3 py-2.5 text-center">
                    <span className="block text-xs font-semibold text-[#eadab5]">גודל היהלום</span>
                    <div className="mt-1.5 grid grid-cols-[3rem_1fr_3rem] items-center">
                      <button
                        type="button"
                        onClick={() => stepPreviewCarat(-1)}
                        disabled={Number(effectiveCaratValue) <= Number(caratOptions[0].value)}
                        className="grid h-12 place-items-center border border-white/25 bg-white/5 text-2xl outline-offset-2 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-white"
                        aria-label="הקטנת היהלום"
                      >−</button>
                      <strong className="font-display text-base font-medium tabular-nums"><bdi>{effectiveCaratValue}</bdi> קראט</strong>
                      <button
                        type="button"
                        onClick={() => stepPreviewCarat(1)}
                        disabled={Number(effectiveCaratValue) >= Number(caratOptions[caratOptions.length - 1].value)}
                        className="grid h-12 place-items-center border border-white/25 bg-white/5 text-2xl outline-offset-2 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-white"
                        aria-label="הגדלת היהלום"
                      >+</button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mx-auto flex w-full max-w-3xl items-stretch justify-center gap-1.5 border-t border-white/15 px-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2">
                {v4Enabled && !isBracelet ? (
                  <button type="button" onClick={startRingPlacement} className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 border border-[#c9b78e]/70 px-2 text-xs font-semibold text-[#f0dfb7] outline-offset-2 focus-visible:outline-2 focus-visible:outline-white" aria-label="מיקום ידני של הטבעת בשתי נגיעות"><ToolIcon name="move" className="h-4 w-4" /> מיקום</button>
                ) : null}
                <button type="button" onClick={() => { setManualRotation((value) => value - Math.PI / 24); triggerGlint(); }} className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 border border-white/25 px-2 text-xs font-semibold outline-offset-2 focus-visible:outline-2 focus-visible:outline-white" aria-label={isBracelet ? "סיבוב הצמיד" : "סיבוב הטבעת"}><ToolIcon name="rotate" className="h-4 w-4" /> סיבוב</button>
                {isBracelet ? (
                  <button type="button" onClick={startWristPlacement} className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 border border-white/25 px-2 text-xs font-semibold outline-offset-2 focus-visible:outline-2 focus-visible:outline-white" aria-label="מיקום הצמיד מחדש"><ToolIcon name="move" className="h-4 w-4" /> מיקום מחדש</button>
                ) : (
                  <label className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 border border-white/25 px-2 text-xs font-semibold outline-offset-2 focus-within:outline-2 focus-within:outline-white">
                    <ToolIcon name="upload" className="h-4 w-4" /> תמונה אחרת
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhoto} />
                  </label>
                )}
                <button type="button" onClick={() => { resetAdjustment(); resetCalibration(); }} className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 border border-white/25 px-2 text-xs font-semibold outline-offset-2 focus-visible:outline-2 focus-visible:outline-white" aria-label={isBracelet ? "איפוס הצמיד" : "איפוס הטבעת"}><ToolIcon name="reset" className="h-4 w-4" /> איפוס</button>
              </div>
              {!isBracelet ? (
                <button type="button" onClick={() => void startCalibration()} className="block w-full border-t border-white/10 py-1.5 text-center text-[0.7rem] text-white/70 underline decoration-white/30 underline-offset-4 outline-offset-[-3px] focus-visible:outline-2 focus-visible:outline-white">
                  רוצים גודל מדויק יותר? כיול עם כרטיס בנק
                </button>
              ) : null}
            </div>
          )}
        </div>

        <footer className="flex min-h-12 items-center justify-center gap-2 border-t border-line bg-white px-4 py-2 text-center text-xs text-stone sm:px-6">
          <span>הצילום נשאר במכשיר. ההדמיה היא להמחשה.</span>
          <a href={assetPath("/service#camera-privacy")} target="_blank" rel="noopener noreferrer" className="shrink-0 border-b border-gilt/50 font-semibold text-ink-soft">פרטיות</a>
          {photoName ? <span className="sr-only">קובץ נבחר: {photoName}</span> : null}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
