import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const sourceRoot = path.join(root, "public", "images", "products", "catalog");
const outputRoot = path.join(root, "public", "try-on", "v1", "bracelets");
const size = 768;
const metals = ["yellow", "white"];

async function loadManifest() {
  const source = await fs.readFile(path.join(root, "src", "data", "bracelet-try-on-manifest.ts"), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  return module.braceletTryOnManifest;
}

function mask(layer) {
  const stops = layer === "front"
    ? `<stop offset="0%" stop-color="white" stop-opacity="0"/><stop offset="45%" stop-color="white" stop-opacity="0"/><stop offset="51%" stop-color="white" stop-opacity="1"/><stop offset="100%" stop-color="white" stop-opacity="1"/>`
    : `<stop offset="0%" stop-color="white" stop-opacity="1"/><stop offset="49%" stop-color="white" stop-opacity="1"/><stop offset="55%" stop-color="white" stop-opacity="0"/><stop offset="100%" stop-color="white" stop-opacity="0"/>`;
  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs>
    <rect width="${size}" height="${size}" fill="url(#fade)"/>
  </svg>`);
}

const manifest = await loadManifest();
const generated = [];

for (const entry of manifest) {
  const destination = path.join(outputRoot, entry.slug);
  await fs.mkdir(destination, { recursive: true });
  for (const metal of metals) {
    const source = path.join(sourceRoot, `${entry.slug}-${metal}-primary.webp`);
    const normalized = await sharp(source)
      .ensureAlpha()
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    for (const layer of ["front", "rear"]) {
      const buffer = await sharp(normalized)
        .composite([{ input: mask(layer), blend: "dest-in" }])
        .webp({ quality: 88, alphaQuality: 100, smartSubsample: true })
        .toBuffer();
      const file = path.join(destination, `${metal}-${layer}.webp`);
      await fs.writeFile(file, buffer);
      generated.push({
        slug: entry.slug,
        metal,
        layer,
        file: `/try-on/v1/bracelets/${entry.slug}/${metal}-${layer}.webp`,
        bytes: buffer.length,
      });
    }
  }
}

await fs.writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), bracelets: manifest.length, assets: generated }, null, 2)}\n`,
);

console.log(`Prepared ${generated.length} bracelet layers for ${manifest.length} products.`);
