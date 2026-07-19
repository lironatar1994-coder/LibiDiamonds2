import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const outputRoot = path.join(root, "public", "try-on", "v1", "earrings");
const manifest = JSON.parse(await fs.readFile(path.join(outputRoot, "manifest.json"), "utf8"));
const tile = 220;
const columns = 4;
const rows = Math.ceil(manifest.assets.length / columns);
const background = { r: 247, g: 246, b: 242, alpha: 1 };
const composites = [];

for (let index = 0; index < manifest.assets.length; index += 1) {
  const asset = manifest.assets[index];
  const image = await sharp(path.join(root, "public", asset.file))
    .resize(tile - 24, tile - 42, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const label = Buffer.from(`<svg width="${tile}" height="${tile}" xmlns="http://www.w3.org/2000/svg"><text x="12" y="${tile - 12}" font-family="Arial" font-size="11" fill="#343534">${asset.slug}/${asset.metal}-${asset.layer}</text></svg>`);
  composites.push({ input: image, left: (index % columns) * tile + 12, top: Math.floor(index / columns) * tile + 8 });
  composites.push({ input: label, left: (index % columns) * tile, top: Math.floor(index / columns) * tile });
}

await sharp({ create: { width: columns * tile, height: rows * tile, channels: 4, background } })
  .composite(composites)
  .webp({ quality: 88 })
  .toFile(path.join(outputRoot, "contact-sheet.webp"));
console.log("Created earring try-on contact sheet.");
