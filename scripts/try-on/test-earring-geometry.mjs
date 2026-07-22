import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const source = await fs.readFile(path.join(root, "src", "components", "try-on", "ear-geometry.ts"), "utf8");
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const geometry = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manual = geometry.calculateManualEarPose({ lobe: { x: 180, y: 260 }, top: { x: 170, y: 120 } });
assert(manual, "manual pose should resolve");
assert(manual.pixelsPerMm > 2, "manual pose should derive physical scale");

const base = geometry.earringDisplaySize({
  referenceWidthMm: 5.1,
  referenceHeightMm: 5.1,
  referenceCarat: 1,
  selectedCarat: 1,
  caratSelected: false,
  renderMode: "stud",
  pixelsPerMm: 4,
});
const larger = geometry.earringDisplaySize({
  referenceWidthMm: 5.1,
  referenceHeightMm: 5.1,
  referenceCarat: 1,
  selectedCarat: 2,
  caratSelected: true,
  renderMode: "stud",
  pixelsPerMm: 4,
});
assert(base.width > 45, "default stud should remain visually prominent after calibration");
assert(base.height > 45, "default stud height should remain visually prominent after calibration");
const hoop = geometry.earringDisplaySize({
  referenceWidthMm: 20,
  referenceHeightMm: 22,
  referenceCarat: 1.2,
  selectedCarat: 2,
  caratSelected: true,
  renderMode: "hoop",
  pixelsPerMm: 4,
});
assert(larger.width > base.width, "explicit stud carat should increase display size");
assert(Math.abs(hoop.width - 80) < 0.01, "hoop carat must not change physical diameter");
assert(geometry.calculateManualEarPose({ lobe: { x: 1, y: 1 }, top: { x: 2, y: 2 } }) === null, "short manual baseline should fail");
console.log("Earring geometry checks passed.");
