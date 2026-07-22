import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const manifest = JSON.parse(await fs.readFile(path.join(root, "public", "try-on", "v2", "manifest.json"), "utf8"));
const outputRoot = path.join(root, "artifacts", "try-on");
const columns = 5;
const tileWidth = 260;
const tileHeight = 270;

await fs.mkdir(outputRoot, { recursive: true });

for (const metal of ["yellow", "white"]) {
  const assets = manifest.assets.filter((asset) => asset.metal === metal);
  const rows = Math.ceil(assets.length / columns);
  const composites = [];
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    const image = await sharp(path.join(root, "public", asset.file))
      .resize(218, 218, { fit: "contain" })
      .png()
      .toBuffer();
    const label = Buffer.from(`
      <svg width="${tileWidth}" height="42" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f7f6f2"/>
        <text x="130" y="18" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#121313">${asset.slug}</text>
        <text x="130" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#686b69">${asset.renderMode}</text>
      </svg>
    `);
    const tile = await sharp({
      create: { width: tileWidth, height: tileHeight, channels: 4, background: "#eef0ed" },
    })
      .composite([
        { input: image, left: 21, top: 8 },
        { input: label, left: 0, top: 228 },
      ])
      .png()
      .toBuffer();
    composites.push({
      input: tile,
      left: (index % columns) * tileWidth,
      top: Math.floor(index / columns) * tileHeight,
    });
  }
  const output = path.join(outputRoot, `${metal}-contact-sheet.webp`);
  await sharp({
    create: {
      width: columns * tileWidth,
      height: rows * tileHeight,
      channels: 4,
      background: "#ffffff",
    },
  }).composite(composites).webp({ quality: 88 }).toFile(output);
  console.log(`Created ${output}`);
}
