import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const manifest = JSON.parse(await fs.readFile(path.join(root, "public", "try-on", "v1", "bracelets", "manifest.json"), "utf8"));
const failures = [];
const groups = new Map();

if (manifest.version !== 1) failures.push("manifest version is not 1");
if (manifest.bracelets !== 11) failures.push(`expected 11 bracelets, found ${manifest.bracelets}`);

for (const asset of manifest.assets) {
  const key = `${asset.slug}/${asset.metal}`;
  const group = groups.get(key) ?? [];
  group.push(asset);
  groups.set(key, group);
  const file = path.join(root, "public", asset.file);
  try {
    const stat = await fs.stat(file);
    const metadata = await sharp(file).metadata();
    const { data, info } = await sharp(file).resize(64, 64).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let alpha = 0;
    for (let index = 3; index < data.length; index += info.channels) alpha += data[index] / 255;
    const coverage = alpha / (info.width * info.height);
    if (metadata.width !== 768 || metadata.height !== 768) failures.push(`${key}/${asset.layer}: expected 768x768`);
    if (!metadata.hasAlpha || metadata.channels !== 4) failures.push(`${key}/${asset.layer}: missing alpha`);
    if (stat.size > 250 * 1024) failures.push(`${key}/${asset.layer}: exceeds 250KB`);
    if (coverage < 0.003 || coverage > 0.45) failures.push(`${key}/${asset.layer}: implausible alpha coverage ${coverage.toFixed(3)}`);
    const corners = [3, (info.width - 1) * info.channels + 3, ((info.height - 1) * info.width) * info.channels + 3, (info.width * info.height - 1) * info.channels + 3];
    if (corners.some((index) => data[index] > 8)) failures.push(`${key}/${asset.layer}: opaque corner`);
  } catch (error) {
    failures.push(`${key}/${asset.layer}: ${error instanceof Error ? error.message : "missing"}`);
  }
}

if (groups.size !== 22) failures.push(`expected 22 product/metal groups, found ${groups.size}`);
for (const [key, assets] of groups) {
  const layers = new Set(assets.map((asset) => asset.layer));
  if (!layers.has("front") || !layers.has("rear")) failures.push(`${key}: incomplete layer pair`);
  const total = assets.reduce((sum, asset) => sum + asset.bytes, 0);
  if (total > 500 * 1024) failures.push(`${key}: payload exceeds 500KB`);
  const front = assets.find((asset) => asset.layer === "front");
  const rear = assets.find((asset) => asset.layer === "rear");
  if (front && rear) {
    const frontStats = await sharp(path.join(root, "public", front.file)).stats();
    const rearStats = await sharp(path.join(root, "public", rear.file)).stats();
    const frontAlpha = frontStats.channels[3]?.mean ?? 0;
    const rearAlpha = rearStats.channels[3]?.mean ?? 0;
    if (Math.abs(frontAlpha - rearAlpha) < 0.02 && front.bytes === rear.bytes) {
      failures.push(`${key}: front and rear layers appear identical`);
    }
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  throw new Error(`${failures.length} bracelet asset validation issue(s)`);
}
console.log(`Validated ${manifest.bracelets} bracelets, ${manifest.assets.length} layers and ${groups.size} metal payloads.`);
