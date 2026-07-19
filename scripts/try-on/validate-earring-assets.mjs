import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const manifestPath = path.join(root, "public", "try-on", "v1", "earrings", "manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const failures = [];
const groups = new Map();

if (manifest.version !== 1) failures.push("manifest version is not 1");
if (manifest.earrings !== 7) failures.push(`expected 7 earrings, found ${manifest.earrings}`);
if (manifest.assets.length !== 20) failures.push(`expected 20 assets, found ${manifest.assets.length}`);

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
    if (stat.size > 240 * 1024) failures.push(`${key}/${asset.layer}: exceeds 240KB`);
    if (coverage < 0.004 || coverage > 0.42) failures.push(`${key}/${asset.layer}: implausible alpha coverage ${coverage.toFixed(3)}`);
    const corners = [3, (info.width - 1) * info.channels + 3, ((info.height - 1) * info.width) * info.channels + 3, (info.width * info.height - 1) * info.channels + 3];
    if (corners.some((index) => data[index] > 8)) failures.push(`${key}/${asset.layer}: opaque corner`);
  } catch (error) {
    failures.push(`${key}/${asset.layer}: ${error instanceof Error ? error.message : "missing"}`);
  }
}

if (groups.size !== 14) failures.push(`expected 14 product/metal groups, found ${groups.size}`);
for (const [key, assets] of groups) {
  const layers = new Set(assets.map((asset) => asset.layer));
  if (!layers.has("front")) failures.push(`${key}: missing front layer`);
  const total = assets.reduce((sum, asset) => sum + asset.bytes, 0);
  if (total > 420 * 1024) failures.push(`${key}: payload exceeds 420KB`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  throw new Error(`${failures.length} earring asset validation issue(s)`);
}
console.log(`Validated ${manifest.earrings} earrings, ${manifest.assets.length} layers and ${groups.size} metal payloads.`);
