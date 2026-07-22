import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const sourceDirectory = path.join(projectRoot, "public/images/products/catalog");
const outputDirectory = path.join(projectRoot, "public/images/editorial/home-signatures");

const signatures = [
  ["aura-solitaire-ring", "yellow"],
  ["elara-oval-hidden-halo-ring", "yellow"],
  ["atelier-emerald-cathedral-ring", "white"],
  ["seren-pear-solitaire-ring", "white"],
];

await mkdir(outputDirectory, { recursive: true });

for (const [slug, metal] of signatures) {
  for (const view of ["primary", "detail"]) {
    const filename = `${slug}-${metal}-${view}.webp`;
    const source = path.join(sourceDirectory, filename);
    const output = path.join(outputDirectory, filename);

    const pipeline = sharp(source).ensureAlpha();

    if (metal === "white") {
      pipeline
        .modulate({ brightness: 1.004, saturation: 0.99 })
        .linear(1.085, -7)
        .sharpen({ sigma: 0.78, m1: 1, m2: 1.9 });
    } else {
      pipeline
        .modulate({ brightness: 1.012, saturation: 1.035 })
        .linear(1.035, -3)
        .sharpen({ sigma: 0.72, m1: 0.85, m2: 1.65 });
    }

    await pipeline
      .webp({ quality: 92, alphaQuality: 100, smartSubsample: false })
      .toFile(output);

    console.log(`Generated ${path.relative(projectRoot, output)}`);
  }
}
