import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..", "..");
const masterRoot = path.resolve(projectRoot, process.env.LIBI_MEDIA_ROOT || "../LibiDiamondsAssets/masters");
const v2Root = path.join(projectRoot, "public", "try-on", "v2", "rings");
const outputRoot = path.join(projectRoot, "public", "try-on", "v3", "rings");
const metals = ["yellow", "white"];
const outputSize = 768;

async function loadTryOnManifest() {
  const source = await fs.readFile(path.join(projectRoot, "src", "data", "try-on-manifest.ts"), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  return module.tryOnManifest;
}

function layerMask(entry, size, layer) {
  const top = entry.assetAnchor === "top";
  const centerY = top ? size * 0.4 : size * 0.6;
  const rearY = top ? size * 0.61 : size * 0.22;
  const frontY = top ? size * 0.27 : size * 0.53;
  const settingRx = entry.renderMode === "band-overlay" ? size * 0.48 : size * 0.39;
  const settingRy = entry.renderMode === "band-overlay" ? size * 0.16 : size * 0.2;

  if (entry.assetCrop === "side-strip") {
    const x = layer === "rear" ? size * 0.46 : size * 0.22;
    return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${x}" y="${size * 0.08}" width="${size * 0.32}" height="${size * 0.84}" rx="${size * 0.15}" fill="white"/>
    </svg>`);
  }

  if (layer === "rear") {
    return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${size * 0.035}" y="${rearY}" width="${size * 0.93}" height="${size * 0.3}" rx="${size * 0.15}" fill="white"/>
    </svg>`);
  }

  if (layer === "front") {
    return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <mask id="front-mask">
        <rect x="${size * 0.025}" y="${frontY}" width="${size * 0.95}" height="${size * 0.31}" rx="${size * 0.15}" fill="white"/>
        <ellipse cx="${size * 0.5}" cy="${centerY}" rx="${settingRx * 0.56}" ry="${settingRy * 1.08}" fill="black"/>
      </mask>
      <rect width="${size}" height="${size}" fill="white" mask="url(#front-mask)"/>
    </svg>`);
  }

  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="${size * 0.5}" cy="${centerY}" rx="${settingRx}" ry="${settingRy}" fill="white"/>
  </svg>`);
}

async function normalizeLayer(input, size = outputSize, paddingRatio = 0.08) {
  const trimmed = await sharp(input).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const metadata = await sharp(trimmed).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Empty V3 layer");
  const padding = Math.round(size * paddingRatio);
  const normalized = await sharp(trimmed)
    .resize(size - padding * 2, size - padding * 2, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: normalized, gravity: "center" }])
    .webp({ quality: 88, alphaQuality: 100, smartSubsample: true })
    .toBuffer();
}

const manifest = await loadTryOnManifest();
const generated = [];

for (const entry of manifest) {
  const productOutput = path.join(outputRoot, entry.slug);
  await fs.mkdir(productOutput, { recursive: true });
  for (const metal of metals) {
    if (entry.renderMode === "generated-band") {
      const v2Head = path.join(v2Root, entry.slug, `${metal}-head.webp`);
      const setting = await sharp(v2Head)
        .resize(outputSize, outputSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 90, alphaQuality: 100 })
        .toBuffer();
      const output = path.join(productOutput, `${metal}-setting.webp`);
      await fs.writeFile(output, setting);
      generated.push({ slug: entry.slug, metal, layer: "setting", file: `/try-on/v3/rings/${entry.slug}/${metal}-setting.webp`, bytes: setting.length });
      continue;
    }

    const source = path.join(masterRoot, entry.slug, metal, "primary.png");
    const metadata = await sharp(source).metadata();
    if (!metadata.width || !metadata.height || metadata.width !== metadata.height) {
      throw new Error(`${entry.slug}/${metal}: expected square transparent master`);
    }
    const prepared = await sharp(source).ensureAlpha().png().toBuffer();
    for (const layer of entry.renderMode === "band-overlay" ? ["front", "rear"] : ["setting", "front", "rear"]) {
      let masked = await sharp(prepared)
        .composite([{ input: layerMask(entry, metadata.width, layer), blend: "dest-in" }])
        .png()
        .toBuffer();
      if (entry.assetCrop === "side-strip") masked = await sharp(masked).rotate(90).png().toBuffer();
      const buffer = await normalizeLayer(masked, outputSize, layer === "setting" ? 0.075 : 0.11);
      const output = path.join(productOutput, `${metal}-${layer}.webp`);
      await fs.writeFile(output, buffer);
      generated.push({
        slug: entry.slug,
        metal,
        layer,
        file: `/try-on/v3/rings/${entry.slug}/${metal}-${layer}.webp`,
        bytes: buffer.length,
      });
    }
  }
}

await fs.mkdir(path.join(outputRoot, ".."), { recursive: true });
await fs.writeFile(
  path.join(outputRoot, "..", "manifest.json"),
  `${JSON.stringify({ version: 3, generatedAt: new Date().toISOString(), rings: manifest.length, assets: generated }, null, 2)}\n`,
);

console.log(`Prepared ${generated.length} V3 layers for ${manifest.length} rings.`);
