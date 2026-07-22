import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const sourceDirectory = path.join(projectRoot, "public/images/hero/ivory-gold-v1");
const outputDirectory = path.join(projectRoot, "public/images/hero/ivory-gold-v2");

const variants = {
  mobile: {
    ring: { cx: 475, cy: 770, rx: 340, ry: 245 },
    diamond: { cx: 477, cy: 788, rx: 150, ry: 166 },
  },
  desktop: {
    ring: { cx: 1195, cy: 648, rx: 350, ry: 215 },
    diamond: { cx: 1195, cy: 655, rx: 132, ry: 148 },
  },
};

const treatments = {
  ring: {
    contrast: 1.035,
    offset: -8,
    saturation: 1.015,
    sharpen: { sigma: 0.45, m1: 0.42, m2: 0.82 },
  },
  diamond: {
    contrast: 1.065,
    offset: -14,
    saturation: 0.995,
    sharpen: { sigma: 0.72, m1: 0.96, m2: 1.72 },
  },
};

function radialMask({ width, height, cx, cy, rx, ry }) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <radialGradient id="fade">
          <stop offset="0%" stop-color="#fff" stop-opacity="1" />
          <stop offset="58%" stop-color="#fff" stop-opacity="0.92" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#fade)" />
    </svg>
  `);
}

async function maskedTreatment(source, metadata, maskSpec, treatment) {
  const enhanced = await sharp(source)
    .removeAlpha()
    .modulate({ saturation: treatment.saturation })
    .linear(treatment.contrast, treatment.offset)
    .sharpen(treatment.sharpen)
    .png()
    .toBuffer();
  const alpha = await sharp(
    radialMask({ width: metadata.width, height: metadata.height, ...maskSpec }),
  )
    .extractChannel("alpha")
    .png()
    .toBuffer();

  return sharp(enhanced).joinChannel(alpha).png().toBuffer();
}

await mkdir(outputDirectory, { recursive: true });

for (const [variant, masks] of Object.entries(variants)) {
  const filename = `hero-${variant}.webp`;
  const source = path.join(sourceDirectory, filename);
  const output = path.join(outputDirectory, filename);
  const metadata = await sharp(source).metadata();
  const ringLayer = await maskedTreatment(source, metadata, masks.ring, treatments.ring);
  const diamondLayer = await maskedTreatment(
    source,
    metadata,
    masks.diamond,
    treatments.diamond,
  );

  await sharp(source)
    .composite([
      { input: ringLayer, blend: "over" },
      { input: diamondLayer, blend: "over" },
    ])
    .webp({ quality: 90, smartSubsample: false })
    .toFile(output);

  const outputMetadata = await sharp(output).metadata();
  if (
    outputMetadata.format !== "webp" ||
    outputMetadata.width !== metadata.width ||
    outputMetadata.height !== metadata.height
  ) {
    throw new Error(`Invalid generated hero image: ${filename}`);
  }

  console.log(
    `Generated ${path.relative(projectRoot, output)} (${outputMetadata.width}x${outputMetadata.height})`,
  );
}
