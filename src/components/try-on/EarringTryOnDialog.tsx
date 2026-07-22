"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { assetPath } from "@/lib/site";
import { metalNames, type EarringTryOnConfig, type Metal } from "@/data/products";
import {
  calculateEarPoses,
  calculateManualEarPose,
  earringDisplaySize,
  type EarPose,
  type FacePoint,
} from "@/components/try-on/ear-geometry";
import { coverTransform, type DrawTransform } from "@/components/try-on/geometry";

interface EarringTryOnDialogProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  metal: Metal;
  caratValue: string;
  caratSelected: boolean;
  config: EarringTryOnConfig;
}

type ModelState = "loading" | "ready" | "error";

interface LoadedAssets {
  front: HTMLImageElement;
  rear?: HTMLImageElement;
}

interface CanvasPoint {
  x: number;
  y: number;
}

function ToolIcon({ name, className = "h-5 w-5" }: { name: "close" | "camera" | "upload" | "ear" | "reset" | "place"; className?: string }) {
  if (name === "close") return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === "camera") return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7.5h3l1.4-2h7.2l1.4 2h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>;
  if (name === "upload") return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 14v5h14v-5" /></svg>;
  if (name === "reset") return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5.2 8.1A8 8 0 1 1 4 14" /><path d="M4 4v5h5" /></svg>;
  if (name === "place") return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>;
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.45"><path d="M13.5 3.5c-4.7 0-8 3.6-8 8.4 0 3.9 2.1 7.7 5.5 8.6 2.1.6 4.3-.7 4.5-2.9.2-1.8-.9-3-2.5-3.2-1.2-.2-2.2-1.1-2.2-2.4 0-1.6 1.2-2.7 2.8-2.7 2 0 3.2-1.2 3.2-2.9 0-1.7-1.2-2.9-3.3-2.9Z" /><circle cx="11.9" cy="17.1" r="1.45" /><path d="M10.5 18.2c.9 1 2.2 1.4 3.4.9" /></svg>;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawMedia(
  context: CanvasRenderingContext2D,
  source: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
): DrawTransform {
  const transform = coverTransform(source.naturalWidth, source.naturalHeight, canvasWidth, canvasHeight, false);
  context.drawImage(
    source,
    transform.offsetX,
    transform.offsetY,
    source.naturalWidth * transform.scale,
    source.naturalHeight * transform.scale,
  );
  return transform;
}

function mapFace(face: FacePoint[], transform: DrawTransform, source: HTMLImageElement): FacePoint[] {
  return face.map((point) => ({
    x: transform.offsetX + point.x * source.naturalWidth * transform.scale,
    y: transform.offsetY + point.y * source.naturalHeight * transform.scale,
    z: point.z === undefined ? undefined : point.z * source.naturalWidth * transform.scale,
  }));
}

function drawAsset(
  context: CanvasRenderingContext2D,
  asset: HTMLImageElement,
  pose: EarPose,
  width: number,
  height: number,
  anchorY: number,
  offset: CanvasPoint,
  rotation: number,
  shadow = false,
) {
  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.translate(pose.x + offset.x, pose.y + offset.y);
  context.rotate(pose.rotation + rotation);
  context.scale(pose.side === "left" ? -1 : 1, 1);
  if (shadow) {
    context.shadowColor = "rgba(20, 18, 14, 0.2)";
    context.shadowBlur = Math.max(2, width * 0.06);
    context.shadowOffsetY = Math.max(1, height * 0.025);
    context.filter = "contrast(1.14) brightness(1.035) saturate(0.92)";
  }
  context.drawImage(asset, -width / 2, -height * anchorY, width, height);
  context.restore();
}

