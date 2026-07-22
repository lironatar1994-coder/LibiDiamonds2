import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

async function loadModule(sourcePath) {
  const source = await readFile(sourcePath, "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
}

const manifest = JSON.parse(await readFile(path.join(root, "media/catalog.manifest.json"), "utf8"));
const { salesPotentialBySlug } = await loadModule(path.join(root, "src/data/sales-potential.ts"));
const { ringCatalogOpticalScaleBySlug } = await loadModule(path.join(root, "src/data/catalog-presentation.ts"));
const failures = [];
const manifestSlugs = new Set(manifest.products.map((product) => product.slug));
const ringSlugs = new Set(manifest.products.filter((product) => product.category === "rings").map((product) => product.slug));

for (const slug of manifestSlugs) {
  const score = salesPotentialBySlug[slug];
  if (!Number.isInteger(score) || score < 1 || score > 5) failures.push(`${slug}: invalid or missing sales potential`);
}
for (const slug of Object.keys(salesPotentialBySlug)) {
  if (!manifestSlugs.has(slug)) failures.push(`${slug}: sales potential entry is not in the live catalog`);
}
for (const slug of ringSlugs) {
  const scale = ringCatalogOpticalScaleBySlug[slug];
  if (typeof scale !== "number" || scale < 1.08 || scale > 1.18) failures.push(`${slug}: invalid or missing ring optical scale`);
}
for (const slug of Object.keys(ringCatalogOpticalScaleBySlug)) {
  if (!ringSlugs.has(slug)) failures.push(`${slug}: ring presentation entry is not in the live ring catalog`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  throw new Error(`${failures.length} merchandising validation issue(s)`);
}

console.log(`Validated merchandising for ${manifestSlugs.size} products and ${ringSlugs.size} ring presentations.`);
