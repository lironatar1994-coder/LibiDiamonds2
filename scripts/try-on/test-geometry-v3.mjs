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

function hand({ mirror = false } = {}) {
  const points = Array.from({ length: 21 }, () => ({ x: 100, y: 100, z: 0 }));
  const x = (value) => mirror ? 300 - value : value;
  points[9] = { x: x(130), y: 180, z: 0 };
  points[13] = { x: x(170), y: 180, z: 0 };
  points[14] = { x: x(170), y: 100, z: -4 };
  points[17] = { x: x(210), y: 185, z: 0 };
  return points;
}

const measured = {
  widthRatio: 0.5,
  centerOffsetRatio: 0.08,
  confidence: 0.9,
  contour: [-0.16, 0, 0.16].map((axisOffset) => ({ axisOffset, left: 0.23, right: 0.27 })),
};
const world = hand().map((point) => ({ x: point.x / 1000, y: point.y / 1000, z: point.y === 100 ? -0.04 : 0 }));

const right = geometry.calculateRingPose(hand(), { section: measured, worldHand: world, handedness: "Right" });
const left = geometry.calculateRingPose(hand({ mirror: true }), {
  section: { ...measured, centerOffsetRatio: -measured.centerOffsetRatio },
  worldHand: world,
  handedness: "Left",
});
assert(right && left, "pose calculation failed");
assert(right.y < 124, "ring was not moved toward the PIP joint");
assert(Math.abs((300 - left.x) - right.x) < 2, "mirrored hand centering is not symmetric");
assert(right.fingerWidth > 35 && right.fingerWidth < 45, "measured width was not applied");
assert(right.perspectiveScale < 1, "world depth did not affect perspective");

const section = geometry.fingerSectionForPose(right, measured);
assert(section.confidence === measured.confidence, "section confidence was lost");
assert(section.contour.length === 3, "section contour was not preserved");

const unselected = geometry.calculateRingPose(hand(), {});
assert(unselected && unselected.x !== right.x, "measured center offset was not applied only when available");

const auraAuto = geometry.calculateRingVisualDimensions({
  fingerWidth: 100,
  referenceWidthMm: 10.5,
  ringInnerDiameterMm: (14 + 40) / Math.PI,
  caratScale: 1,
  scaleModel: "center-stone",
  ringSizeSelected: false,
});
assert(auraAuto.settingWidth > 70 && auraAuto.settingWidth < 75, "solitaire setting is not physically proportioned");
assert(auraAuto.shankWidth > 104 && auraAuto.shankWidth < 112, "automatic shank does not wrap the finger naturally");

const selectedSize = geometry.calculateRingVisualDimensions({
  fingerWidth: 100,
  referenceWidthMm: 10.5,
  ringInnerDiameterMm: (20 + 40) / Math.PI,
  caratScale: 1,
  scaleModel: "center-stone",
  ringSizeSelected: true,
});
assert(selectedSize.shankWidth > auraAuto.shankWidth, "explicit ring size did not change the shank");
assert(Math.abs(selectedSize.settingWidth - auraAuto.settingWidth) < 0.01, "ring size incorrectly changed the setting");

const selectedCarat = geometry.calculateRingVisualDimensions({
  fingerWidth: 100,
  referenceWidthMm: 10.5,
  ringInnerDiameterMm: (14 + 40) / Math.PI,
  caratScale: Math.cbrt(2),
  scaleModel: "center-stone",
  ringSizeSelected: false,
});
assert(selectedCarat.settingWidth > auraAuto.settingWidth, "explicit carat did not change the setting");
assert(Math.abs(selectedCarat.shankWidth - auraAuto.shankWidth) < 0.01, "carat incorrectly changed the shank");

const halo = geometry.calculateRingVisualDimensions({
  fingerWidth: 100,
  referenceWidthMm: 10,
  ringInnerDiameterMm: (14 + 40) / Math.PI,
  caratScale: 1,
  scaleModel: "setting-footprint",
  ringSizeSelected: false,
});
assert(halo.settingWidth > 68 && halo.settingWidth < 72, "halo footprint is outside safe proportions");

const band = geometry.calculateRingVisualDimensions({
  fingerWidth: 100,
  referenceWidthMm: 17.5,
  ringInnerDiameterMm: (14 + 40) / Math.PI,
  caratScale: 1,
  scaleModel: "band-width",
  ringSizeSelected: false,
});
assert(band.settingWidth > 118 && band.settingWidth < 124, "diamond band does not match finger width");

console.log("Validated V3 geometry and physical ring proportions across solitaire, halo and band models.");