function drawDiamondGlint(
  context: CanvasRenderingContext2D,
  pose: EarPose,
  width: number,
  height: number,
  anchorY: number,
  offset: CanvasPoint,
  rotation: number,
  progress: number,
) {
  if (progress < 0 || progress > 1) return;
  const centerY = height * (0.5 - anchorY);
  const sweepX = -width * 0.42 + width * 0.84 * progress;
  const intensity = Math.sin(progress * Math.PI) * 0.3;

  context.save();
  context.translate(pose.x + offset.x, pose.y + offset.y);
  context.rotate(pose.rotation + rotation);
  context.scale(pose.side === "left" ? -1 : 1, 1);
  context.beginPath();
  context.ellipse(0, centerY, width * 0.37, height * 0.37, 0, 0, Math.PI * 2);
  context.clip();
  context.globalCompositeOperation = "screen";
  context.globalAlpha = intensity;
  const gradient = context.createLinearGradient(sweepX - width * 0.18, 0, sweepX + width * 0.18, 0);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.46, "rgba(255,255,255,0.42)");
  gradient.addColorStop(0.54, "rgba(255,255,255,0.95)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(-width / 2, -height * anchorY, width, height);
  context.restore();
}

function redrawLobe(
  context: CanvasRenderingContext2D,
  pristine: HTMLCanvasElement,
  pose: EarPose,
  width: number,
  height: number,
  offset: CanvasPoint,
  rotation: number,
) {
  context.save();
  context.translate(pose.x + offset.x, pose.y + offset.y);
  context.rotate(pose.rotation + rotation);
  context.beginPath();
  context.ellipse(0, height * 0.015, Math.max(7, width * 0.2), Math.max(9, height * 0.13), 0, 0, Math.PI * 2);
  context.clip();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.drawImage(pristine, 0, 0);
  context.restore();
}

function drawPlacementOverlay(
  context: CanvasRenderingContext2D,
  points: CanvasPoint[],
  active: boolean,
) {
  if (!points.length) return;
  context.save();
  context.globalAlpha = active ? 0.92 : 0.18;
  context.strokeStyle = "#d3bd8b";
  context.fillStyle = "#f7f6f2";
  context.lineWidth = active ? 2 : 1.25;
  if (points.length === 2) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    context.lineTo(points[1].x, points[1].y);
    context.stroke();
  }
  points.forEach((point) => {
    context.beginPath();
    context.arc(point.x, point.y, active ? 6 : 4, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  });
  context.restore();
}

