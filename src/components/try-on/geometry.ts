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
  rotation: number;
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
    z: point.z,
  }));
}

export function calculateRingPose(hand: HandPoint[]): RingPose | null {
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

  const positionRatio = 0.48;
  const x = ringMcp.x + (ringPip.x - ringMcp.x) * positionRatio;
  const y = ringMcp.y + (ringPip.y - ringMcp.y) * positionRatio;
  const fingerWidth = neighborGap * 0.68;

  return {
    x,
    y,
    width: fingerWidth,
    fingerWidth,
    rotation: Math.atan2(ringPip.y - ringMcp.y, ringPip.x - ringMcp.x) + Math.PI / 2,
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
    rotation: interpolateAngle(previous.rotation, next.rotation, amount),
  };
}
