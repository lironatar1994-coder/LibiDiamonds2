import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..", "..");
const masterRoot = path.resolve(projectRoot, "..", "LibiDiamondsAssets", "masters", "aura-solitaire-ring");
const outputRoot = path.join(projectRoot, "public", "try-on", "v2", "rings", "aura");

const variants = ["yellow", "white"];
const size = 1200;

await fs.mkdir(outputRoot, { recursive: true });

for (const metal of variants) {
  const source = path.join(masterRoot, metal, "primary.png");
  const prepared = await sharp(source)
    .resize(size, size, { fit: "contain" })
    .ensureAlpha()
    .png()
    .toBuffer();

  const headMask = Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="600" cy="725" rx="150" ry="158" fill="white"/>
    </svg>
  `);

  const maskedHead = await sharp(prepared)
    .composite([{ input: headMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  await sharp(maskedHead)
    .extract({ left: 400, top: 525, width: 400, height: 400 })
    .resize(512, 512, { fit: "fill" })
    .webp({ quality: 92, alphaQuality: 100, smartSubsample: true })
    .toFile(path.join(outputRoot, `${metal}-head.webp`));
}

console.log(`Prepared Aura try-on assets in ${outputRoot}`);
