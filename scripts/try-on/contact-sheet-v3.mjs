import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const manifest = JSON.parse(await fs.readFile(path.join(root, "public", "try-on", "v3", "manifest.json"), "utf8"));
const outputRoot = path.join(root, "artifacts", "try-on-v3");
const columns = 7;
const tileWidth = 190;
const tileHeight = 205;
await fs.mkdir(outputRoot, { recursive: true });

for (const metal of ["yellow", "white"]) {
  for (const layer of ["setting", "front", "rear"]) {
    const assets = manifest.assets.filter((asset) => asset.metal === metal && asset.layer === layer);
    const rows = Math.ceil(assets.length / columns);
    const composites = [];
    for (let index = 0; index < assets.length; index += 1) {
      const asset = assets[index];
      const image = await sharp(path.join(root, "public", asset.file)).resize(164, 164, { fit: "contain" }).png().toBuffer();
      const label = Buffer.from(`<svg width="${tileWidth}" height="35" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f7f6f2"/>
        <text x="95" y="22" text-anchor="middle" font-family="Arial" font-size="9" fill="#121313">${asset.slug}</text>
      </svg>`);
      const tile = await sharp({ create: { width: tileWidth, height: tileHeight, channels: 4, background: "#eef0ed" } })
        .composite([{ input: image, left: 13, top: 4 }, { input: label, left: 0, top: 170 }]).png().toBuffer();
      composites.push({ input: tile, left: (index % columns) * tileWidth, top: Math.floor(index / columns) * tileHeight });
    }
    const output = path.join(outputRoot, `${metal}-${layer}.webp`);
    await sharp({ create: { width: columns * tileWidth, height: rows * tileHeight, channels: 4, background: "#fff" } })
      .composite(composites).webp({ quality: 88 }).toFile(output);
    console.log(`Created ${output}`);
  }
}
