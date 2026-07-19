export interface FacePoint {
  x: number;
  y: number;
  z?: number;
}

export interface EarPose {
  side: "left" | "right";
  x: number;
  y: number;
  rotation: number;
  pixelsPerMm: number;
  earHeight: number;
  confidence: number;
}

export interface ManualEarPlacement {
  lobe: { x: number; y: number };
  top: { x: number; y: number };
}

const AVERAGE_IRIS_DIAMETER_MM = 11.7;
const AVERAGE_EAR_HEIGHT_MM = 60;

function distance(a: FacePoint, b: FacePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function average(points: FacePoint[]): FacePoint {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    z: points.reduce((sum, point) => sum + (point.z ?? 0), 0) / points.length,
  };
}

function validPoint(points: FacePoint[], index: number): FacePoint | null {
  const point = points[index];
  return point && Number.isFinite(point.x) && Number.isFinite(point.y) ? point : null;
}

function irisDiameter(points: FacePoint[], indices: number[]): number | null {
  const iris = indices.map((index) => validPoint(points, index)).filter((point): point is FacePoint => Boolean(point));
  if (iris.length !== indices.length) return null;
  const center = average(iris);
  const diameter = iris.reduce((max, point) => Math.max(max, distance(center, point) * 2), 0);
  return diameter > 1 ? diameter : null;
}

export function calculateEarPoses(face: FacePoint[]): EarPose[] {
  if (face.length < 468) return [];
  const forehead = validPoint(face, 10);
  const chin = validPoint(face, 152);
  const nose = validPoint(face, 1);
  const sideA = validPoint(face, 234);
  const sideB = validPoint(face, 454);
  if (!forehead || !chin || !nose || !sideA || !sideB) return [];

  const leftBoundary = sideA.x <= sideB.x ? sideA : sideB;
  const rightBoundary = sideA.x <= sideB.x ? sideB : sideA;
  const faceWidth = distance(leftBoundary, rightBoundary);
  const faceHeight = distance(forehead, chin);
  if (faceWidth < 20 || faceHeight < 30) return [];

  const rotation = Math.atan2(chin.y - forehead.y, chin.x - forehead.x) - Math.PI / 2;
  const leftSpan = Math.max(1, nose.x - leftBoundary.x);
  const rightSpan = Math.max(1, rightBoundary.x - nose.x);
  const balance = Math.min(leftSpan, rightSpan) / Math.max(leftSpan, rightSpan);
  const visibleSides: Array<"left" | "right"> = balance >= 0.62
    ? ["left", "right"]
    : leftSpan > rightSpan ? ["left"] : ["right"];

  const irisValues = [
    irisDiameter(face, [468, 469, 470, 471, 472]),
    irisDiameter(face, [473, 474, 475, 476, 477]),
  ].filter((value): value is number => Boolean(value));
  const fallbackPixelsPerMm = faceWidth / 145;
  const pixelsPerMm = irisValues.length
    ? irisValues.reduce((sum, value) => sum + value, 0) / irisValues.length / AVERAGE_IRIS_DIAMETER_MM
    : fallbackPixelsPerMm;

  return visibleSides.map((side) => {
    const boundary = side === "left" ? leftBoundary : rightBoundary;
    const direction = side === "left" ? -1 : 1;
    return {
      side,
      x: boundary.x + direction * faceWidth * 0.055,
      y: boundary.y + faceHeight * 0.16,
      rotation,
      pixelsPerMm: Math.max(0.2, pixelsPerMm),
      earHeight: faceHeight * 0.42,
      confidence: irisValues.length ? 0.78 : 0.58,
    };
  });
}

export function calculateManualEarPose(placement: ManualEarPlacement): EarPose | null {
  const earHeight = distance(placement.lobe, placement.top);
  if (!Number.isFinite(earHeight) || earHeight < 24) return null;
  const rotation = Math.atan2(placement.lobe.y - placement.top.y, placement.lobe.x - placement.top.x) - Math.PI / 2;
  return {
    side: placement.lobe.x < placement.top.x ? "left" : "right",
    x: placement.lobe.x,
    y: placement.lobe.y,
    rotation,
    pixelsPerMm: earHeight / AVERAGE_EAR_HEIGHT_MM,
    earHeight,
    confidence: 0.9,
  };
}

export function earringDisplaySize(options: {
  referenceWidthMm: number;
  referenceHeightMm: number;
  referenceCarat: number;
  selectedCarat: number;
  caratSelected: boolean;
  renderMode: "stud" | "halo-stud" | "huggie" | "hoop";
  pixelsPerMm: number;
  manualScale?: number;
}) {
  const isStud = options.renderMode === "stud" || options.renderMode === "halo-stud";
  const caratRatio = options.caratSelected && isStud && options.referenceCarat > 0
    ? Math.pow(Math.max(0.1, options.selectedCarat) / options.referenceCarat, 1 / 3)
    : 1;
  const haloScale = options.renderMode === "halo-stud" ? 0.78 + caratRatio * 0.22 : caratRatio;
  const manualScale = Math.min(1.8, Math.max(0.55, options.manualScale ?? 1));
  const width = options.referenceWidthMm * options.pixelsPerMm * haloScale * manualScale;
  const height = options.referenceHeightMm * options.pixelsPerMm * haloScale * manualScale;
  return {
    width: Math.max(isStud ? 10 : 22, width),
    height: Math.max(isStud ? 10 : 24, height),
  };
}
