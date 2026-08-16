import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const assetLibraryRoot = process.env.LIBI_MEDIA_ROOT
  ? path.resolve(process.env.LIBI_MEDIA_ROOT)
  : path.resolve(projectRoot, "../LibiDiamondsAssets");
const sourceDirectory = path.join(assetLibraryRoot, "generated/catalog-rings");
const outputDirectory = path.join(projectRoot, "public/images/editorial/home-signatures");

const signatures = [
  ["aura-solitaire-ring", "yellow"],
  ["elara-oval-hidden-halo-ring", "yellow"],
  ["atelier-emerald-cathedral-ring", "white"],
  ["seren-pear-solitaire-ring", "white"],
];

await mkdir(outputDirectory, { recursive: true });

for (const [slug, metal] of signatures) {
  const source = path.join(
    sourceDirectory,
    `${slug}-${metal}-homepage-v3-native.png`,
  );
  const output = path.join(
    outputDirectory,
    `${slug}-${metal}-homepage-v3.webp`,
  );

  await sharp(source)
    .webp({ quality: 94, smartSubsample: false })
    .toFile(output);

  console.log(`Generated ${path.relative(projectRoot, output)}`);
}
