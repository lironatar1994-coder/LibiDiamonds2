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
  productMetals,
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
  for (const metal of productMetals(product)) {
    for (const view of product.views) {
      const input = masterPath(product, metal, view);
      if (!(await exists(input))) {
        throw new Error(`Missing master: ${input}`);
      }

      const destination = outputPath(product, metal, view);
      const cacheKey = `${product.slug}-${metal}-${view}`;
      const inputBytes = await readFile(input);
      const fingerprintProfile = {
        renderer: config.renderProfile.version,
        size: config.outputSize,
        maxOutputBytes: config.maxOutputBytes,
        occupancy: targetOccupancy(product, view),
        renderProfile: config.renderProfile,
      };
      const catalogShadow = config.catalogShadows?.[product.category]?.[view];
      if (catalogShadow) {
        fingerprintProfile[product.category === "rings" ? "ringShadow" : "catalogShadow"] = catalogShadow;
      }
      const fingerprint = createHash("sha256")
      .update(inputBytes)
      .update(JSON.stringify(fingerprintProfile))
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

      const resizedSubject = await sharp(input)
      .extract({
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      })
      .resize(width, height, { fit: "fill", kernel: sharp.kernel.lanczos3 })
      .png()
      .toBuffer();

      // Keep the cutout matte untouched while recovering restrained macro
      // detail in diamond facets, pavé, prongs, clasps, links, and metal edges.
      // Sharpening RGB only avoids bright or dark halos along the alpha edge.
      const subjectAlpha = await sharp(resizedSubject)
      .ensureAlpha()
      .extractChannel(3)
      .png()
      .toBuffer();
      const sharpenedRgb = await sharp(resizedSubject)
      .removeAlpha()
      .sharpen(config.renderProfile.sharpen[view])
      .toColourspace("srgb")
      .toBuffer();
      const subject = await sharp(sharpenedRgb)
      .joinChannel(subjectAlpha)
      .png()
      .toBuffer();

      const shadowProfile = config.catalogShadows?.[product.category]?.[view];
      let alphaData;
      let alphaInfo;
      if (shadowProfile) {
        const shadowSource = await sharp({
            create: {
              width: config.outputSize,
              height: config.outputSize,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            },
          })
            .composite([
              {
                input: subject,
                left,
                top: Math.min(config.outputSize - height, top + shadowProfile.offsetY),
              },
            ])
            .raw()
            .toBuffer({ resolveWithObject: true });
        ({ data: alphaData, info: alphaInfo } = await sharp(shadowSource.data, {
          raw: shadowSource.info,
        })
          .extractChannel(3)
          .blur(shadowProfile.blur)
          .raw()
          .toBuffer({ resolveWithObject: true }));
      } else {
        ({ data: alphaData, info: alphaInfo } = await sharp(subject)
          .ensureAlpha()
          .extractChannel(3)
          .blur(view === "detail" ? 13 : 18)
          .raw()
          .toBuffer({ resolveWithObject: true }));
      }
      const shadowPixels = Buffer.alloc(alphaInfo.width * alphaInfo.height * 4);
      const shadowOpacity = shadowProfile?.opacity ?? (view === "detail" ? 0.07 : 0.09);
      const shadowRgb = shadowProfile?.rgb ?? [18, 19, 19];
      for (let pixel = 0; pixel < alphaData.length; pixel += 1) {
        const offset = pixel * 4;
        shadowPixels[offset] = shadowRgb[0];
        shadowPixels[offset + 1] = shadowRgb[1];
        shadowPixels[offset + 2] = shadowRgb[2];
        shadowPixels[offset + 3] = Math.round(alphaData[pixel] * shadowOpacity);
      }
      const shadow = shadowProfile
        ? shadowPixels
        : await sharp(shadowPixels, {
            raw: { width: alphaInfo.width, height: alphaInfo.height, channels: 4 },
          })
            .png()
            .toBuffer();

      const staging = resolve(stagingDirectory, `${product.slug}-${metal}-${view}.webp`);
      const qualities = config.renderProfile.webpQualities;
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
          shadowProfile
            ? {
                input: shadow,
                raw: { width: alphaInfo.width, height: alphaInfo.height, channels: 4 },
                left: 0,
                top: 0,
              }
            : {
                input: shadow,
                left,
                top: Math.min(config.outputSize - height, top + (view === "detail" ? 8 : 14)),
              },
          { input: subject, left, top },
        ])
        .webp({
          quality,
          alphaQuality: 100,
          effort: 6,
          smartSubsample: config.renderProfile.smartSubsample,
        })
        .toFile(staging);

        finalBytes = (await stat(staging)).size;
        if (finalBytes <= config.maxOutputBytes) break;
      }

      if (finalBytes > config.maxOutputBytes) {
        await rm(staging, { force: true });
        throw new Error(
          `Rendered image exceeds ${config.maxOutputBytes} bytes: ${product.slug}-${metal}-${view} (${finalBytes})`,
        );
      }

      await mkdir(dirname(destination), { recursive: true });
      await rm(destination, { force: true });
      await rename(staging, destination);
      cache[cacheKey] = fingerprint;
      await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
      rendered += 1;
      console.log(`Rendered ${product.slug}-${metal}-${view} (${Math.round(finalBytes / 1024)} KB)`);
    }
  }
}

console.log(`Rendered ${rendered} catalog image(s); skipped ${skipped} unchanged image(s).`);
