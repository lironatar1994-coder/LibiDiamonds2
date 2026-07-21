import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const source = await fs.readFile(path.join(root, "src", "components", "try-on", "geometry.ts"), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const geometry = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const horizontal = geometry.calculateManualRingPose({ x: 80, y: 120 }, { x: 160, y: 120 });
assert(horizontal, "horizontal manual pose failed");
assert(Math.abs(horizontal.x - 120) < 0.01 && Math.abs(horizontal.y - 120) < 0.01, "manual pose is not centered between finger edges");
assert(Math.abs(horizontal.fingerWidth - 80) < 0.01, "manual pose did not preserve measured finger width");
assert(Math.abs(horizontal.rotation) < 0.01, "horizontal finger edges produced a rotated ring");

const diagonal = geometry.calculateManualRingPose({ x: 100, y: 80 }, { x: 160, y: 140 });
assert(diagonal, "diagonal manual pose failed");
assert(Math.abs(diagonal.rotation - Math.PI / 4) < 0.01, "manual pose rotation does not follow the selected finger cross-section");
assert(geometry.calculateManualRingPose({ x: 10, y: 10 }, { x: 14, y: 12 }) === null, "unsafe tiny manual selection was accepted");

const section = geometry.fingerSectionForPose(horizontal, {
  widthRatio: 0.52,
  centerOffsetRatio: 0.03,
  confidence: 0.92,
  contour: [-0.24, -0.16, -0.08, 0, 0.08, 0.16, 0.24].map((axisOffset) => ({ axisOffset, left: 0.25, right: 0.27 })),
});
assert(section.contour.length === 7, "V4 contour density was not preserved");
assert(section.confidence === 0.92, "V4 contour confidence was lost");

const dimensions = geometry.calculateRingVisualDimensions({
  fingerWidth: 80,
  referenceWidthMm: 10.5,
  ringInnerDiameterMm: (14 + 40) / Math.PI,
  caratScale: 1,
  scaleModel: "center-stone",
  ringSizeSelected: false,
  manualScale: 1.6,
});
assert(dimensions.shankWidth > 130 && dimensions.settingWidth > 90, "V4 manual scale was not applied to both shank and setting");

const makeHand = (scale) => {
  const center = { x: 0.5, y: 0.55 };
  const base = Array.from({ length: 21 }, () => ({ ...center }));
  const point = (x, y) => ({ x: center.x + (x - center.x) * scale, y: center.y + (y - center.y) * scale });
  base[0] = point(0.5, 0.92);
  base[4] = point(0.22, 0.58);
  base[8] = point(0.33, 0.18);
  base[9] = point(0.45, 0.66);
  base[10] = point(0.45, 0.5);
  base[12] = point(0.46, 0.2);
  base[13] = point(0.55, 0.67);
  base[14] = point(0.55, 0.52);
  base[16] = point(0.56, 0.25);
  base[17] = point(0.65, 0.69);
  base[18] = point(0.65, 0.56);
  base[20] = point(0.67, 0.34);
  return base;
};
const nearHand = geometry.assessHandScale(makeHand(1), 720, 720);
const mediumHand = geometry.assessHandScale(makeHand(0.52), 720, 720);
const farHand = geometry.assessHandScale(makeHand(0.16), 720, 720);
assert(nearHand.geometryConfidence > 0.7 && !nearHand.tooFar, "valid near-hand topology was rejected");
assert(mediumHand.shouldRefine && !mediumHand.tooFar, "medium-distance hand did not request ROI refinement");
assert(farHand.tooFar, "unsafe tiny hand was accepted for automatic placement");

const stone070 = geometry.calculateStoneVisualWidth({
  fingerWidth: 80,
  stoneWidthMm: 6.5 * Math.cbrt(0.7),
  ringInnerDiameterMm: (14 + 40) / Math.PI,
});
const stone200 = geometry.calculateStoneVisualWidth({
  fingerWidth: 80,
  stoneWidthMm: 6.5 * Math.cbrt(2),
  ringInnerDiameterMm: (14 + 40) / Math.PI,
});
assert(stone200 > stone070 * 1.35, "carat control did not resize the independent diamond head");

console.log("Validated V4 far-hand refinement gates, diamond-only carat scaling and physical ring geometry.");
