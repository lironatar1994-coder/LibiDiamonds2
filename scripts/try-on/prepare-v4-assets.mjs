import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..", "..");
const masterRoot = path.resolve(projectRoot, process.env.LIBI_MEDIA_ROOT || "../LibiDiamondsAssets/masters");
const outputRoot = path.join(projectRoot, "public", "try-on", "v4", "rings");
const metals = ["yellow", "white"];
const outputSize = 1024;
const contentSize = Math.round(outputSize * 0.9);

async function loadTryOnManifest() {
  const source = await fs.readFile(path.join(projectRoot, "src", "data", "try-on-manifest.ts"), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  return module.tryOnManifest;
}

function layerMask(entry, layer) {
  const size = outputSize;
  const top = entry.assetAnchor === "top";
  const centerY = top ? size * 0.4 : size * 0.6;
  const ringBandHeight = entry.renderMode === "band-overlay" ? size * 0.29 : size * 0.25;
  const rearY = centerY - size * 0.25;
  const frontY = centerY - ringBandHeight * 0.46;
  const settingRx = entry.renderMode === "band-overlay" ? size * 0.47 : size * 0.39;
  const settingRy = entry.renderMode === "band-overlay" ? size * 0.15 : size * 0.2;

  if (layer === "rear") {
    return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${size * 0.025}" y="${rearY}" width="${size * 0.95}" height="${size * 0.3}" rx="${size * 0.15}" fill="white"/>
    </svg>`);
  }

  if (layer === "front" && entry.renderMode === "band-overlay") {
    return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${size * 0.02}" y="${frontY}" width="${size * 0.96}" height="${ringBandHeight}" rx="${size * 0.14}" fill="white"/>
    </svg>`);
  }

  if (layer === "front") {
    return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <mask id="front-mask">
        <rect x="${size * 0.02}" y="${frontY}" width="${size * 0.96}" height="${ringBandHeight}" rx="${size * 0.14}" fill="white"/>
        <ellipse cx="${size * 0.5}" cy="${centerY}" rx="${settingRx * 0.58}" ry="${settingRy * 1.08}" fill="black"/>
      </mask>
      <rect width="${size}" height="${size}" fill="white" mask="url(#front-mask)"/>
    </svg>`);
  }

  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="${size * 0.5}" cy="${centerY}" rx="${settingRx}" ry="${settingRy}" fill="white"/>
  </svg>`);
}

async function normalizeMaster(input) {
  const trimmed = await sharp(input)
    .ensureAlpha()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const normalized = await sharp(trimmed)
    .resize(contentSize, contentSize, {
      fit: "contain",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: outputSize,
      height: outputSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: normalized, gravity: "center" }]).png().toBuffer();
}

async function alphaBounds(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha < 10) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) return { left: 0, top: 0, right: 0, bottom: 0, widthRatio: 0 };
  return {
    left,
    top,
    right,
    bottom,
    widthRatio: Number(((right - left + 1) / info.width).toFixed(4)),
  };
}

async function createHighlight(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const output = Buffer.alloc(data.length);
  for (let offset = 0; offset < data.length; offset += info.channels) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const alpha = data[offset + 3] / 255;
    const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    const shine = Math.max(0, Math.min(1, (luminance - 175) / 80));
    output[offset] = 255;
    output[offset + 1] = 252;
    output[offset + 2] = 241;
    output[offset + 3] = Math.round(255 * alpha * shine * shine * 0.82);
  }
  return sharp(output, { raw: info })
    .blur(0.35)
    .webp({ quality: 64, alphaQuality: 78, smartSubsample: true, effort: 6 })
    .toBuffer();
}

const manifest = await loadTryOnManifest();
const generated = [];

for (const entry of manifest) {
  const productOutput = path.join(outputRoot, entry.slug);
  await fs.mkdir(productOutput, { recursive: true });
  for (const metal of metals) {
    const source = path.join(masterRoot, entry.slug, metal, "primary.png");
    const normalized = await normalizeMaster(source);
    const layers = entry.renderMode === "band-overlay" ? ["front", "rear"] : ["setting", "front", "rear"];

    for (const layer of layers) {
      const masked = await sharp(normalized)
        .composite([{ input: layerMask(entry, layer), blend: "dest-in" }])
        .webp({ quality: 90, alphaQuality: 100, smartSubsample: true })
        .toBuffer();
      const output = path.join(productOutput, `${metal}-${layer}.webp`);
      await fs.writeFile(output, masked);
      generated.push({
        slug: entry.slug,
        metal,
        layer,
        file: `/try-on/v4/rings/${entry.slug}/${metal}-${layer}.webp`,
        bytes: masked.length,
        bounds: await alphaBounds(masked),
      });
    }

    const highlight = await createHighlight(normalized);
    const highlightOutput = path.join(productOutput, `${metal}-highlight.webp`);
    await fs.writeFile(highlightOutput, highlight);
    generated.push({
      slug: entry.slug,
      metal,
      layer: "highlight",
      file: `/try-on/v4/rings/${entry.slug}/${metal}-highlight.webp`,
      bytes: highlight.length,
      bounds: await alphaBounds(highlight),
    });
  }
}

const manifestPath = path.join(outputRoot, "..", "manifest.json");
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(
  manifestPath,
  `${JSON.stringify({
    version: 4,
    generatedAt: new Date().toISOString(),
    rings: manifest.length,
    size: outputSize,
    contentWidthRatio: 0.9,
    assets: generated,
  }, null, 2)}\n`,
);

console.log(`Prepared ${generated.length} V4 layers for ${manifest.length} rings.`);
