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

    const alpha = await sharp(source)
      .ensureAlpha()
      .extractChannel(3)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pipeline = sharp(source).removeAlpha();

    if (metal === "white") {
      pipeline
        .modulate({ brightness: 1.004, saturation: 0.99 })
        .linear(1.085, -7);
    } else {
      pipeline
        .modulate({ brightness: 1.012, saturation: 1.035 })
        .linear(1.035, -3);
    }

    await pipeline
      // Catalog sources already carry the approved jewelry detail pass. Keeping
      // alpha outside the grade preserves clean cutout edges on the dark home mix.
      .joinChannel(alpha.data, {
        raw: {
          width: alpha.info.width,
          height: alpha.info.height,
          channels: 1,
        },
      })
      .webp({ quality: 96, alphaQuality: 100, smartSubsample: false })
      .toFile(output);

    console.log(`Generated ${path.relative(projectRoot, output)}`);
  }
}
