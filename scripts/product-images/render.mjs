import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";
import {
  alphaBounds,
  config,
  ensureDirectories,
  exists,
  masterPath,
  outputDirectory,
  outputPath,
  projectRoot,
  selectedProducts,
  targetOccupancy,
} from "./common.mjs";

await ensureDirectories();
const stagingDirectory = resolve(outputDirectory, ".staging");
await mkdir(stagingDirectory, { recursive: true });
const cacheDirectory = resolve(projectRoot, ".media-cache");
const cachePath = resolve(cacheDirectory, "render-state.json");
await mkdir(cacheDirectory, { recursive: true });
let cache = {};
try {
  cache = JSON.parse(await readFile(cachePath, "utf8"));
} catch {
  cache = {};
}

let rendered = 0;
let skipped = 0;

for (const product of selectedProducts()) {
  for (const view of product.views) {
    const input = masterPath(product, view);
    if (!(await exists(input))) {
      throw new Error(`Missing master: ${input}`);
    }

    const destination = outputPath(product, view);
    const cacheKey = `${product.slug}-${view}`;
    const inputBytes = await readFile(input);
    const fingerprint = createHash("sha256")
      .update(inputBytes)
      .update(JSON.stringify({
        renderer: 2,
        size: config.outputSize,
        maxOutputBytes: config.maxOutputBytes,
        occupancy: targetOccupancy(product, view),
      }))
      .digest("hex");
    if (cache[cacheKey] === fingerprint && (await exists(destination))) {
      skipped += 1;
      console.log(`Unchanged ${cacheKey}`);
      continue;
    }

    const metadata = await sharp(input).metadata();
    if (!metadata.hasAlpha) {
      throw new Error(`Master must have an alpha channel: ${input}`);
    }

    const minimumSize = product.legacyResolution ? 1600 : config.minimumMasterSize;
    if ((metadata.width || 0) < minimumSize || (metadata.height || 0) < minimumSize) {
      throw new Error(
        `Master is below ${minimumSize}x${minimumSize}: ${input} (${metadata.width}x${metadata.height})`,
      );
    }

    const bounds = await alphaBounds(input);
    const target = targetOccupancy(product, view);
    const targetLongestEdge = Math.round(config.outputSize * target);
    const scale = targetLongestEdge / Math.max(bounds.width, bounds.height);
    const width = Math.max(1, Math.round(bounds.width * scale));
    const height = Math.max(1, Math.round(bounds.height * scale));
    const left = Math.round((config.outputSize - width) / 2);
    const top = Math.round((config.outputSize - height) / 2);

    const subject = await sharp(input)
      .extract({
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      })
      .resize(width, height, { fit: "fill", kernel: sharp.kernel.lanczos3 })
      .png()
      .toBuffer();

    const { data: alphaData, info: alphaInfo } = await sharp(subject)
      .ensureAlpha()
      .extractChannel(3)
      .blur(view === "detail" ? 13 : 18)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const shadowPixels = Buffer.alloc(alphaInfo.width * alphaInfo.height * 4);
    const shadowOpacity = view === "detail" ? 0.07 : 0.09;
    for (let pixel = 0; pixel < alphaData.length; pixel += 1) {
      const offset = pixel * 4;
      shadowPixels[offset] = 18;
      shadowPixels[offset + 1] = 19;
      shadowPixels[offset + 2] = 19;
      shadowPixels[offset + 3] = Math.round(alphaData[pixel] * shadowOpacity);
    }
    const shadow = await sharp(shadowPixels, {
      raw: { width: alphaInfo.width, height: alphaInfo.height, channels: 4 },
    })
      .png()
      .toBuffer();

    const staging = resolve(stagingDirectory, `${product.slug}-${view}.webp`);
    const qualities = [92, 90, 88, 86, 84];
    let finalBytes = Number.POSITIVE_INFINITY;

    for (const quality of qualities) {
      await sharp({
        create: {
          width: config.outputSize,
          height: config.outputSize,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([
          {
            input: shadow,
            left,
            top: Math.min(config.outputSize - height, top + (view === "detail" ? 8 : 14)),
          },
          { input: subject, left, top },
        ])
        .webp({ quality, alphaQuality: 100, effort: 6, smartSubsample: true })
        .toFile(staging);

      finalBytes = (await stat(staging)).size;
      if (finalBytes <= config.maxOutputBytes) break;
    }

    if (finalBytes > config.maxOutputBytes) {
      await rm(staging, { force: true });
      throw new Error(
        `Rendered image exceeds ${config.maxOutputBytes} bytes: ${product.slug}-${view} (${finalBytes})`,
      );
    }

    await mkdir(dirname(destination), { recursive: true });
    await rm(destination, { force: true });
    await rename(staging, destination);
    cache[cacheKey] = fingerprint;
    await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
    rendered += 1;
    console.log(`Rendered ${product.slug}-${view} (${Math.round(finalBytes / 1024)} KB)`);
  }
}

console.log(`Rendered ${rendered} catalog image(s); skipped ${skipped} unchanged image(s).`);
