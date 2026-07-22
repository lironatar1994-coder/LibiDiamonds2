import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const sourceRoot = path.join(root, "public", "images", "products", "catalog");
const outputRoot = path.join(root, "public", "try-on", "v1", "earrings");
const size = 768;
const metals = ["yellow", "white"];

async function loadManifest() {
  const source = await fs.readFile(path.join(root, "src", "data", "earring-try-on-manifest.ts"), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  return module.earringTryOnManifest;
}

function depthMask(layer, frontSide = "left") {
  const stops = layer === "front"
    ? `<stop offset="0%" stop-color="white" stop-opacity="1"/><stop offset="49%" stop-color="white" stop-opacity="1"/><stop offset="67%" stop-color="white" stop-opacity="0"/><stop offset="100%" stop-color="white" stop-opacity="0"/>`
    : `<stop offset="0%" stop-color="white" stop-opacity="0"/><stop offset="42%" stop-color="white" stop-opacity="0"/><stop offset="60%" stop-color="white" stop-opacity="1"/><stop offset="100%" stop-color="white" stop-opacity="1"/>`;
  const x1 = frontSide === "left" ? 0 : 1;
  const x2 = frontSide === "left" ? 1 : 0;
  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="depth" x1="${x1}" y1="0" x2="${x2}" y2="0">${stops}</linearGradient></defs><rect width="${size}" height="${size}" fill="url(#depth)"/></svg>`);
}

function faceMaskSvg(width, height, mask) {
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="${mask.cx}" cy="${mask.cy}" rx="${mask.rx}" ry="${mask.ry}" fill="white"/></svg>`);
}

async function normalizedMaster(source, crop, renderMode, faceMask) {
  const isHoop = renderMode === "hoop" || renderMode === "huggie";
  const contentLimit = isHoop ? 690 : 580;
  let cropBuffer = await sharp(source)
    .ensureAlpha()
    .extract(crop)
    .png()
    .toBuffer();
  if (faceMask) {
    cropBuffer = await sharp(cropBuffer)
      .composite([{ input: faceMaskSvg(crop.width, crop.height, faceMask), blend: "dest-in" }])
      .png()
      .toBuffer();
  }
  const extracted = await sharp(cropBuffer)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 5 })
    .resize(contentLimit, contentLimit, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: extracted, gravity: "center" }]).png().toBuffer();
}

const manifest = await loadManifest();
const generated = [];

for (const entry of manifest) {
  const destination = path.join(outputRoot, entry.slug);
  await fs.mkdir(destination, { recursive: true });
  const isHoop = entry.renderMode === "hoop" || entry.renderMode === "huggie";
  for (const metal of metals) {
    const source = path.join(sourceRoot, `${entry.slug}-${metal}-primary.webp`);
    const master = await normalizedMaster(source, entry.crop, entry.renderMode, entry.faceMask);
    const layers = isHoop ? ["front", "rear"] : ["front"];
    for (const layer of layers) {
      const pipeline = sharp(master);
      const buffer = await (isHoop
        ? pipeline.composite([{ input: depthMask(layer, entry.frontSide), blend: "dest-in" }])
        : pipeline)
        .webp({ quality: 90, alphaQuality: 100, smartSubsample: true })
        .toBuffer();
      const file = path.join(destination, `${metal}-${layer}.webp`);
      await fs.writeFile(file, buffer);
      generated.push({
        slug: entry.slug,
        metal,
        layer,
        file: `/try-on/v1/earrings/${entry.slug}/${metal}-${layer}.webp`,
        bytes: buffer.length,
      });
    }
  }
}

await fs.writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), earrings: manifest.length, assets: generated }, null, 2)}\n`,
);

console.log(`Prepared ${generated.length} earring layers for ${manifest.length} products.`);