export default function EarringTryOnDialog({ open, onClose, productName, metal, caratValue, caratSelected, config }: EarringTryOnDialogProps) {
  const [modelState, setModelState] = useState<ModelState>("loading");
  const [photoReady, setPhotoReady] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [message, setMessage] = useState("");
  const [face, setFace] = useState<FacePoint[] | null>(null);
  const [manualPose, setManualPose] = useState<EarPose | null>(null);
  const [placementActive, setPlacementActive] = useState(false);
  const [placementPoints, setPlacementPoints] = useState<CanvasPoint[]>([]);
  const [manualScale, setManualScale] = useState(1);
  const [manualRotation, setManualRotation] = useState(0);
  const [manualOffset, setManualOffset] = useState<CanvasPoint>({ x: 0, y: 0 });
  const photoRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pristineRef = useRef<HTMLCanvasElement | null>(null);
  const assetsRef = useRef<LoadedAssets | null>(null);
  const landmarkerRef = useRef<import("@mediapipe/tasks-vision").FaceLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const draggingRef = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const lastGlintRef = useRef(0);

  const selectedAssets = config.layeredAssetsByMetal[metal]
    ?? config.layeredAssetsByMetal.yellow
    ?? config.layeredAssetsByMetal.white;
  const isHoop = config.renderMode === "hoop" || config.renderMode === "huggie";

  const clearPhoto = useCallback(() => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = null;
    setPhotoReady(false);
    setPhotoName("");
    setFace(null);
    setManualPose(null);
    setPlacementActive(false);
    setPlacementPoints([]);
  }, []);

  const resetAdjustment = useCallback(() => {
    setManualScale(1);
    setManualRotation(0);
    setManualOffset({ x: 0, y: 0 });
    setManualPose(null);
    setPlacementPoints([]);
    setPlacementActive(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
    (async () => {
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(assetPath("/try-on/v1/wasm"));
        const options = {
          baseOptions: { modelAssetPath: assetPath("/try-on/v1/models/face_landmarker.task") },
          runningMode: "IMAGE" as const,
          numFaces: 1,
          minFaceDetectionConfidence: 0.55,
          minFacePresenceConfidence: 0.55,
          minTrackingConfidence: 0.5,
          outputFacialTransformationMatrixes: true,
        };
        let landmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: { ...options.baseOptions, delegate: "GPU" },
          });
        } catch {
          landmarker = await FaceLandmarker.createFromOptions(vision, {
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
        console.error("Earring try-on face tracking failed to initialize", error);
        if (!cancelled) {
          setModelState("error");
          setMessage("הזיהוי האוטומטי אינו זמין במכשיר הזה. אפשר למקם את העגיל ידנית.");
        }
      }
    })();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !selectedAssets?.front) return;
    let active = true;
    assetsRef.current = null;
    Promise.all([
      loadImage(assetPath(selectedAssets.front)),
      selectedAssets.rear ? loadImage(assetPath(selectedAssets.rear)) : Promise.resolve(undefined),
    ]).then(([front, rear]) => {
      if (active) assetsRef.current = { front, rear };
    }).catch(() => {
      if (active) setMessage("נכסי העגיל לא נטענו. רעננו את העמוד ונסו שוב.");
    });
    return () => { active = false; };
  }, [open, selectedAssets]);

  const detectFace = useCallback(() => {
    const landmarker = landmarkerRef.current;
    const photo = photoRef.current;
    if (!landmarker || !photoReady || !photo?.naturalWidth) return;
    try {
      const result = landmarker.detect(photo);
      const detected = result.faceLandmarks[0]?.map(({ x, y, z }) => ({ x, y, z })) ?? null;
      setFace(detected);
      setManualPose(null);
      if (!detected) {
        setPlacementActive(true);
        setPlacementPoints([]);
        setMessage("לא זוהתה אוזן בבירור. סמנו את מרכז התנוך ואז את החלק העליון של האוזן.");
      } else {
        setPlacementActive(false);
        setMessage("");
        lastGlintRef.current = performance.now();
      }
    } catch (error) {
      console.error("Earring try-on face detection failed", error);
      setFace(null);
      setPlacementActive(true);
      setPlacementPoints([]);
      setMessage("לא הצלחנו לזהות את הפנים. אפשר למקם את העגיל ידנית.");
    }
  }, [photoReady]);

  useEffect(() => {
    if (open && photoReady && modelState === "ready") detectFace();
  }, [detectFace, modelState, open, photoReady]);

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("בחרו קובץ תמונה מסוג JPG, PNG או WebP.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setMessage("התמונה גדולה מדי. בחרו תמונה עד 15MB.");
      return;
    }
    clearPhoto();
    resetAdjustment();
    setMessage("");
    const url = URL.createObjectURL(file);
    photoUrlRef.current = url;
    if (!photoRef.current) return;
    photoRef.current.src = url;
    try {
      await photoRef.current.decode();
      setPhotoName(file.name);
      setPhotoReady(true);
    } catch {
      setMessage("לא הצלחנו לפתוח את התמונה שבחרתם.");
      clearPhoto();
    }
  };

  const startManualPlacement = () => {
    setManualPose(null);
    setPlacementPoints([]);
    setPlacementActive(true);
    setMessage("סמנו את מרכז התנוך ואז את החלק העליון של האוזן.");
    draggingRef.current = null;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = {
      x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width),
      y: (event.clientY - rect.top) * (event.currentTarget.height / rect.height),
    };
    if (placementActive) {
      if (!placementPoints.length) {
        setPlacementPoints([point]);
        setMessage("עכשיו סמנו את החלק העליון של האוזן.");
        return;
      }
      const pose = calculateManualEarPose({ lobe: placementPoints[0], top: point });
      if (!pose) return;
      setManualPose(pose);
      setPlacementPoints([placementPoints[0], point]);
      setPlacementActive(false);
      setMessage("");
      lastGlintRef.current = performance.now();
      return;
    }
    if (!manualPose && !face) return;
    lastGlintRef.current = performance.now();
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

  const selectedCarat = Number(caratValue);
  const referenceCarat = Number(config.referenceCarat);

  useEffect(() => {
    if (!open) return;
    const render = (now: number) => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      const photo = photoRef.current;
      if (!canvas || !stage) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }
      const rect = stage.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round(rect.height * pixelRatio));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;
      context.fillStyle = "#171817";
      context.fillRect(0, 0, width, height);

      if (photoReady && photo?.naturalWidth) {
        const pristine = pristineRef.current ?? document.createElement("canvas");
        pristineRef.current = pristine;
        if (pristine.width !== width) pristine.width = width;
        if (pristine.height !== height) pristine.height = height;
        const pristineContext = pristine.getContext("2d", { alpha: false });
        if (pristineContext) {
          pristineContext.fillStyle = "#171817";
          pristineContext.fillRect(0, 0, width, height);
          const transform = drawMedia(pristineContext, photo, width, height);
          context.drawImage(pristine, 0, 0);
          drawPlacementOverlay(context, placementPoints, placementActive);
          const poses = manualPose
            ? [manualPose]
            : face ? calculateEarPoses(mapFace(face, transform, photo)) : [];
          const assets = assetsRef.current;
          if (assets?.front) {
            poses.forEach((pose) => {
              const display = earringDisplaySize({
                referenceWidthMm: config.referenceWidthMm,
                referenceHeightMm: config.referenceHeightMm,
                referenceCarat,
                selectedCarat,
                caratSelected,
                renderMode: config.renderMode,
                pixelsPerMm: pose.pixelsPerMm,
                manualScale,
              });
              const drawOffset = { x: manualOffset.x * pixelRatio, y: manualOffset.y * pixelRatio };
              if (isHoop && assets.rear) {
                drawAsset(context, assets.rear, pose, display.width, display.height, config.anchorY, drawOffset, manualRotation);
                redrawLobe(context, pristine, pose, display.width, display.height, drawOffset, manualRotation);
              }
              drawAsset(context, assets.front, pose, display.width, display.height, config.anchorY, drawOffset, manualRotation, true);
              if (!isHoop) {
                drawDiamondGlint(
                  context,
                  pose,
                  display.width,
                  display.height,
                  config.anchorY,
                  drawOffset,
                  manualRotation,
                  (now - lastGlintRef.current) / 1100,
                );
              }
            });
          }
        }
      }
      animationRef.current = requestAnimationFrame(render);
    };
    animationRef.current = requestAnimationFrame(render);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [caratSelected, config, face, isHoop, manualOffset, manualPose, manualRotation, manualScale, open, photoReady, placementActive, placementPoints, referenceCarat, selectedCarat]);

  useEffect(() => {
    if (!open) {
      clearPhoto();
      resetAdjustment();
      setMessage("");
    }
  }, [clearPhoto, open, resetAdjustment]);

  const detectedCount = useMemo(() => {
    if (manualPose) return 1;
    if (!face || !photoRef.current?.naturalWidth || !canvasRef.current) return 0;
    const canvas = canvasRef.current;
    const transform = coverTransform(photoRef.current.naturalWidth, photoRef.current.naturalHeight, canvas.width, canvas.height, false);
    return calculateEarPoses(mapFace(face, transform, photoRef.current)).length;
  }, [face, manualPose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/70 sm:grid sm:place-items-center sm:p-5" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="earring-try-on-title" className="flex h-[100dvh] w-full flex-col overflow-hidden bg-ivory sm:h-[min(92dvh,850px)] sm:max-w-4xl sm:border sm:border-white/20 sm:shadow-2xl">
        <header className="flex min-h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="earring-try-on-title" className="truncate font-display text-xl font-medium sm:text-2xl">{productName} על האוזן</h2>
            <p className="mt-0.5 truncate text-[0.7rem] text-stone">{metalNames[metal]} · {caratValue} קראט לזוג</p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="grid h-11 w-11 place-items-center text-ink" aria-label="סגירת ההדמיה"><ToolIcon name="close" /></button>
        </header>

        <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden bg-[#171817]">
          <img ref={photoRef} alt="התמונה שנבחרה להדמיית העגילים" className="hidden" />
          <canvas
            ref={canvasRef}
            className={`h-full w-full touch-none ${placementActive ? "cursor-crosshair" : detectedCount ? "cursor-move" : ""}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            aria-label="תצוגת העגילים על האוזן"
          />

          {!photoReady && (
            <div className="absolute inset-0 grid place-items-center px-7 text-center text-ivory">
              <div className="max-w-sm">
                <ToolIcon name="ear" className="mx-auto h-10 w-10 text-[#c9b78e]" />
                <h3 className="mt-5 font-display text-2xl font-medium sm:text-3xl">בחרו צילום שבו האוזן גלויה</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">פנים ישרות או בזווית קלה, עם שיער מורחק מהתנוך.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 bg-ivory px-5 text-sm font-semibold text-ink">
                    <ToolIcon name="camera" className="h-4 w-4" /> צילום חדש
                    <input type="file" accept="image/*" capture="user" className="sr-only" onChange={handlePhoto} />
                  </label>
                  <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 border border-white/50 px-5 text-sm font-semibold text-ivory">
                    <ToolIcon name="upload" className="h-4 w-4" /> בחירת תמונה
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhoto} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {photoReady && modelState === "loading" && !placementActive && (
            <div className="absolute inset-x-4 top-4 mx-auto w-fit bg-black/70 px-4 py-2 text-xs text-white backdrop-blur">מאתרים את האוזן...</div>
          )}
          {photoReady && placementActive && (
            <div className="absolute inset-x-4 top-4 mx-auto max-w-sm bg-black/78 px-4 py-3 text-center text-xs leading-5 text-white backdrop-blur">{placementPoints.length ? "סמנו את החלק העליון של האוזן" : "סמנו את מרכז התנוך"}</div>
          )}
          {photoReady && message && !placementActive && (
            <div className="absolute inset-x-4 top-4 mx-auto max-w-md bg-ivory px-4 py-3 text-center text-xs leading-5 text-ink shadow-lg">{message}</div>
          )}

          {photoReady && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 border-t border-white/15 bg-black/65 px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 text-white backdrop-blur-sm">
              <button type="button" onClick={startManualPlacement} className={`grid h-11 w-11 place-items-center border ${placementActive ? "border-[#c9b78e] bg-[#c9b78e] text-ink" : "border-white/35 bg-black/35"}`} aria-label="מיקום העגיל מחדש" title="מיקום מחדש"><ToolIcon name="place" /></button>
              <button type="button" onClick={() => { lastGlintRef.current = performance.now(); setManualScale((value) => Math.max(0.65, value - 0.08)); }} className="grid h-11 w-11 place-items-center border border-white/35 bg-black/35 text-xl" aria-label="הקטנת העגיל">−</button>
              <button type="button" onClick={() => { lastGlintRef.current = performance.now(); setManualScale((value) => Math.min(1.65, value + 0.08)); }} className="grid h-11 w-11 place-items-center border border-white/35 bg-black/35 text-xl" aria-label="הגדלת העגיל">+</button>
              <button type="button" onClick={() => { lastGlintRef.current = performance.now(); setManualRotation((value) => value - Math.PI / 24); }} className="grid h-11 w-11 place-items-center border border-white/35 bg-black/35 text-lg" aria-label="סיבוב העגיל">↶</button>
              <button type="button" onClick={() => { lastGlintRef.current = performance.now(); resetAdjustment(); if (!face) startManualPlacement(); }} className="grid h-11 w-11 place-items-center border border-white/35 bg-black/35" aria-label="איפוס מיקום וגודל העגיל"><ToolIcon name="reset" /></button>
            </div>
          )}
        </div>

        <footer className="border-t border-line bg-white px-4 py-3 text-center sm:px-6">
          <p className="text-[0.7rem] leading-5 text-stone">הצילום נשאר במכשיר ואינו נשלח ל־LIBI. ההדמיה להמחשת גודל ומראה.</p>
          <a href={assetPath("/service#camera-privacy")} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block border-b border-gold/50 text-[0.68rem] text-ink-soft">פרטיות בשימוש בתמונה</a>
          {photoName ? <span className="sr-only">קובץ נבחר: {photoName}</span> : null}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
