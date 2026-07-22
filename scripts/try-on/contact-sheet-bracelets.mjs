import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const manifest = JSON.parse(await fs.readFile(path.join(root, "public", "try-on", "v1", "bracelets", "manifest.json"), "utf8"));
const outputRoot = path.join(root, "artifacts", "try-on-bracelets");
const columns = 4;
const tileWidth = 240;
const tileHeight = 225;
await fs.mkdir(outputRoot, { recursive: true });

for (const metal of ["yellow", "white"]) {
  for (const layer of ["front", "rear"]) {
    const assets = manifest.assets.filter((asset) => asset.metal === metal && asset.layer === layer);
    const rows = Math.ceil(assets.length / columns);
    const composites = [];
    for (let index = 0; index < assets.length; index += 1) {
      const asset = assets[index];
      const image = await sharp(path.join(root, "public", asset.file)).resize(200, 180, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      }).png().toBuffer();
      const label = Buffer.from(`<svg width="${tileWidth}" height="34" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f7f6f2"/><text x="120" y="21" text-anchor="middle" font-family="Arial" font-size="10" fill="#121313">${asset.slug}</text></svg>`);
      const tile = await sharp({ create: { width: tileWidth, height: tileHeight, channels: 4, background: "#eef0ed" } })
        .composite([{ input: image, left: 20, top: 4 }, { input: label, left: 0, top: 188 }]).png().toBuffer();
      composites.push({ input: tile, left: (index % columns) * tileWidth, top: Math.floor(index / columns) * tileHeight });
    }
    const output = path.join(outputRoot, `${metal}-${layer}.webp`);
    await sharp({ create: { width: columns * tileWidth, height: rows * tileHeight, channels: 4, background: "#fff" } })
      .composite(composites).webp({ quality: 88 }).toFile(output);
    console.log(`Created ${output}`);
  }
}
