import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const sourceDirectory = path.join(
  projectRoot,
  "public/images/editorial/categories/v5-ivory-atelier",
);
const outputDirectory = path.join(
  projectRoot,
  "public/images/editorial/categories/v6-ivory-depth",
);

const categories = {
  rings: {
    contrast: 1.07,
    offset: -16,
    saturation: 1.025,
    sharpen: { sigma: 0.62, m1: 0.78, m2: 1.4 },
  },
  earrings: {
    contrast: 1.08,
    offset: -18,
    saturation: 1.03,
    sharpen: { sigma: 0.68, m1: 0.86, m2: 1.55 },
  },
  bracelets: {
    contrast: 1.07,
    offset: -16,
    saturation: 1.025,
    sharpen: { sigma: 0.64, m1: 0.82, m2: 1.45 },
  },
  necklaces: {
    contrast: 1.065,
    offset: -14,
    saturation: 1.02,
    sharpen: { sigma: 0.6, m1: 0.76, m2: 1.35 },
  },
};

await mkdir(outputDirectory, { recursive: true });

for (const [category, treatment] of Object.entries(categories)) {
  const filename = `${category}-yellow-gold.webp`;
  const source = path.join(sourceDirectory, filename);
  const output = path.join(outputDirectory, filename);
  const sourceMetadata = await sharp(source).metadata();

  await sharp(source)
    .modulate({ saturation: treatment.saturation })
    .linear(treatment.contrast, treatment.offset)
    .sharpen(treatment.sharpen)
    .webp({ quality: 90, smartSubsample: false })
    .toFile(output);

  const outputMetadata = await sharp(output).metadata();
  if (
    outputMetadata.format !== "webp" ||
    outputMetadata.width !== sourceMetadata.width ||
    outputMetadata.height !== sourceMetadata.height
  ) {
    throw new Error(`Invalid generated category image: ${filename}`);
  }

  console.log(
    `Generated ${path.relative(projectRoot, output)} (${outputMetadata.width}x${outputMetadata.height})`,
  );
}
