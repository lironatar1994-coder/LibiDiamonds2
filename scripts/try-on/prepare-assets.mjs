import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..", "..");
const masterRoot = path.resolve(projectRoot, "..", "LibiDiamondsAssets", "masters", "aura-solitaire-ring");
const outputRoot = path.join(projectRoot, "public", "try-on", "v1", "rings", "aura");

const variants = ["yellow", "white"];
const size = 1200;

for (const metal of variants) {
  const source = path.join(masterRoot, metal, "primary.png");
  const prepared = await sharp(source)
    .resize(size, size, { fit: "contain" })
    .ensureAlpha()
    .png()
    .toBuffer();

  const foregroundMask = Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 700 H${size} V${size} H0 Z" fill="white"/>
      <ellipse cx="600" cy="765" rx="245" ry="275" fill="white"/>
    </svg>
  `);

  await sharp(prepared)
    .webp({ quality: 92, alphaQuality: 100, smartSubsample: true })
    .toFile(path.join(outputRoot, `${metal}-rear.webp`));

  await sharp(prepared)
    .composite([{ input: foregroundMask, blend: "dest-in" }])
    .webp({ quality: 92, alphaQuality: 100, smartSubsample: true })
    .toFile(path.join(outputRoot, `${metal}-front.webp`));
}

console.log(`Prepared Aura try-on assets in ${outputRoot}`);
