import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const manifestPath = path.join(root, "public", "try-on", "v4", "manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const failures = [];

if (manifest.version !== 4) failures.push("manifest version is not 4");
if (manifest.rings !== 49) failures.push(`expected 49 rings, found ${manifest.rings}`);
if (manifest.assets.length !== 376) failures.push(`expected 376 layers, found ${manifest.assets.length}`);

const grouped = new Map();
for (const asset of manifest.assets) {
  const key = `${asset.slug}/${asset.metal}`;
  const group = grouped.get(key) ?? [];
  group.push(asset);
  grouped.set(key, group);
  const file = path.join(root, "public", asset.file);
  try {
    const stat = await fs.stat(file);
    const metadata = await sharp(file).metadata();
    const { data, info } = await sharp(file).resize(64, 64, { fit: "fill" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let alpha = 0;
    for (let index = 3; index < data.length; index += info.channels) alpha += data[index] / 255;
    const coverage = alpha / (info.width * info.height);
    if (metadata.width !== 1024 || metadata.height !== 1024) failures.push(`${key}/${asset.layer}: expected 1024x1024`);
    if (!metadata.hasAlpha || metadata.channels !== 4) failures.push(`${key}/${asset.layer}: missing alpha`);
    if (stat.size !== asset.bytes) failures.push(`${key}/${asset.layer}: manifest byte count is stale`);
    if (stat.size > 280 * 1024) failures.push(`${key}/${asset.layer}: exceeds 280KB`);
    const minimumCoverage = asset.layer === "highlight" ? 0.001 : asset.layer === "front" ? 0.0005 : 0.002;
    if (coverage < minimumCoverage || coverage > 0.76) failures.push(`${key}/${asset.layer}: implausible alpha coverage ${coverage.toFixed(3)}`);
    const corners = [3, (info.width - 1) * info.channels + 3, ((info.height - 1) * info.width) * info.channels + 3, (info.width * info.height - 1) * info.channels + 3];
    if (corners.some((index) => data[index] > 8)) failures.push(`${key}/${asset.layer}: opaque corner`);
    if (!asset.bounds || asset.bounds.widthRatio < 0.08 || asset.bounds.widthRatio > 0.99) failures.push(`${key}/${asset.layer}: invalid content bounds`);
  } catch (error) {
    failures.push(`${key}/${asset.layer}: ${error instanceof Error ? error.message : "missing"}`);
  }
}

if (grouped.size !== 98) failures.push(`expected 98 ring/metal groups, found ${grouped.size}`);
for (const [key, assets] of grouped) {
  const total = assets.reduce((sum, asset) => sum + asset.bytes, 0);
  if (total > 650 * 1024) failures.push(`${key}: selected-metal payload exceeds 650KB`);
  const layers = new Set(assets.map((asset) => asset.layer));
  for (const required of ["front", "rear", "highlight"]) {
    if (!layers.has(required)) failures.push(`${key}: missing ${required} layer`);
  }
  if (assets.length !== 3 && assets.length !== 4) failures.push(`${key}: expected three or four layers`);
}

try {
  const model = await fs.stat(path.join(root, "public", "try-on", "v4", "models", "magic_touch.tflite"));
  if (model.size < 5 * 1024 * 1024 || model.size > 8 * 1024 * 1024) failures.push(`MagicTouch model has unexpected size ${model.size}`);
} catch {
  failures.push("MagicTouch model is missing");
}

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  throw new Error(`${failures.length} V4 validation issue(s)`);
}

console.log(`Validated ${manifest.rings} rings, ${manifest.assets.length} aligned layers, 98 metal payloads and the local segmentation model.`);
