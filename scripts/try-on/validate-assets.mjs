import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const failures = [];

async function loadTryOnManifest() {
  const source = await fs.readFile(path.join(root, "src", "data", "try-on-manifest.ts"), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  return module.tryOnManifest;
}

async function alphaMetrics(file) {
  const { data, info } = await sharp(file)
    .resize(64, 64, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let alphaSum = 0;
  let weightedX = 0;
  let weightedY = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3] / 255;
      alphaSum += alpha;
      weightedX += x * alpha;
      weightedY += y * alpha;
    }
  }
  return {
    coverage: alphaSum / (info.width * info.height),
    centerX: alphaSum ? weightedX / alphaSum / (info.width - 1) : 0,
    centerY: alphaSum ? weightedY / alphaSum / (info.height - 1) : 0,
    corners: [
      data[3],
      data[(info.width - 1) * info.channels + 3],
      data[((info.height - 1) * info.width) * info.channels + 3],
      data[((info.height * info.width) - 1) * info.channels + 3],
    ],
  };
}

const tryOnManifest = await loadTryOnManifest();
const catalog = JSON.parse(await fs.readFile(path.join(root, "media", "catalog.manifest.json"), "utf8"));
const ringSlugs = catalog.products.filter((product) => product.category === "rings").map((product) => product.slug);

if (tryOnManifest.length !== ringSlugs.length) {
  failures.push(`expected ${ringSlugs.length} try-on entries, found ${tryOnManifest.length}`);
}
const manifestSlugs = new Set(tryOnManifest.map((entry) => entry.slug));
for (const slug of ringSlugs) if (!manifestSlugs.has(slug)) failures.push(`${slug}: missing try-on entry`);
if (manifestSlugs.size !== tryOnManifest.length) failures.push("try-on manifest contains duplicate slugs");

for (const entry of tryOnManifest) {
  const size = entry.renderMode === "generated-band" ? 512 : 768;
  const kind = entry.renderMode === "generated-band" ? "head" : "overlay";
  for (const metal of ["yellow", "white"]) {
    const file = path.join(root, "public", "try-on", "v2", "rings", entry.slug, `${metal}-${kind}.webp`);
    try {
      const stat = await fs.stat(file);
      const metadata = await sharp(file).metadata();
      const alpha = await alphaMetrics(file);
      if (metadata.width !== size || metadata.height !== size) failures.push(`${entry.slug}/${metal}: expected ${size}x${size}`);
      if (!metadata.hasAlpha || metadata.channels !== 4) failures.push(`${entry.slug}/${metal}: missing alpha channel`);
      if (stat.size > 250 * 1024) failures.push(`${entry.slug}/${metal}: exceeds 250KB`);
      if (alpha.coverage < 0.025 || alpha.coverage > 0.72) failures.push(`${entry.slug}/${metal}: implausible alpha coverage ${alpha.coverage.toFixed(3)}`);
      if (alpha.corners.some((value) => value > 8)) failures.push(`${entry.slug}/${metal}: corners are not transparent`);
      if (Math.abs(alpha.centerX - 0.5) > 0.09 || Math.abs(alpha.centerY - 0.5) > 0.09) {
        failures.push(`${entry.slug}/${metal}: alpha center is off (${alpha.centerX.toFixed(2)}, ${alpha.centerY.toFixed(2)})`);
      }
    } catch (error) {
      failures.push(`${entry.slug}/${metal}: ${error instanceof Error ? error.message : "missing asset"}`);
    }
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  throw new Error(`${failures.length} try-on asset validation issue(s)`);
}

console.log(`Validated ${tryOnManifest.length} rings and ${tryOnManifest.length * 2} try-on assets.`);
