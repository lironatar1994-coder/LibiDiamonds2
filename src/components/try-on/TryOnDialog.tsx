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
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { assetPath } from "@/lib/site";
import { metalNames, type Metal, type TryOnConfig } from "@/data/products";
import {
  calculateRingPose,
  choosePrimaryHand,
  coverTransform,
  estimateLocalFingerWidth,
  mapLandmarks,
  smoothPose,
  type HandPoint,
  type RingPose,
} from "./geometry";

type Mode = "live" | "photo";
type CameraState = "idle" | "starting" | "active" | "error";
type ModelState = "loading" | "ready" | "error";

interface TryOnDialogProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  metal: Metal;
  caratValue: string;
  ringSize: number | "unsure";
  config: TryOnConfig;
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

function ToolIcon({ name, className = "h-5 w-5" }: { name: "camera" | "switch" | "freeze" | "reset" | "upload" | "close" | "calibrate"; className?: string }) {
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

  const relativeStoneSize = fingerWidth * (metrics.stoneDiameterMm / metrics.ringInnerDiameterMm) * 1.3;
  const calibratedStoneSize = metrics.pixelsPerMm === null
    ? relativeStoneSize
    : metrics.stoneDiameterMm * metrics.pixelsPerMm;
  const stoneSize = clamp(calibratedStoneSize, fingerWidth * 0.27, fingerWidth * 0.72);
  const headSize = stoneSize / metrics.assetStoneRatio;
  context.shadowColor = "rgba(15, 12, 8, 0.18)";
  context.shadowBlur = Math.max(1, fingerWidth * 0.075);
  context.shadowOffsetY = Math.max(0.5, fingerWidth * 0.025);
  context.filter = "brightness(0.94) saturate(0.92)";
  context.drawImage(image, -headSize / 2, -headSize * 0.54, headSize, headSize);
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

export default function TryOnDialog({ open, onClose, productName, metal, caratValue, ringSize, config }: TryOnDialogProps) {
  const [mode, setMode] = useState<Mode>("live");
  const [modelState, setModelState] = useState<ModelState>("loading");
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [frozen, setFrozen] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [trackingVisible, setTrackingVisible] = useState(false);
  const [manualScale, setManualScale] = useState(1);
  const [manualRotation, setManualRotation] = useState(0);
  const [manualOffset, setManualOffset] = useState({ x: 0, y: 0 });
  const [calibrationActive, setCalibrationActive] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const photoUrlRef = useRef<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const framePendingRef = useRef(false);
  const lastDetectionTimestampRef = useRef(0);
  const latestHandRef = useRef<HandPoint[] | null>(null);
  const latestFingerWidthRatioRef = useRef<number | null>(null);
  const lastHandAtRef = useRef(0);
  const smoothedPoseRef = useRef<RingPose | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastDetectionRequestRef = useRef(0);
  const ringHeadRef = useRef<HTMLImageElement | null>(null);
  const draggingRef = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);

  const selectedAssets = config.assetsByMetal[metal] ?? config.assetsByMetal.yellow;
  const effectiveRingSize = ringSize === "unsure" ? (config.defaultRingSize ?? 14) : ringSize;
  const ringInnerDiameterMm = (effectiveRingSize + 40) / Math.PI;
  const stoneDiameterMm = config.stoneDiameterByCarat[caratValue]
    ?? config.stoneDiameterByCarat[config.referenceCarat]
    ?? 6.5;
  const calibratedPixelsPerMm = calibrationPoints.length === 2
    ? Math.hypot(
        calibrationPoints[1].x - calibrationPoints[0].x,
        calibrationPoints[1].y - calibrationPoints[0].y,
      ) / 85.6
    : null;
  const resetAdjustment = useCallback(() => {
    setManualScale(1);
    setManualRotation(0);
    setManualOffset({ x: 0, y: 0 });
    smoothedPoseRef.current = null;
  }, []);

  const resetCalibration = useCallback(() => {
    setCalibrationActive(false);
    setCalibrationPoints([]);
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
    setMode("live");
    setCameraError("");
    setTrackingVisible(false);
    setCalibrationActive(false);
    setCalibrationPoints([]);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setModelState("loading");
    setCameraError("");

    void (async () => {
      try {
        const { FilesetResolver, HandLandmarker: HandLandmarkerClass } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(assetPath("/try-on/v1/wasm"));
        const options = {
          baseOptions: {
            modelAssetPath: assetPath("/try-on/v1/models/hand_landmarker.task"),
          },
          runningMode: "VIDEO" as const,
          numHands: 2,
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
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
      analysisCanvasRef.current = null;
      framePendingRef.current = false;
      latestFingerWidthRatioRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !selectedAssets) return;
    let active = true;
    ringHeadRef.current = null;
    loadImage(assetPath(selectedAssets.head)).then((head) => {
      if (active) ringHeadRef.current = head;
    }).catch(() => setCameraError("נכסי הטבעת לא נטענו. רעננו את העמוד ונסו שוב."));
    return () => { active = false; };
  }, [open, selectedAssets]);

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

      const resizeScale = Math.min(1, 720 / Math.max(sourceWidth, sourceHeight));
      const analysisCanvas = analysisCanvasRef.current ?? document.createElement("canvas");
      analysisCanvasRef.current = analysisCanvas;
      const analysisWidth = Math.max(1, Math.round(sourceWidth * resizeScale));
      const analysisHeight = Math.max(1, Math.round(sourceHeight * resizeScale));
      if (analysisCanvas.width !== analysisWidth) analysisCanvas.width = analysisWidth;
      if (analysisCanvas.height !== analysisHeight) analysisCanvas.height = analysisHeight;
      const analysisContext = analysisCanvas.getContext("2d", { alpha: false });
      if (!analysisContext) return;
      analysisContext.drawImage(source, 0, 0, analysisCanvas.width, analysisCanvas.height);

      const timestamp = Math.max(performance.now(), lastDetectionTimestampRef.current + 1);
      lastDetectionTimestampRef.current = timestamp;
      const result = landmarker.detectForVideo(analysisCanvas, timestamp);
      const hands = result.landmarks.map((hand) => hand.map(({ x, y, z }) => ({ x, y, z })));
      const hand = choosePrimaryHand(hands);
      if (hand) {
        latestHandRef.current = hand;
        const analysisHand = mapLandmarks(
          hand,
          { scale: 1, offsetX: 0, offsetY: 0, mirrored: false },
          analysisWidth,
          analysisHeight,
        );
        const analysisPose = calculateRingPose(analysisHand);
        if (analysisPose) {
          const measuredWidth = estimateLocalFingerWidth(analysisContext, analysisPose);
          latestFingerWidthRatioRef.current = measuredWidth
            ? measuredWidth / analysisPose.axisLength
            : analysisPose.fingerWidth / analysisPose.axisLength;
        }
        lastHandAtRef.current = performance.now();
        setTrackingVisible(true);
      } else if (performance.now() - lastHandAtRef.current > 350) {
        latestHandRef.current = null;
        latestFingerWidthRatioRef.current = null;
        smoothedPoseRef.current = null;
        setTrackingVisible(false);
      }
    } catch (error) {
      console.error("Ring try-on hand tracking failed", error);
      setCameraError("לא הצלחנו לקרוא את התמונה במכשיר הזה.");
    } finally {
      framePendingRef.current = false;
      lastDetectionRequestRef.current = performance.now();
    }
  }, []);

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
        const transform = drawMedia(context, source, sourceWidth, sourceHeight, canvasWidth, canvasHeight, mirrored);
        const hand = latestHandRef.current;
        const ringHead = ringHeadRef.current;
        if (hand && ringHead) {
          const mapped = mapLandmarks(hand, transform, sourceWidth, sourceHeight);
          const detectedPose = calculateRingPose(mapped, latestFingerWidthRatioRef.current);
          if (detectedPose) {
            const adjustedPose = {
              ...detectedPose,
              x: detectedPose.x + detectedPose.fingerWidth * 0.12 + manualOffset.x * pixelRatio,
              y: detectedPose.y + manualOffset.y * pixelRatio,
              width: detectedPose.width * manualScale,
              fingerWidth: detectedPose.fingerWidth * manualScale,
              rotation: detectedPose.rotation + manualRotation,
            };
            const pose = smoothPose(smoothedPoseRef.current, adjustedPose, mode === "live" ? 0.32 : 0.58);
            smoothedPoseRef.current = pose;
            drawRingSetting(context, ringHead, pose, metal, {
              stoneDiameterMm,
              ringInnerDiameterMm,
              assetStoneRatio: config.assetStoneRatio ?? 0.68,
              pixelsPerMm: calibratedPixelsPerMm === null ? null : calibratedPixelsPerMm * manualScale,
            });
          }
        }
        drawCalibrationOverlay(context, calibrationPoints, calibrationActive);
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
    calibrationActive,
    calibrationPoints,
    cameraState,
    config.assetStoneRatio,
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
    sendFrame,
    stoneDiameterMm,
  ]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      clearPhoto();
      latestHandRef.current = null;
      latestFingerWidthRatioRef.current = null;
      smoothedPoseRef.current = null;
      resetAdjustment();
      resetCalibration();
    }
  }, [clearPhoto, open, resetAdjustment, resetCalibration, stopCamera]);

  const startCamera = useCallback(async (requestedFacing = facingMode) => {
    stopCamera();
    setCameraState("starting");
    setCameraError("");
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
  }, [facingMode, resetAdjustment, resetCalibration, stopCamera]);

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    if (nextMode === "photo") stopCamera();
    setMode(nextMode);
    setCameraError("");
    latestHandRef.current = null;
    latestFingerWidthRatioRef.current = null;
    smoothedPoseRef.current = null;
    setTrackingVisible(false);
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
    if (!trackingVisible) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: manualOffset.x, originY: manualOffset.y };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = draggingRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setManualOffset({ x: drag.originX + event.clientX - drag.x, y: drag.originY + event.clientY - drag.y });
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (draggingRef.current?.pointerId === event.pointerId) draggingRef.current = null;
  };

  if (!open || typeof document === "undefined") return null;

  const hasMedia = (mode === "live" && cameraState === "active") || (mode === "photo" && photoReady);

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/70 sm:grid sm:place-items-center sm:p-5" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="try-on-title"
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-ivory sm:h-[min(92dvh,850px)] sm:max-w-5xl sm:border sm:border-white/20 sm:shadow-2xl"
      >
        <header className="flex min-h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="try-on-title" className="font-display text-xl font-medium sm:text-2xl">{productName} על היד</h2>
            <p className="mt-0.5 truncate text-[0.7rem] tracking-[0.05em] text-stone">
              {metalNames[metal]} · {caratValue} קראט · {ringSize === "unsure" ? `מידה ${effectiveRingSize} משוערת` : `מידה ${ringSize}`}
            </p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="grid h-11 w-11 place-items-center text-ink" aria-label="סגירת ההדמיה">
            <ToolIcon name="close" />
          </button>
        </header>

        <div className="grid grid-cols-2 border-b border-line bg-white p-1.5" role="tablist" aria-label="סוג הדמיה">
          <button type="button" role="tab" aria-selected={mode === "live"} onClick={() => switchMode("live")} className={`min-h-11 text-sm font-semibold transition-colors ${mode === "live" ? "bg-ink text-ivory" : "text-stone"}`}>מצלמה חיה</button>
          <button type="button" role="tab" aria-selected={mode === "photo"} onClick={() => switchMode("photo")} className={`min-h-11 text-sm font-semibold transition-colors ${mode === "photo" ? "bg-ink text-ivory" : "text-stone"}`}>תמונה</button>
        </div>

        <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden bg-[#171817]">
          <video ref={videoRef} playsInline muted className="hidden" />
          <img ref={photoRef} alt="התמונה שנבחרה להדמיית הטבעת" className="hidden" />
          <canvas
            ref={canvasRef}
            className={`h-full w-full touch-none ${calibrationActive ? "cursor-crosshair" : trackingVisible ? "cursor-move" : ""}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            aria-label="תצוגת הטבעת על היד"
          />

          {!hasMedia && (
            <div className="absolute inset-0 grid place-items-center px-7 text-center text-ivory">
              <div className="max-w-sm">
                <ToolIcon name={mode === "live" ? "camera" : "upload"} className="mx-auto h-9 w-9 text-[#c9b78e]" />
                <h3 className="mt-5 font-display text-2xl font-medium sm:text-3xl">
                  {mode === "live" ? "הניחו את גב היד מול המצלמה" : "בחרו צילום ברור של גב היד"}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/65">האצבעות מעט פתוחות, בתאורה טבעית וללא תכשיטים נוספים.</p>
                {mode === "live" ? (
                  <button type="button" disabled={cameraState === "starting"} onClick={() => void startCamera()} className="mt-7 min-h-12 min-w-52 bg-ivory px-6 text-sm font-semibold text-ink disabled:opacity-60">
                    {cameraState === "starting" ? "פותחים מצלמה..." : "הפעלת המצלמה"}
                  </button>
                ) : (
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 bg-ivory px-5 text-sm font-semibold text-ink">
                      <ToolIcon name="camera" className="h-4 w-4" /> צילום חדש
                      <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handlePhoto} />
                    </label>
                    <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 border border-white/50 px-5 text-sm font-semibold text-ivory">
                      <ToolIcon name="upload" className="h-4 w-4" /> בחירת תמונה
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhoto} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasMedia && modelState === "loading" && !calibrationActive && (
            <div className="absolute inset-x-4 top-4 mx-auto w-fit bg-black/70 px-4 py-2 text-xs text-white backdrop-blur">מכינים את זיהוי היד...</div>
          )}
          {hasMedia && modelState === "ready" && !trackingVisible && !calibrationActive && (
            <div className="absolute inset-x-4 top-4 mx-auto w-fit bg-black/70 px-4 py-2 text-xs text-white backdrop-blur">מקמו את גב היד במרכז התמונה</div>
          )}
          {cameraError && (
            <div className="absolute inset-x-4 top-4 mx-auto max-w-md bg-ivory px-4 py-3 text-center text-xs leading-5 text-ink shadow-lg">{cameraError}</div>
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

          {hasMedia && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 border-t border-white/15 bg-black/65 px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 text-white backdrop-blur-sm">
              {mode === "live" && (
                <>
                  <button type="button" onClick={() => void startCamera(facingMode === "environment" ? "user" : "environment")} className="grid h-11 w-11 place-items-center border border-white/35 bg-black/35" aria-label="החלפת מצלמה"><ToolIcon name="switch" /></button>
                  <button type="button" onClick={() => void toggleFreeze()} className={`grid h-11 w-11 place-items-center border ${frozen ? "border-[#c9b78e] bg-[#c9b78e] text-ink" : "border-white/35 bg-black/35"}`} aria-label={frozen ? "המשך מצלמה" : "הקפאת התמונה"}><ToolIcon name="freeze" /></button>
                </>
              )}
              <button
                type="button"
                onClick={() => void startCalibration()}
                className={`grid h-11 w-11 place-items-center border ${calibrationActive || calibratedPixelsPerMm !== null ? "border-[#c9b78e] bg-[#c9b78e] text-ink" : "border-white/35 bg-black/35"}`}
                aria-label="כיול גודל באמצעות כרטיס בנק"
                title="כיול גודל"
              >
                <ToolIcon name="calibrate" />
              </button>
              <button type="button" onClick={() => setManualScale((value) => Math.max(0.72, value - 0.08))} className="grid h-11 w-11 place-items-center border border-white/35 bg-black/35 text-xl" aria-label="הקטנת הטבעת">−</button>
              <button type="button" onClick={() => setManualScale((value) => Math.min(1.45, value + 0.08))} className="grid h-11 w-11 place-items-center border border-white/35 bg-black/35 text-xl" aria-label="הגדלת הטבעת">+</button>
              <button type="button" onClick={() => setManualRotation((value) => value - Math.PI / 24)} className="grid h-11 w-11 place-items-center border border-white/35 bg-black/35 text-lg" aria-label="סיבוב הטבעת שמאלה">↶</button>
              <button type="button" onClick={() => { resetAdjustment(); resetCalibration(); }} className="grid h-11 w-11 place-items-center border border-white/35 bg-black/35" aria-label="איפוס מיקום וגודל הטבעת"><ToolIcon name="reset" /></button>
            </div>
          )}
        </div>

        <footer className="border-t border-line bg-white px-4 py-3 text-center sm:px-6">
          <p className="text-[0.7rem] leading-5 text-stone">
            הצילום נשאר במכשיר ואינו נשלח ל־LIBI. גודל האבן מחושב לפי {caratValue} קראט ו{ringSize === "unsure" ? `מידה ${effectiveRingSize} משוערת` : `מידה ${ringSize}`}.
            {calibratedPixelsPerMm !== null ? " כיול הכרטיס פעיל." : " ללא כיול, התוצאה היא הערכה חזותית."}
            {photoName ? <span className="sr-only"> קובץ נבחר: {photoName}</span> : null}
          </p>
          <a href={assetPath("/service#camera-privacy")} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block border-b border-gold/50 text-[0.68rem] text-ink-soft">פרטיות בשימוש במצלמה</a>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
