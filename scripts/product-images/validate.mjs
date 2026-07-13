import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import {
  config,
  ensureDirectories,
  exists,
  inspectImage,
  outputPath,
  productMetals,
  reportDirectory,
  selectedProducts,
} from "./common.mjs";

await ensureDirectories();
const strict = process.argv.includes("--strict");
const results = [];
let failures = 0;

async function colorCastWarning(path) {
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .resize(400, 400, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];
    const maximum = Math.max(r, g, b);
    const minimum = Math.min(r, g, b);
    if (a > 220 && maximum > 175 && maximum - minimum < 55) {
      red += r;
      green += g;
      blue += b;
      count += 1;
    }
  }

  if (count < 40) return undefined;
  const average = { r: red / count, g: green / count, b: blue / count };
  if (average.b - average.r > 14) return "possible-blue-cast";
  if (average.r - average.b > 18) return "possible-warm-cast";
  return undefined;
}

for (const product of selectedProducts()) {
  for (const metal of productMetals(product)) {
    for (const view of product.views) {
      const path = outputPath(product, metal, view);
      const errors = [];
      const warnings = [];

      if (!(await exists(path))) {
        if (strict) {
          errors.push("missing-output");
          failures += 1;
        }
        results.push({ slug: product.slug, metal, view, status: "missing", errors, warnings });
        continue;
      }

      const image = await inspectImage(path, product, view);
    if (image.width !== config.outputSize || image.height !== config.outputSize) {
      errors.push("wrong-dimensions");
    }
    if (!image.hasAlpha) errors.push("missing-alpha");
    if (image.bytes > config.maxOutputBytes) errors.push("file-too-large");
    if (Math.abs(image.occupancy - image.targetOccupancy) > config.occupancyTolerance) {
      errors.push("wrong-product-scale");
    }
    if (Math.min(...Object.values(image.margins)) < config.edgePadding) {
      errors.push("subject-too-close-to-edge");
    }

    const cast = await colorCastWarning(path);
    if (cast) warnings.push(cast);
    warnings.push("manual-primary-detail-identity-review-required");

      if (errors.length > 0) failures += 1;
      results.push({
      slug: product.slug,
      category: product.category,
      metal,
      view,
      status: errors.length === 0 ? "pass" : "fail",
      errors,
      warnings,
      bytes: image.bytes,
      occupancy: Number(image.occupancy.toFixed(4)),
      targetOccupancy: image.targetOccupancy,
      margins: image.margins,
      });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  catalogBackground: config.catalogBackground,
  failures,
  images: results,
};
await writeFile(
  `${reportDirectory}/catalog-validation.json`,
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

for (const result of results) {
  console.log(
    `${result.status.toUpperCase()} ${result.slug}-${result.metal}-${result.view}` +
      (result.errors.length ? `: ${result.errors.join(", ")}` : ""),
  );
}

if (failures > 0) {
  throw new Error(`${failures} catalog image(s) failed validation.`);
}

console.log(`Validated ${results.length} catalog image(s).`);
