import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const manifestPath = path.join(root, "public", "try-on", "v3", "manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const failures = [];

if (manifest.version !== 3) failures.push("manifest version is not 3");
if (manifest.rings !== 49) failures.push(`expected 49 rings, found ${manifest.rings}`);

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
    if (metadata.width !== 768 || metadata.height !== 768) failures.push(`${key}/${asset.layer}: expected 768x768`);
    if (!metadata.hasAlpha || metadata.channels !== 4) failures.push(`${key}/${asset.layer}: missing alpha`);
    if (stat.size > 250 * 1024) failures.push(`${key}/${asset.layer}: exceeds 250KB`);
    const minimumCoverage = asset.layer === "front" ? 0 : asset.layer === "rear" ? 0.001 : 0.004;
    if (coverage < minimumCoverage || coverage > 0.72) failures.push(`${key}/${asset.layer}: implausible alpha coverage ${coverage.toFixed(3)}`);
    const corners = [3, (info.width - 1) * info.channels + 3, ((info.height - 1) * info.width) * info.channels + 3, (info.width * info.height - 1) * info.channels + 3];
    if (corners.some((index) => data[index] > 8)) failures.push(`${key}/${asset.layer}: opaque corner`);
  } catch (error) {
    failures.push(`${key}/${asset.layer}: ${error instanceof Error ? error.message : "missing"}`);
  }
}

if (grouped.size !== 98) failures.push(`expected 98 ring/metal groups, found ${grouped.size}`);
for (const [key, assets] of grouped) {
  const total = assets.reduce((sum, asset) => sum + asset.bytes, 0);
  if (total > 500 * 1024) failures.push(`${key}: selected-metal payload exceeds 500KB`);
  const layers = new Set(assets.map((asset) => asset.layer));
  if (!layers.has("setting") && !(layers.has("front") && layers.has("rear"))) failures.push(`${key}: incomplete layer set`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  throw new Error(`${failures.length} V3 validation issue(s)`);
}

console.log(`Validated ${manifest.rings} rings, ${manifest.assets.length} layers and 98 metal payloads.`);
