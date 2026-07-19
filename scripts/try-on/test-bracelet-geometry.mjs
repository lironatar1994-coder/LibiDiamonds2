import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const source = await fs.readFile(path.join(root, "src", "components", "try-on", "geometry.ts"), "utf8");
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const geometry = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hand({ mirror = false } = {}) {
  const points = Array.from({ length: 21 }, () => ({ x: 150, y: 130, z: 0 }));
  const x = (value) => mirror ? 320 - value : value;
  points[0] = { x: x(160), y: 260, z: 0 };
  points[5] = { x: x(105), y: 155, z: -2 };
  points[9] = { x: x(140), y: 140, z: -3 };
  points[13] = { x: x(180), y: 145, z: -2 };
  points[17] = { x: x(215), y: 165, z: 0 };
  return points;
}

const right = geometry.calculateWristPose(hand(), { handedness: "Right" });
const left = geometry.calculateWristPose(hand({ mirror: true }), { handedness: "Left" });
assert(right && left, "wrist pose calculation failed");
assert(right.y > 260, "bracelet was not placed below the wrist crease");
assert(Math.abs((320 - left.x) - right.x) < 2, "mirrored wrist centering is not symmetric");
assert(right.fingerWidth > 60 && right.fingerWidth < 95, "wrist width is implausible");
assert(Math.abs(Math.sin(right.rotation)) < 0.25, "bracelet long axis is not perpendicular to the forearm");

const measured = {
  widthRatio: right.fingerWidth / right.axisLength * 0.94,
  centerOffsetRatio: 0.05,
  confidence: 0.9,
  contour: [-0.16, 0, 0.16].map((axisOffset) => ({ axisOffset, left: 0.33, right: 0.35 })),
};
const adjusted = geometry.calculateWristPose(hand(), { section: measured, handedness: "Right" });
assert(adjusted && adjusted.x !== right.x, "measured wrist center was not applied");
console.log("Validated bracelet geometry: wrist position, scale, mirrored hands and measured centering.");
