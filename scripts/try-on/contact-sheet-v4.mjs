import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const manifest = JSON.parse(await fs.readFile(path.join(root, "public", "try-on", "v4", "manifest.json"), "utf8"));
const outputRoot = path.join(root, "artifacts", "try-on-v4");
const columns = 7;
const tileWidth = 190;
const tileHeight = 215;
await fs.mkdir(outputRoot, { recursive: true });

for (const metal of ["yellow", "white"]) {
  const groups = [...new Set(manifest.assets.filter((asset) => asset.metal === metal).map((asset) => asset.slug))];
  const rows = Math.ceil(groups.length / columns);
  const composites = [];
  for (let index = 0; index < groups.length; index += 1) {
    const slug = groups[index];
    const layer = (name) => manifest.assets.find((asset) => asset.slug === slug && asset.metal === metal && asset.layer === name);
    const readLayer = async (name) => {
      const asset = layer(name);
      return asset ? sharp(path.join(root, "public", asset.file)).resize(172, 172, { fit: "contain" }).png().toBuffer() : null;
    };
    const [rear, front, setting] = await Promise.all([readLayer("rear"), readLayer("front"), readLayer("setting")]);
    const finger = Buffer.from(`<svg width="172" height="172" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="skin" x1="0" x2="1"><stop stop-color="#d5a07c"/><stop offset="0.52" stop-color="#efc2a2"/><stop offset="1" stop-color="#c98e6d"/></linearGradient></defs>
      <rect x="65" y="-12" width="44" height="196" rx="22" fill="url(#skin)"/>
    </svg>`);
    const label = Buffer.from(`<svg width="${tileWidth}" height="35" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f7f6f2"/>
      <text x="95" y="22" text-anchor="middle" font-family="Arial" font-size="9" fill="#121313">${slug}</text>
    </svg>`);
    const layers = [];
    if (rear) layers.push({ input: rear, left: 9, top: 4 });
    layers.push({ input: finger, left: 9, top: 4 });
    if (front) layers.push({ input: front, left: 9, top: 4 });
    if (setting) layers.push({ input: setting, left: 9, top: 4 });
    layers.push({ input: label, left: 0, top: 180 });
    const tile = await sharp({ create: { width: tileWidth, height: tileHeight, channels: 4, background: "#e8e9e6" } })
      .composite(layers).png().toBuffer();
    composites.push({ input: tile, left: (index % columns) * tileWidth, top: Math.floor(index / columns) * tileHeight });
  }
  const output = path.join(outputRoot, `${metal}-composite.webp`);
  await sharp({ create: { width: columns * tileWidth, height: rows * tileHeight, channels: 4, background: "#fff" } })
    .composite(composites).webp({ quality: 90 }).toFile(output);
  console.log(`Created ${output}`);
}
