import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..", "..");
const masterRoot = path.resolve(
  projectRoot,
  process.env.LIBI_MEDIA_ROOT || "../LibiDiamondsAssets/masters",
);
const outputRoot = path.join(projectRoot, "public", "try-on", "v2", "rings");
const metals = ["yellow", "white"];

async function loadTryOnManifest() {
  const sourcePath = path.join(projectRoot, "src", "data", "try-on-manifest.ts");
  const source = await fs.readFile(sourcePath, "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
  return module.tryOnManifest;
}

function maskFor(entry, size) {
  const { renderMode, assetAnchor = "bottom", assetCrop } = entry;
  if (renderMode === "generated-band") {
    return Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="${size * 0.5}" cy="${size * 0.604}" rx="${size * 0.13}" ry="${size * 0.135}" fill="white"/>
      </svg>
    `);
  }
  if (assetCrop === "side-strip") {
    return Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect x="${size * 0.25}" y="${size * 0.12}" width="${size * 0.31}" height="${size * 0.76}" rx="${size * 0.14}" fill="white"/>
      </svg>
    `);
  }
  if (renderMode === "band-overlay") {
    const y = assetAnchor === "top" ? 0.14 : 0.52;
    return Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect x="${size * 0.04}" y="${size * y}" width="${size * 0.92}" height="${size * 0.4}" rx="${size * 0.18}" fill="white"/>
      </svg>
    `);
  }
  const centerY = assetAnchor === "top" ? 0.4 : 0.6;
  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="${size * 0.5}" cy="${size * centerY}" rx="${size * 0.4}" ry="${size * 0.21}" fill="white"/>
    </svg>
  `);
}

async function normalizeSquare(input, outputSize) {
  const trimmed = await sharp(input)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const metadata = await sharp(trimmed).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Empty alpha bounds after masking");
  const padding = Math.round(outputSize * 0.08);
  const innerSize = outputSize - padding * 2;
  const normalized = await sharp(trimmed)
    .resize(innerSize, innerSize, {
      fit: "contain",
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
  })
    .composite([{ input: normalized, left: padding, top: padding }])
    .webp({ quality: 90, alphaQuality: 100, smartSubsample: true })
    .toBuffer();
}

const manifest = await loadTryOnManifest();
const generated = [];

for (const entry of manifest) {
  const productOutput = path.join(outputRoot, entry.slug);
  await fs.mkdir(productOutput, { recursive: true });
  for (const metal of metals) {
    const source = path.join(masterRoot, entry.slug, metal, "primary.png");
    const metadata = await sharp(source).metadata();
    if (!metadata.width || !metadata.height || metadata.width !== metadata.height) {
      throw new Error(`${entry.slug}/${metal}: expected a square master`);
    }
    const prepared = await sharp(source).ensureAlpha().png().toBuffer();
    let masked = await sharp(prepared)
      .composite([{ input: maskFor(entry, metadata.width), blend: "dest-in" }])
      .png()
      .toBuffer();
    if (entry.assetCrop === "side-strip") {
      masked = await sharp(masked).rotate(90).png().toBuffer();
    }
    const size = entry.renderMode === "generated-band" ? 512 : 768;
    const kind = entry.renderMode === "generated-band" ? "head" : "overlay";
    const outputName = `${metal}-${kind}.webp`;
    const output = path.join(productOutput, outputName);
    const buffer = await normalizeSquare(masked, size);
    await fs.writeFile(output, buffer);
    generated.push({
      slug: entry.slug,
      metal,
      renderMode: entry.renderMode,
      file: `/try-on/v2/rings/${entry.slug}/${outputName}`,
      width: size,
      height: size,
      bytes: buffer.length,
    });
  }
}

await fs.mkdir(path.join(outputRoot, ".."), { recursive: true });
await fs.writeFile(
  path.join(outputRoot, "..", "manifest.json"),
  `${JSON.stringify({ version: 2, generatedAt: new Date().toISOString(), assets: generated }, null, 2)}\n`,
);

console.log(`Prepared ${generated.length} try-on assets for ${manifest.length} rings.`);
